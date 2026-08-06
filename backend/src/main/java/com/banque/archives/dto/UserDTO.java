package com.banque.archives.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private String id;

    private String username;
    
    @Email(message = "Email invalide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;
    
    private String name;
    private String firstName;
    private String lastName;
    private String avatar;
    private String phone;
    private String department;
    private String position;
    
    private String agencyId;
    private String agencyName;
    
    private String roleId;
    private String roleName;
    
    private Boolean isActive;
    private String lastLoginAt;
    private String createdAt;
    private String updatedAt;
    
    private List<String> permissions;
}
