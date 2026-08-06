package com.banque.archives.service;

import com.banque.archives.exception.BusinessException;
import com.banque.archives.exception.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/jpeg",
            "image/png",
            "image/tiff"
    );

    private final Path storageRoot;
    private final Set<String> allowedExtensions;

    public FileStorageService(
            @Value("${application.storage.upload-dir:uploads}") String uploadDir,
            @Value("${application.archives.allowed-file-types:pdf,jpg,jpeg,png,tiff,doc,docx,xls,xlsx,zip}") String allowedFileTypes
    ) {
        this.storageRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.allowedExtensions = Arrays.stream(allowedFileTypes.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(Collectors.toUnmodifiableSet());
    }

    public StoredFile storeArchiveFile(MultipartFile file, String archiveId, String uploadedBy) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Aucun fichier fourni");
        }

        String originalName = StringUtils.cleanPath(
                StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "document"
        );
        String sanitizedOriginalName = sanitizeFileName(originalName);
        String extension = extractExtension(sanitizedOriginalName);

        if (!StringUtils.hasText(extension) || !allowedExtensions.contains(extension)) {
            throw new BusinessException("Type de fichier non autorisé");
        }

        String contentType = normalizeContentType(file.getContentType(), extension);
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessException("Type de fichier non autorisé");
        }

        String safeArchiveSegment = sanitizePathSegment(archiveId);
        String storedName = System.currentTimeMillis() + "_" + sanitizedOriginalName;

        try {
            Path targetDirectory = storageRoot.resolve("archives").resolve(safeArchiveSegment).normalize();
            validateInsideStorageRoot(targetDirectory);
            Files.createDirectories(targetDirectory);

            Path targetFile = targetDirectory.resolve(storedName).normalize();
            validateInsideStorageRoot(targetFile);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }

            String relativePath = storageRoot.relativize(targetFile).toString().replace('\\', '/');

            log.info("Fichier archivé: {} ({}) par {}", originalName, relativePath, uploadedBy);

            return new StoredFile(
                    originalName,
                    storedName,
                    file.getSize(),
                    contentType,
                    relativePath,
                    "/files/download?path=" + URLEncoder.encode(relativePath, StandardCharsets.UTF_8)
            );
        } catch (IOException exception) {
            log.error("Erreur de stockage du fichier {}", originalName, exception);
            throw new BusinessException("Erreur lors du téléchargement du fichier");
        }
    }

    public StoredResource loadArchiveFile(String relativePath) {
        if (!StringUtils.hasText(relativePath)) {
            throw new BusinessException("Chemin de fichier non fourni");
        }

        Path resolvedPath = storageRoot.resolve(relativePath).normalize();
        validateInsideStorageRoot(resolvedPath);

        if (!Files.exists(resolvedPath) || !Files.isRegularFile(resolvedPath)) {
            throw new EntityNotFoundException("Fichier", relativePath);
        }

        try {
            Resource resource = new UrlResource(resolvedPath.toUri());
            String contentType = Files.probeContentType(resolvedPath);
            long size = Files.size(resolvedPath);

            return new StoredResource(
                    resource,
                    StringUtils.hasText(contentType) ? contentType : "application/octet-stream",
                    size,
                    resolvedPath.getFileName().toString()
            );
        } catch (MalformedURLException exception) {
            log.error("URL invalide pour le fichier {}", relativePath, exception);
            throw new BusinessException("Chemin de fichier invalide");
        } catch (IOException exception) {
            log.error("Erreur de lecture du fichier {}", relativePath, exception);
            throw new BusinessException("Impossible de lire le fichier");
        }
    }

    private void validateInsideStorageRoot(Path path) {
        if (!path.startsWith(storageRoot)) {
            throw new BusinessException("Chemin de fichier non autorisé");
        }
    }

    private String sanitizePathSegment(String value) {
        if (!StringUtils.hasText(value)) {
            return "temp";
        }

        String sanitized = value.replaceAll("[^a-zA-Z0-9._-]", "_");
        return StringUtils.hasText(sanitized) ? sanitized : "temp";
    }

    private String sanitizeFileName(String value) {
        String sanitized = value.replaceAll("[^a-zA-Z0-9._-]", "_");
        return StringUtils.hasText(sanitized) ? sanitized : "document";
    }

    private String extractExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex < 0 || lastDotIndex == fileName.length() - 1) {
            return "";
        }

        return fileName.substring(lastDotIndex + 1).toLowerCase(Locale.ROOT);
    }

    private String normalizeContentType(String contentType, String extension) {
        if (StringUtils.hasText(contentType)) {
            return contentType;
        }

        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "tif", "tiff" -> "image/tiff";
            default -> "application/octet-stream";
        };
    }

    public record StoredFile(
            String originalName,
            String fileName,
            long size,
            String contentType,
            String relativePath,
            String publicUrl
    ) {
    }

    public record StoredResource(
            Resource resource,
            String contentType,
            long size,
            String fileName
    ) {
    }
}
