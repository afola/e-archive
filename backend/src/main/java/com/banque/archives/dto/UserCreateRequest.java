package com.banque.archives.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateRequest {

    @Valid
    @NotNull(message = "Les informations utilisateur sont obligatoires")
    private UserDTO user;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;
}
