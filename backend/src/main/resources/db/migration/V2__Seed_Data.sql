-- V2__Seed_Data.sql
-- Flyway migration script for seed data

-- Insert default roles
INSERT INTO roles (id, name, code, description, level, permissions, is_system) VALUES
(uuid_generate_v4(), 'Administrateur SI', 'ADMIN', 'Administrateur système avec tous les droits', 100, '["all"]', TRUE),
(uuid_generate_v4(), 'Archiviste Central', 'ARCHIVIST_CENTRAL', 'Archiviste du siège central', 80, '["read","write","approve","export","manage_archives","manage_movements"]', TRUE),
(uuid_generate_v4(), 'Archiviste Agence', 'ARCHIVIST_AGENCY', 'Archiviste d''agence', 60, '["read","write","borrow","manage_local_archives"]', TRUE),
(uuid_generate_v4(), 'Responsable Conformité', 'COMPLIANCE', 'Responsable conformité et contrôle', 70, '["read","approve","audit","export","manage_retention"]', TRUE),
(uuid_generate_v4(), 'Auditeur Interne', 'AUDITOR', 'Auditeur interne', 50, '["read","audit","export"]', TRUE),
(uuid_generate_v4(), 'Utilisateur', 'USER', 'Utilisateur standard', 10, '["read","borrow"]', TRUE);

-- Insert agencies
INSERT INTO agencies (id, code, name, address, city, region, phone, is_active) VALUES
(uuid_generate_v4(), 'SIEGE', 'Siège Central Paris', '1 Place de l''Opéra', 'Paris', 'Île-de-France', '+33 1 42 60 00 00', TRUE),
(uuid_generate_v4(), 'LYO-C', 'Agence Lyon Centre', '15 Rue de la République', 'Lyon', 'Auvergne-Rhône-Alpes', '+33 4 72 10 50 00', TRUE),
(uuid_generate_v4(), 'MAR-VP', 'Agence Marseille Vieux-Port', '25 Quai du Port', 'Marseille', 'PACA', '+33 4 91 15 00 00', TRUE),
(uuid_generate_v4(), 'BOR-C', 'Agence Bordeaux Centre', '10 Cours de l''Intendance', 'Bordeaux', 'Nouvelle-Aquitaine', '+33 5 56 48 00 00', TRUE),
(uuid_generate_v4(), 'NIC-C', 'Agence Nice Centre', '5 Avenue Jean Médecin', 'Nice', 'PACA', '+33 4 93 88 00 00', TRUE),
(uuid_generate_v4(), 'STR-C', 'Agence Strasbourg Centre', '8 Rue des Hallebardes', 'Strasbourg', 'Grand Est', '+33 3 88 35 00 00', TRUE);

-- Insert archive types
INSERT INTO archive_types (id, code, name, description, retention_years, category, color, is_active) VALUES
(uuid_generate_v4(), 'KYC', 'Documents KYC', 'Documents Know Your Customer pour l''identification des clients', 10, 'Conformité', '#3b82f6', TRUE),
(uuid_generate_v4(), 'CREDIT', 'Dossiers de Crédit', 'Dossiers complets des opérations de crédit', 10, 'Crédits', '#10b981', TRUE),
(uuid_generate_v4(), 'CONTRACT', 'Contrats', 'Contrats et conventions signés', 10, 'Juridique', '#8b5cf6', TRUE),
(uuid_generate_v4(), 'ACCOUNTING', 'Pièces Comptables', 'Documents comptables et financiers', 10, 'Comptabilité', '#f59e0b', TRUE),
(uuid_generate_v4(), 'HR', 'Documents RH', 'Dossiers du personnel et ressources humaines', 5, 'Ressources Humaines', '#ec4899', TRUE),
(uuid_generate_v4(), 'LEGAL', 'Documents Juridiques', 'Documents juridiques et contentieux', 15, 'Juridique', '#ef4444', TRUE),
(uuid_generate_v4(), 'COMMITTEE', 'Procès-Verbaux Comités', 'Comptes-rendus des comités et assemblées', 20, 'Gouvernance', '#6366f1', TRUE),
(uuid_generate_v4(), 'REGULATORY', 'Correspondances Réglementaires', 'Communications avec les régulateurs', 10, 'Conformité', '#14b8a6', TRUE),
(uuid_generate_v4(), 'TRANSACTION', 'Preuves de Transaction', 'Preuves et justificatifs de transactions', 7, 'Opérations', '#f97316', TRUE),
(uuid_generate_v4(), 'LITIGATION', 'Contentieux', 'Dossiers de contentieux et litiges', 15, 'Juridique', '#dc2626', TRUE);

-- Insert default admin user (password: admin123 - BCrypt encoded)
-- Note: In production, use a proper password encoder
INSERT INTO users (id, email, password, name, first_name, last_name, department, role_id, is_active) 
SELECT 
    uuid_generate_v4(),
    'admin@banque.fr',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Administrateur Système',
    'Admin',
    'Système',
    'Direction des Systèmes d''Information',
    r.id,
    TRUE
FROM roles r WHERE r.code = 'ADMIN';

-- Insert retention rules
INSERT INTO retention_rules (id, archive_type_id, name, description, retention_years, alert_days, auto_destroy)
SELECT 
    uuid_generate_v4(),
    at.id::text,
    at.name,
    'Règle de conservation pour ' || at.name,
    at.retention_years,
    90,
    FALSE
FROM archive_types at;

-- Insert system configurations
INSERT INTO system_configs (key, value, description, category) VALUES
('app.name', 'Archives Bancaires', 'Nom de l''application', 'general'),
('app.version', '1.0.0', 'Version de l''application', 'general'),
('archive.default_retention_years', '10', 'Durée de conservation par défaut', 'archive'),
('archive.alert_days', '90', 'Jours avant alerte d''échéance', 'archive'),
('archive.max_file_size', '52428800', 'Taille max fichier en bytes (50MB)', 'archive'),
('workflow.default_steps', '3', 'Nombre d''étapes de validation par défaut', 'workflow'),
('notification.email_enabled', 'true', 'Notifications email activées', 'notification');
