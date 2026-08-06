package com.banque.archives.controller;

import com.banque.archives.security.AppUserPrincipal;
import com.banque.archives.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Tag(name = "Fichiers", description = "API de gestion des fichiers d'archive")
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Téléverser un fichier pour une archive")
    public ResponseEntity<Map<String, Object>> upload(
            @Parameter(description = "Fichier à téléverser") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Identifiant de l'archive") @RequestParam(required = false) String archiveId,
            @AuthenticationPrincipal AppUserPrincipal userDetails
    ) {
        String userId = userDetails != null ? userDetails.getId() : null;
        FileStorageService.StoredFile storedFile = fileStorageService.storeArchiveFile(file, archiveId, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "file", Map.of(
                        "name", storedFile.originalName(),
                        "fileName", storedFile.fileName(),
                        "size", storedFile.size(),
                        "type", storedFile.contentType(),
                        "url", storedFile.publicUrl(),
                        "path", storedFile.relativePath()
                )
        ));
    }

    @GetMapping("/download")
    @Operation(summary = "Télécharger ou prévisualiser un fichier d'archive")
    public ResponseEntity<org.springframework.core.io.Resource> download(
            @Parameter(description = "Chemin relatif du fichier") @RequestParam("path") String path
    ) {
        FileStorageService.StoredResource storedResource = fileStorageService.loadArchiveFile(path);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(storedResource.contentType()))
                .contentLength(storedResource.size())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename(storedResource.fileName(), StandardCharsets.UTF_8)
                                .build()
                                .toString()
                )
                .body(storedResource.resource());
    }
}
