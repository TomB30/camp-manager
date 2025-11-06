-- Migration: 001_init_tenants_camps_users
-- Description: Creates initial tables for tenants, camps, users, access rules, refresh tokens, and colors
-- Created: 2025-11-04

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TENANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
    max_camps INT NOT NULL DEFAULT 1,
    settings JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT check_subscription_tier CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise'))
);

-- Indexes for tenants
CREATE INDEX IF NOT EXISTS idx_tenants_name ON tenants(name);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_deleted_at ON tenants(deleted_at);

-- ============================================================================
-- CAMPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS camps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Spec fields
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    daily_start_time VARCHAR(5) NOT NULL,
    daily_end_time VARCHAR(5) NOT NULL,
    address JSONB,
    contact_info JSONB,
    logo_url VARCHAR(500),
    timezone VARCHAR(100) DEFAULT 'America/New_York',
    settings JSONB,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT check_camp_dates CHECK (end_date >= start_date),
    CONSTRAINT check_daily_start_time CHECK (daily_start_time ~ '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'),
    CONSTRAINT check_daily_end_time CHECK (daily_end_time ~ '^([0-1][0-9]|2[0-3]):[0-5][0-9]$')
);

-- Indexes for camps
CREATE INDEX IF NOT EXISTS idx_camps_tenant_id ON camps(tenant_id);
CREATE INDEX IF NOT EXISTS idx_camps_tenant_id_created_at ON camps(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_camps_tenant_id_name ON camps(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_camps_deleted_at ON camps(deleted_at);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_tenant_id_email ON users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- ============================================================================
-- ACCESS RULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS access_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    scope_type VARCHAR(20) NOT NULL,
    scope_id UUID,
    
    CONSTRAINT check_access_rule_role CHECK (role IN ('admin', 'program-admin', 'viewer')),
    CONSTRAINT check_access_rule_scope_type CHECK (scope_type IN ('system', 'tenant', 'camp')),
    CONSTRAINT check_scope_id_consistency CHECK ((scope_type = 'system' AND scope_id IS NULL) OR (scope_type IN ('tenant', 'camp') AND scope_id IS NOT NULL))
);

-- Indexes for access_rules
CREATE INDEX IF NOT EXISTS idx_access_rules_user_id ON access_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_access_rules_user_id_scope_type ON access_rules(user_id, scope_type);
CREATE INDEX IF NOT EXISTS idx_access_rules_scope ON access_rules(scope_id) WHERE scope_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_access_rules_scope_type_scope_id ON access_rules(scope_type, scope_id) WHERE scope_id IS NOT NULL;

-- ============================================================================
-- REFRESH TOKENS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active ON refresh_tokens(revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id_revoked_expires ON refresh_tokens(user_id, revoked, expires_at);

-- ============================================================================
-- COLORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    hex_value VARCHAR(7) NOT NULL,
    "default" BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT check_hex_value CHECK (hex_value ~ '^#[0-9A-Fa-f]{6}$')
);

-- Indexes for colors
CREATE INDEX IF NOT EXISTS idx_colors_tenant_id ON colors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_colors_camp_id ON colors(camp_id);
CREATE INDEX IF NOT EXISTS idx_colors_tenant_id_camp_id ON colors(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_colors_deleted_at ON colors(deleted_at);
CREATE INDEX IF NOT EXISTS idx_colors_name ON colors(name);

-- ============================================================================
-- AREAS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INTEGER,
    equipment JSONB,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for areas
CREATE INDEX IF NOT EXISTS idx_areas_tenant_id ON areas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_areas_camp_id ON areas(camp_id);
CREATE INDEX IF NOT EXISTS idx_areas_tenant_id_camp_id ON areas(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_areas_deleted_at ON areas(deleted_at);
CREATE INDEX IF NOT EXISTS idx_areas_name ON areas(name);

-- ============================================================================
-- CERTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for certifications
CREATE INDEX IF NOT EXISTS idx_certifications_tenant_id ON certifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_certifications_camp_id ON certifications(camp_id);
CREATE INDEX IF NOT EXISTS idx_certifications_tenant_id_camp_id ON certifications(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_certifications_deleted_at ON certifications(deleted_at);
CREATE INDEX IF NOT EXISTS idx_certifications_name ON certifications(name);

-- ============================================================================
-- SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT check_session_dates CHECK (end_date >= start_date)
);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_id ON sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_camp_id ON sessions(camp_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_id_camp_id ON sessions(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_sessions_deleted_at ON sessions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_sessions_name ON sessions(name);
CREATE INDEX IF NOT EXISTS idx_sessions_start_date ON sessions(start_date);
CREATE INDEX IF NOT EXISTS idx_sessions_end_date ON sessions(end_date);

-- ============================================================================
-- ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for roles
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_roles_camp_id ON roles(camp_id);
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id_camp_id ON roles(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_roles_deleted_at ON roles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for tenants
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for camps
DROP TRIGGER IF EXISTS update_camps_updated_at ON camps;
CREATE TRIGGER update_camps_updated_at
    BEFORE UPDATE ON camps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for colors
DROP TRIGGER IF EXISTS update_colors_updated_at ON colors;
CREATE TRIGGER update_colors_updated_at
    BEFORE UPDATE ON colors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for areas
DROP TRIGGER IF EXISTS update_areas_updated_at ON areas;
CREATE TRIGGER update_areas_updated_at
    BEFORE UPDATE ON areas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for certifications
DROP TRIGGER IF EXISTS update_certifications_updated_at ON certifications;
CREATE TRIGGER update_certifications_updated_at
    BEFORE UPDATE ON certifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for sessions
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for roles
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE tenants IS 'Top-level organization entity - can represent a single camp or multi-camp organization';
COMMENT ON TABLE camps IS 'Individual camps within a tenant organization';
COMMENT ON TABLE users IS 'User accounts with authentication credentials';
COMMENT ON TABLE access_rules IS 'User access permissions at different scope levels (system, tenant, camp)';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for maintaining user sessions';
COMMENT ON TABLE colors IS 'Colors used for events and visual organization within camps';
COMMENT ON TABLE areas IS 'Physical areas within a camp such as fields, cabins, dining halls, etc.';
COMMENT ON TABLE certifications IS 'Certifications of staff members';
COMMENT ON TABLE sessions IS 'Camp sessions representing specific time periods within a camp';
COMMENT ON TABLE roles IS 'Staff roles within a camp';

COMMENT ON COLUMN tenants.slug IS 'URL-safe identifier for subdomain routing';
COMMENT ON COLUMN tenants.subscription_tier IS 'Subscription level: free, basic, premium, enterprise';
COMMENT ON COLUMN tenants.max_camps IS 'Maximum number of camps allowed for this tenant';

COMMENT ON COLUMN camps.daily_start_time IS 'Daily start time in HH:MM format (24-hour)';
COMMENT ON COLUMN camps.daily_end_time IS 'Daily end time in HH:MM format (24-hour)';
COMMENT ON COLUMN camps.timezone IS 'IANA timezone identifier (e.g., America/New_York)';

COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';

COMMENT ON COLUMN access_rules.scope_type IS 'Scope level: system (platform admin), tenant (org admin), camp (camp admin)';
COMMENT ON COLUMN access_rules.scope_id IS 'ID of the tenant or camp (null for system scope)';
COMMENT ON COLUMN access_rules.role IS 'Role at this scope: admin, program-admin, viewer';

COMMENT ON COLUMN colors.hex_value IS 'Hex color value in format #RRGGBB';
COMMENT ON COLUMN colors."default" IS 'Whether this is the default color for events';

COMMENT ON COLUMN areas.capacity IS 'Maximum capacity of the area (number of people)';
COMMENT ON COLUMN areas.equipment IS 'JSON array of equipment available in this area';
COMMENT ON COLUMN areas.notes IS 'Additional notes or details about the area';

COMMENT ON COLUMN certifications.description IS 'Description of the certification';

COMMENT ON COLUMN sessions.start_date IS 'Start date of the session';
COMMENT ON COLUMN sessions.end_date IS 'End date of the session';

COMMENT ON COLUMN roles.description IS 'Description of the role';
