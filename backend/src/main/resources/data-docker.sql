INSERT INTO roles (id, name, code, description, level, permissions, is_system, created_at, updated_at)
SELECT
  'role-admin',
  'Administrateur SI',
  'ADMIN',
  'Administrateur systeme avec tous les droits',
  100,
  '["all"]',
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM roles WHERE code = 'ADMIN'
);

INSERT INTO roles (id, name, code, description, level, permissions, is_system, created_at, updated_at)
SELECT
  'role-user',
  'Utilisateur',
  'USER',
  'Utilisateur standard',
  10,
  '["read","borrow"]',
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM roles WHERE code = 'USER'
);

INSERT INTO users (id, username, email, password, name, first_name, last_name, department, role_id, is_active, created_at, updated_at)
SELECT
  'user-admin',
  'admin',
  'admin@banque.fr',
  '$2a$10$QiXLDwXtb0WokCr8JJKEPuGMpXDhLcGVqby0r1L8jblnSjvqwc4oy',
  'Administrateur Systeme',
  'Admin',
  'Systeme',
  'Direction des Systemes d''Information',
  r.id,
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM roles r
WHERE r.code = 'ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@banque.fr'
  );

INSERT INTO users (id, username, email, password, name, first_name, last_name, department, role_id, is_active, created_at, updated_at)
SELECT
  'user-standard',
  'user',
  'user@banque.fr',
  '$2a$10$QiXLDwXtb0WokCr8JJKEPuGMpXDhLcGVqby0r1L8jblnSjvqwc4oy',
  'Utilisateur Demo',
  'User',
  'Demo',
  'Operations',
  r.id,
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM roles r
WHERE r.code = 'USER'
  AND NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'user@banque.fr'
  );
