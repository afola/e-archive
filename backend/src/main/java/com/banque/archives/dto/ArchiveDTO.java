package com.banque.archives.dto;

import com.banque.archives.entity.ArchiveStatus;
import com.banque.archives.entity.ConfidentialityLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchiveDTO {

    private String id;
    
    @NotBlank(message = "La référence est obligatoire")
    private String reference;
    
    @NotBlank(message = "Le titre est obligatoire")
    private String title;
    
    private String description;
    
    @NotNull(message = "Le type est obligatoire")
    private String typeId;
    private String typeName;
    
    private String categoryId;
    private String subCategoryId;
    
    private String clientName;
    private String clientNumber;
    private String accountNumber;
    private String dossierNumber;
    
    @NotNull(message = "L'agence est obligatoire")
    private String agencyId;
    private String agencyName;
    
    private String department;
    private String ownerService;
    
    private LocalDate documentDate;
    
    @NotNull(message = "La date d'archive est obligatoire")
    private LocalDate archiveDate;
    
    @NotNull(message = "La date de fin de conservation est obligatoire")
    private LocalDate retentionEndDate;
    
    private LocalDate destructionDate;
    
    private ArchiveStatus status;
    private ConfidentialityLevel confidentiality;
    private Integer version;
    
    private String locationId;
    private String locationCode;
    private String boxNumber;
    private String physicalNotes;
    
    private Boolean hasDigitalCopy;
    private String filePath;
    private String fileName;
    private Long fileSize;
    
    private List<String> keywords;
    private List<String> tags;
    
    private String createdBy;
    private String createdByName;
    private String lastModifiedBy;
    private String lastActionAt;
    private String lastActionType;
    
    private String createdAt;
    private String updatedAt;
}
