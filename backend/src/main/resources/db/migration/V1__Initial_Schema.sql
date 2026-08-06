-- V1__Initial_Schema.sql
-- Flyway migration script for Archives Bancaires

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    level INTEGER DEFAULT 0,
    permissions TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agencies table
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar TEXT,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    agency_id UUID REFERENCES agencies(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Archive Types table
CREATE TABLE archive_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    retention_years INTEGER NOT NULL DEFAULT 10,
    category VARCHAR(100),
    sub_category VARCHAR(100),
    color VARCHAR(20) DEFAULT '#3b82f6',
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID REFERENCES agencies(id),
    site VARCHAR(100),
    building VARCHAR(100),
    room VARCHAR(100),
    shelf VARCHAR(100),
    box VARCHAR(100),
    code VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    capacity INTEGER,
    current_load INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Archives table
CREATE TABLE archives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type_id UUID NOT NULL REFERENCES archive_types(id),
    category_id VARCHAR(100),
    sub_category_id VARCHAR(100),
    
    -- Client/Account info
    client_name VARCHAR(200),
    client_number VARCHAR(50),
    account_number VARCHAR(50),
    dossier_number VARCHAR(50),
    
    -- Ownership
    agency_id UUID NOT NULL REFERENCES agencies(id),
    department VARCHAR(100),
    owner_service VARCHAR(100),
    
    -- Dates
    document_date DATE,
    archive_date DATE NOT NULL DEFAULT CURRENT_DATE,
    retention_end_date DATE NOT NULL,
    destruction_date DATE,
    
    -- Status & Classification
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    confidentiality VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    version INTEGER DEFAULT 1,
    
    -- Physical location
    location_id UUID REFERENCES locations(id),
    box_number VARCHAR(50),
    physical_notes TEXT,
    
    -- Digital
    has_digital_copy BOOLEAN DEFAULT FALSE,
    file_path TEXT,
    file_size BIGINT,
    file_name VARCHAR(255),
    mime_type VARCHAR(100),
    
    -- Metadata
    keywords TEXT,
    custom_fields TEXT,
    tags TEXT,
    parent_archive_id UUID REFERENCES archives(id),
    
    -- Tracking
    created_by VARCHAR(100),
    last_modified_by VARCHAR(100),
    last_action_at TIMESTAMP WITH TIME ZONE,
    last_action_type VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for archives
CREATE INDEX idx_archive_reference ON archives(reference);
CREATE INDEX idx_archive_client_name ON archives(client_name);
CREATE INDEX idx_archive_account_number ON archives(account_number);
CREATE INDEX idx_archive_status ON archives(status);
CREATE INDEX idx_archive_retention_end_date ON archives(retention_end_date);
CREATE INDEX idx_archive_agency_id ON archives(agency_id);
CREATE INDEX idx_archive_type_id ON archives(type_id);

-- Archive Files table
CREATE TABLE archive_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    archive_id UUID NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    path TEXT NOT NULL,
    checksum VARCHAR(100),
    uploaded_by VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE
);

-- Movements table
CREATE TABLE movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    archive_id UUID NOT NULL REFERENCES archives(id),
    type VARCHAR(50) NOT NULL,
    
    from_location_id VARCHAR(100),
    to_location_id VARCHAR(100),
    from_agency_id VARCHAR(100),
    to_agency_id VARCHAR(100),
    from_location TEXT,
    to_location TEXT,
    from_agency VARCHAR(200),
    to_agency VARCHAR(200),
    
    reason TEXT,
    notes TEXT,
    
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    executed_by UUID REFERENCES users(id),
    executed_at TIMESTAMP WITH TIME ZONE,
    
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    receipt_number VARCHAR(100) UNIQUE,
    expected_return_date DATE,
    actual_return_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for movements
CREATE INDEX idx_movement_archive_id ON movements(archive_id);
CREATE INDEX idx_movement_type ON movements(type);
CREATE INDEX idx_movement_status ON movements(status);

-- Workflow Requests table
CREATE TABLE workflow_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    archive_id UUID REFERENCES archives(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    
    requester_id UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 3,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    
    -- Approval chain
    approved_by_n1 VARCHAR(100),
    approved_at_n1 TIMESTAMP WITH TIME ZONE,
    comment_n1 TEXT,
    
    approved_by_compliance VARCHAR(100),
    approved_at_compliance TIMESTAMP WITH TIME ZONE,
    comment_compliance TEXT,
    
    approved_by_manager VARCHAR(100),
    approved_at_manager TIMESTAMP WITH TIME ZONE,
    comment_manager TEXT,
    
    -- Execution
    executed_by VARCHAR(100),
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_notes TEXT,
    
    -- SLA
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    request_data TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for workflows
CREATE INDEX idx_workflow_type ON workflow_requests(type);
CREATE INDEX idx_workflow_status ON workflow_requests(status);
CREATE INDEX idx_workflow_requester_id ON workflow_requests(requester_id);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    archive_id UUID REFERENCES archives(id),
    workflow_id UUID REFERENCES workflow_requests(id),
    author_id UUID NOT NULL REFERENCES users(id),
    parent_id UUID REFERENCES comments(id),
    is_internal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    archive_id UUID REFERENCES archives(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    session_id VARCHAR(100),
    is_sensitive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_archive_id ON audit_logs(archive_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notifications
CREATE INDEX idx_notification_user_id ON notifications(user_id);
CREATE INDEX idx_notification_is_read ON notifications(is_read);

-- Retention Rules table
CREATE TABLE retention_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    archive_type_id VARCHAR(100),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    retention_years INTEGER NOT NULL,
    alert_days INTEGER DEFAULT 90,
    auto_destroy BOOLEAN DEFAULT FALSE,
    transfer_destination VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Saved Searches table
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(200) NOT NULL,
    query TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Configs table
CREATE TABLE system_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    category VARCHAR(50),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_archive_types_updated_at BEFORE UPDATE ON archive_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_archives_updated_at BEFORE UPDATE ON archives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movements_updated_at BEFORE UPDATE ON movements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_requests_updated_at BEFORE UPDATE ON workflow_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retention_rules_updated_at BEFORE UPDATE ON retention_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON system_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
