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
-- LOCATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INTEGER,
    equipment JSONB,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for locations
CREATE INDEX IF NOT EXISTS idx_locations_tenant_id ON locations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_locations_camp_id ON locations(camp_id);
CREATE INDEX IF NOT EXISTS idx_locations_area_id ON locations(area_id);
CREATE INDEX IF NOT EXISTS idx_locations_tenant_id_camp_id ON locations(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_locations_deleted_at ON locations(deleted_at);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);

-- ============================================================================
-- HOUSING ROOMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS housing_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    beds INTEGER NOT NULL,
    bathroom VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT check_beds_positive CHECK (beds > 0),
    CONSTRAINT check_bathroom_type CHECK (bathroom IN ('private', 'shared', ''))
);

-- Indexes for housing_rooms
CREATE INDEX IF NOT EXISTS idx_housing_rooms_tenant_id ON housing_rooms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_housing_rooms_camp_id ON housing_rooms(camp_id);
CREATE INDEX IF NOT EXISTS idx_housing_rooms_area_id ON housing_rooms(area_id);
CREATE INDEX IF NOT EXISTS idx_housing_rooms_tenant_id_camp_id ON housing_rooms(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_housing_rooms_deleted_at ON housing_rooms(deleted_at);
CREATE INDEX IF NOT EXISTS idx_housing_rooms_name ON housing_rooms(name);

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

-- Trigger for locations
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for housing_rooms
DROP TRIGGER IF EXISTS update_housing_rooms_updated_at ON housing_rooms;
CREATE TRIGGER update_housing_rooms_updated_at
    BEFORE UPDATE ON housing_rooms
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
COMMENT ON TABLE locations IS 'Specific locations within a camp, optionally associated with an area';
COMMENT ON TABLE housing_rooms IS 'Housing rooms or cabins for staff and campers, optionally associated with an area';

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

COMMENT ON COLUMN locations.area_id IS 'Optional reference to the area where this location is situated';
COMMENT ON COLUMN locations.capacity IS 'Maximum capacity of the location (number of people)';
COMMENT ON COLUMN locations.equipment IS 'JSON array of equipment available at this location';
COMMENT ON COLUMN locations.notes IS 'Additional notes or details about the location';

COMMENT ON COLUMN housing_rooms.area_id IS 'Optional reference to the area where this housing room is located';
COMMENT ON COLUMN housing_rooms.beds IS 'Number of beds in the housing room';
COMMENT ON COLUMN housing_rooms.bathroom IS 'Type of bathroom: private, shared, or empty string for none specified';

-- ============================================================================
-- TIME_BLOCKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS time_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    days_of_week JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT check_start_time CHECK (start_time ~ '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'),
    CONSTRAINT check_end_time CHECK (end_time ~ '^([0-1][0-9]|2[0-3]):[0-5][0-9]$')
);

