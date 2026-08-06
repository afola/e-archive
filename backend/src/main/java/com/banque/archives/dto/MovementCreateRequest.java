package com.banque.archives.dto;

import com.banque.archives.entity.MovementType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requête de création d'un mouvement")
public class MovementCreateRequest {

    @NotBlank(message = "L'ID de l'archive est obligatoire")
    @Schema(description = "ID de l'archive", example = "uuid")
    private String archiveId;

    @NotNull(message = "Le type de mouvement est obligatoire")
    @Schema(description = "Type de mouvement", example = "BORROW")
    private MovementType type;

    @Schema(description = "Motif du mouvement")
    private String reason;

    @Schema(description = "Lieu d'origine")
    private String fromLocation;

    @Schema(description = "Lieu de destination")
    private String toLocation;

    @Schema(description = "Agence d'origine")
    private String fromAgency;

    @Schema(description = "Agence de destination")
    private String toAgency;

    @Schema(description = "Date de retour prévue")
    private LocalDate expectedReturnDate;

    @Schema(description = "Notes additionnelles")
    private String notes;
}
