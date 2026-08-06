package com.banque.archives.service;

import com.banque.archives.dto.*;
import com.banque.archives.entity.*;
import com.banque.archives.exception.BusinessException;
import com.banque.archives.exception.EntityNotFoundException;
import com.banque.archives.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AgencyRepository agencyRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;

    public UserDTO findById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", id));
        return toDTO(user);
    }

    public UserDTO findByUsername(String username) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new EntityNotFoundException("User", "username=" + username));
        return toDTO(user);
    }

    public UserDTO findByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new EntityNotFoundException("User", "email=" + email));
        return toDTO(user);
    }

    public UserDTO findByUsernameOrEmail(String identifier) {
        User user = findEntityByUsernameOrEmail(identifier);
        return toDTO(user);
    }

    public List<UserDTO> findAll() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> findByFilters(String search, String roleId, String agencyId) {
        return userRepository.findByFilters(search, roleId, agencyId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO create(UserDTO dto, String password) {
        if (userRepository.existsByEmailIgnoreCase(dto.getEmail())) {
            throw new BusinessException("Un utilisateur avec cet email existe déjà");
        }

        String username = resolveUsername(dto.getUsername(), dto.getEmail());
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new BusinessException("Un utilisateur avec ce nom d'utilisateur existe déjà");
        }

        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new EntityNotFoundException("Role", dto.getRoleId()));

        Agency agency = null;
        if (dto.getAgencyId() != null) {
            agency = agencyRepository.findById(dto.getAgencyId())
                    .orElseThrow(() -> new EntityNotFoundException("Agency", dto.getAgencyId()));
        }

        User user = User.builder()
                .username(username)
                .email(dto.getEmail())
                .password(passwordEncoder.encode(password))
                .name(dto.getName())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .position(dto.getPosition())
                .agency(agency)
                .role(role)
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("Utilisateur créé: {}", user.getUsername());

        return toDTO(user);
    }

    @Transactional
    public UserDTO update(String id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", id));

        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            String normalizedUsername = dto.getUsername().trim();
            String currentUserId = user.getId();
            userRepository.findByUsernameIgnoreCase(normalizedUsername)
                    .filter(existingUser -> !existingUser.getId().equals(currentUserId))
                    .ifPresent(existingUser -> {
                        throw new BusinessException("Un utilisateur avec ce nom d'utilisateur existe déjà");
                    });
            user.setUsername(normalizedUsername);
        }

        user.setName(dto.getName());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        user.setDepartment(dto.getDepartment());
        user.setPosition(dto.getPosition());

        if (dto.getAgencyId() != null) {
            Agency agency = agencyRepository.findById(dto.getAgencyId())
                    .orElseThrow(() -> new EntityNotFoundException("Agency", dto.getAgencyId()));
            user.setAgency(agency);
        }

        if (dto.getRoleId() != null) {
            Role role = roleRepository.findById(dto.getRoleId())
                    .orElseThrow(() -> new EntityNotFoundException("Role", dto.getRoleId()));
            user.setRole(role);
        }

        user = userRepository.save(user);
        log.info("Utilisateur modifié: {}", user.getUsername());

        return toDTO(user);
    }

    @Transactional
    public void changePassword(String id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", id));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException("Mot de passe actuel incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Mot de passe changé pour: {}", user.getEmail());
    }

    @Transactional
    public void resetPassword(String id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", id));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Mot de passe réinitialisé pour: {}", user.getEmail());
    }

    @Transactional
    public void deactivate(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", id));

        user.setIsActive(false);
        userRepository.save(user);
        log.info("Utilisateur désactivé: {}", user.getEmail());
    }

    @Transactional
    public void activate(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", id));

        user.setIsActive(true);
        userRepository.save(user);
        log.info("Utilisateur activé: {}", user.getEmail());
    }

    @Transactional
    public void updateLastLogin(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", id));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatar(user.getAvatar())
                .phone(user.getPhone())
                .department(user.getDepartment())
                .position(user.getPosition())
                .agencyId(user.getAgency() != null ? user.getAgency().getId() : null)
                .agencyName(user.getAgency() != null ? user.getAgency().getName() : null)
                .roleId(user.getRole() != null ? user.getRole().getId() : null)
                .roleName(user.getRole() != null ? user.getRole().getName() : null)
                .permissions(parsePermissions(user.getRole() != null ? user.getRole().getPermissions() : null))
                .isActive(user.getIsActive())
                .lastLoginAt(user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null)
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .updatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null)
                .build();
    }

    private User findEntityByUsernameOrEmail(String identifier) {
        return userRepository.findByUsernameIgnoreCase(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() -> new EntityNotFoundException("User", "identifier=" + identifier));
    }

    private String resolveUsername(String requestedUsername, String email) {
        if (requestedUsername != null && !requestedUsername.isBlank()) {
            return requestedUsername.trim();
        }

        int atIndex = email.indexOf('@');
        if (atIndex > 0) {
            return email.substring(0, atIndex).trim();
        }

        return email.trim();
    }

    private List<String> parsePermissions(String rawPermissions) {
        if (rawPermissions == null || rawPermissions.isBlank()) {
            return List.of();
        }

        return Arrays.stream(rawPermissions
                        .replace("[", "")
                        .replace("]", "")
                        .replace("\"", "")
                        .split(","))
                .map(String::trim)
                .filter(permission -> !permission.isEmpty())
                .collect(Collectors.toList());
    }
}