-- Indexes for time_blocks
CREATE INDEX IF NOT EXISTS idx_time_blocks_tenant_id ON time_blocks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_camp_id ON time_blocks(camp_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_tenant_id_camp_id ON time_blocks(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_deleted_at ON time_blocks(deleted_at);
CREATE INDEX IF NOT EXISTS idx_time_blocks_name ON time_blocks(name);

-- Trigger for time_blocks
DROP TRIGGER IF EXISTS update_time_blocks_updated_at ON time_blocks;
CREATE TRIGGER update_time_blocks_updated_at
    BEFORE UPDATE ON time_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GROUPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Spec fields
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    housing_room_id UUID REFERENCES housing_rooms(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for groups
CREATE INDEX IF NOT EXISTS idx_groups_tenant_id ON groups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_groups_camp_id ON groups(camp_id);
CREATE INDEX IF NOT EXISTS idx_groups_session_id ON groups(session_id);
CREATE INDEX IF NOT EXISTS idx_groups_housing_room_id ON groups(housing_room_id);
CREATE INDEX IF NOT EXISTS idx_groups_tenant_id_camp_id ON groups(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_groups_deleted_at ON groups(deleted_at);
CREATE INDEX IF NOT EXISTS idx_groups_name ON groups(name);


-- ============================================================================
-- CAMPERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS campers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Spec fields
    birthday DATE NOT NULL,
    gender VARCHAR(50) NOT NULL,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    housing_group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT check_camper_gender CHECK (gender IN ('male', 'female'))
);

-- Indexes for campers
CREATE INDEX IF NOT EXISTS idx_campers_tenant_id ON campers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campers_camp_id ON campers(camp_id);
CREATE INDEX IF NOT EXISTS idx_campers_session_id ON campers(session_id);
CREATE INDEX IF NOT EXISTS idx_campers_housing_group_id ON campers(housing_group_id);
CREATE INDEX IF NOT EXISTS idx_campers_tenant_id_camp_id ON campers(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_campers_deleted_at ON campers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_campers_name ON campers(name);

-- ============================================================================
-- STAFF MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Spec fields
    birthday DATE NOT NULL,
    gender VARCHAR(50) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    phone VARCHAR(50),
    housing_group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT check_staff_gender CHECK (gender IN ('male', 'female'))
);

-- Indexes for staff_members
CREATE INDEX IF NOT EXISTS idx_staff_members_tenant_id ON staff_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_camp_id ON staff_members(camp_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_role_id ON staff_members(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_housing_group_id ON staff_members(housing_group_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_tenant_id_camp_id ON staff_members(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_deleted_at ON staff_members(deleted_at);
CREATE INDEX IF NOT EXISTS idx_staff_members_name ON staff_members(name);

-- ============================================================================
-- GROUP_CAMPERS JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS group_campers (
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    camper_id UUID NOT NULL REFERENCES campers(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (group_id, camper_id)
);

-- Indexes for group_campers
CREATE INDEX IF NOT EXISTS idx_group_campers_group_id ON group_campers(group_id);
CREATE INDEX IF NOT EXISTS idx_group_campers_camper_id ON group_campers(camper_id);

-- ============================================================================
-- GROUP_STAFF_MEMBERS JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS group_staff_members (
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (group_id, staff_member_id)
);

-- Indexes for group_staff_members
CREATE INDEX IF NOT EXISTS idx_group_staff_members_group_id ON group_staff_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_staff_members_staff_member_id ON group_staff_members(staff_member_id);

-- ============================================================================
-- GROUP_GROUPS JUNCTION TABLE (Nested Groups)
-- ============================================================================
CREATE TABLE IF NOT EXISTS group_groups (
    parent_group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    child_group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (parent_group_id, child_group_id),
    CONSTRAINT check_no_self_reference CHECK (parent_group_id != child_group_id)
);

-- Indexes for group_groups
CREATE INDEX IF NOT EXISTS idx_group_groups_parent_group_id ON group_groups(parent_group_id);
CREATE INDEX IF NOT EXISTS idx_group_groups_child_group_id ON group_groups(child_group_id);

-- ============================================================================
-- STAFF_MEMBER_CERTIFICATIONS JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff_member_certifications (
    staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (staff_member_id, certification_id)
);

-- Indexes for staff_member_certifications
CREATE INDEX IF NOT EXISTS idx_staff_member_certifications_staff_member_id ON staff_member_certifications(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_member_certifications_certification_id ON staff_member_certifications(certification_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT (CAMPERS, STAFF_MEMBERS, GROUPS)
-- ============================================================================

-- Trigger for campers
DROP TRIGGER IF EXISTS update_campers_updated_at ON campers;
CREATE TRIGGER update_campers_updated_at
    BEFORE UPDATE ON campers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for staff_members
DROP TRIGGER IF EXISTS update_staff_members_updated_at ON staff_members;
CREATE TRIGGER update_staff_members_updated_at
    BEFORE UPDATE ON staff_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for groups
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION (CAMPERS, STAFF_MEMBERS, GROUPS)
-- ============================================================================

COMMENT ON TABLE campers IS 'Campers registered for camp sessions';
COMMENT ON TABLE staff_members IS 'Staff members working at the camp';
COMMENT ON TABLE groups IS 'Groups of campers and/or staff members, or nested groups';
COMMENT ON TABLE group_campers IS 'Junction table linking groups to campers (many-to-many)';
COMMENT ON TABLE group_staff_members IS 'Junction table linking groups to staff members (many-to-many)';
COMMENT ON TABLE group_groups IS 'Junction table for nested groups (parent-child relationships)';
COMMENT ON TABLE staff_member_certifications IS 'Junction table linking staff members to their certifications (many-to-many)';

COMMENT ON COLUMN campers.birthday IS 'Date of birth of the camper';
COMMENT ON COLUMN campers.gender IS 'Gender of the camper: male, female, other, prefer-not-to-say';
COMMENT ON COLUMN campers.session_id IS 'Session this camper is registered for';
COMMENT ON COLUMN campers.housing_group_id IS 'Optional housing room assignment';

COMMENT ON COLUMN staff_members.birthday IS 'Date of birth of the staff member';
COMMENT ON COLUMN staff_members.gender IS 'Gender of the staff member: male, female, other, prefer-not-to-say';
COMMENT ON COLUMN staff_members.role_id IS 'Role of the staff member';
COMMENT ON COLUMN staff_members.phone IS 'Contact phone number';
COMMENT ON COLUMN staff_members.housing_group_id IS 'Optional housing room assignment';

COMMENT ON COLUMN groups.session_id IS 'Optional session this group belongs to';
COMMENT ON COLUMN groups.housing_room_id IS 'Optional housing room assignment for this group';

COMMENT ON TABLE time_blocks IS 'Time blocks for scheduling activities with specific days of week';
COMMENT ON COLUMN time_blocks.start_time IS 'Start time in HH:MM format (24-hour)';
COMMENT ON COLUMN time_blocks.end_time IS 'End time in HH:MM format (24-hour)';
COMMENT ON COLUMN time_blocks.days_of_week IS 'JSON array of days (sunday, monday, tuesday, wednesday, thursday, friday, saturday). Empty or null means all days.';

-- ============================================================================
-- PROGRAMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Spec fields
    color_id UUID REFERENCES colors(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for programs
CREATE INDEX IF NOT EXISTS idx_programs_tenant_id ON programs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_programs_camp_id ON programs(camp_id);
CREATE INDEX IF NOT EXISTS idx_programs_color_id ON programs(color_id);
CREATE INDEX IF NOT EXISTS idx_programs_tenant_id_camp_id ON programs(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_programs_deleted_at ON programs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_programs_name ON programs(name);

-- Trigger for programs
DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
CREATE TRIGGER update_programs_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ACTIVITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Spec fields
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    default_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    duration INTEGER,
    fixed_time JSONB,
    time_block_id UUID REFERENCES time_blocks(id) ON DELETE SET NULL,
    required_staff JSONB,
    activity_conflicts JSONB,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_activities_tenant_id ON activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activities_camp_id ON activities(camp_id);
CREATE INDEX IF NOT EXISTS idx_activities_program_id ON activities(program_id);
CREATE INDEX IF NOT EXISTS idx_activities_default_location_id ON activities(default_location_id);
CREATE INDEX IF NOT EXISTS idx_activities_time_block_id ON activities(time_block_id);
CREATE INDEX IF NOT EXISTS idx_activities_tenant_id_camp_id ON activities(tenant_id, camp_id);
CREATE INDEX IF NOT EXISTS idx_activities_deleted_at ON activities(deleted_at);
CREATE INDEX IF NOT EXISTS idx_activities_name ON activities(name);

-- Trigger for activities
DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PROGRAM_LOCATIONS JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS program_locations (
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (program_id, location_id)
);

-- Indexes for program_locations
CREATE INDEX IF NOT EXISTS idx_program_locations_program_id ON program_locations(program_id);
CREATE INDEX IF NOT EXISTS idx_program_locations_location_id ON program_locations(location_id);

-- ============================================================================
-- PROGRAM_STAFF_GROUPS JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS program_staff_groups (
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (program_id, group_id)
);

-- Indexes for program_staff_groups
CREATE INDEX IF NOT EXISTS idx_program_staff_groups_program_id ON program_staff_groups(program_id);
CREATE INDEX IF NOT EXISTS idx_program_staff_groups_group_id ON program_staff_groups(group_id);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION (PROGRAMS, ACTIVITIES)
-- ============================================================================

COMMENT ON TABLE programs IS 'Programs that organize activities and staff groups';
COMMENT ON TABLE activities IS 'Activities that belong to programs and can be scheduled';
COMMENT ON TABLE program_locations IS 'Junction table linking programs to their associated locations (many-to-many)';
COMMENT ON TABLE program_staff_groups IS 'Junction table linking programs to their staff groups (many-to-many)';

COMMENT ON COLUMN programs.color_id IS 'Optional color for visual organization of the program';

COMMENT ON COLUMN activities.program_id IS 'Program this activity belongs to (required)';
COMMENT ON COLUMN activities.default_location_id IS 'Default location for this activity';
COMMENT ON COLUMN activities.duration IS 'Default duration in minutes (mutually exclusive with fixedTime and timeBlockId)';
COMMENT ON COLUMN activities.fixed_time IS 'Fixed time JSON object with startTime, endTime, and optional dayOffset (mutually exclusive with duration and timeBlockId)';
COMMENT ON COLUMN activities.time_block_id IS 'Time block reference for scheduling (mutually exclusive with duration and fixedTime)';
COMMENT ON COLUMN activities.required_staff IS 'JSON array of required staff positions with optional certification requirements';
COMMENT ON COLUMN activities.activity_conflicts IS 'JSON object defining pre/post/concurrent activity conflicts';

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Spec fields
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    capacity INTEGER,
    color_id UUID REFERENCES colors(id) ON DELETE SET NULL,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    
    -- Group assignments (JSONB arrays)
    group_ids JSONB,
    exclude_staff_ids JSONB,
    exclude_camper_ids JSONB,
    
    -- Required staff (JSONB array of objects)
    required_staff JSONB,
    
    -- Recurrence fields
    recurrence_id UUID,
    is_recurrence_parent BOOLEAN DEFAULT false,
    recurrence_rule JSONB,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_camp_id ON events(camp_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);
CREATE INDEX IF NOT EXISTS idx_events_location_id ON events(location_id);
CREATE INDEX IF NOT EXISTS idx_events_program_id ON events(program_id);
CREATE INDEX IF NOT EXISTS idx_events_activity_id ON events(activity_id);
CREATE INDEX IF NOT EXISTS idx_events_recurrence_id ON events(recurrence_id);
CREATE INDEX IF NOT EXISTS idx_events_date_range ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON events(deleted_at);
CREATE INDEX IF NOT EXISTS idx_events_tenant_id_camp_id ON events(tenant_id, camp_id);

-- Trigger for events
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE events IS 'Events scheduled at the camp, optionally linked to activities and programs';
COMMENT ON COLUMN events.capacity IS 'Optional maximum capacity for the event';
COMMENT ON COLUMN events.activity_id IS 'Optional activity template this event was created from';
COMMENT ON COLUMN events.program_id IS 'Optional program this event belongs to';
COMMENT ON COLUMN events.recurrence_id IS 'Links events in a recurring series together';
COMMENT ON COLUMN events.is_recurrence_parent IS 'True for the first event in a recurring series';
COMMENT ON COLUMN events.recurrence_rule IS 'Original recurrence rule (only stored in parent event)';
