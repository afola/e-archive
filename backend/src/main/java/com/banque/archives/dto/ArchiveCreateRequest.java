package com.banque.archives.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchiveCreateRequest {

    @NotBlank(message = "La référence est obligatoire")
    private String reference;
    
    @NotBlank(message = "Le titre est obligatoire")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Le type est obligatoire")
    private String typeId;
    
    private String categoryId;
    private String subCategoryId;
    
    private String clientName;
    private String clientNumber;
    private String accountNumber;
    private String dossierNumber;
    
    @NotBlank(message = "L'agence est obligatoire")
    private String agencyId;
    
    private String department;
    private String ownerService;
    
    private String documentDate;
    
    private String locationId;
    private String boxNumber;
    private String physicalNotes;
    
    private String confidentiality;
    
    private java.util.List<String> keywords;
    private java.util.List<String> tags;
}
