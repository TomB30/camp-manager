-- Migration: 001_init_tenants_camps_users (DOWN)
-- Description: Rolls back initial tables for tenants, camps, users, access rules, refresh tokens, colors, areas, certifications, sessions, roles, locations, and housing_rooms
-- Created: 2025-11-06

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS housing_rooms CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS areas CASCADE;
DROP TABLE IF EXISTS colors CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS access_rules CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS camps CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop UUID extension (optional - only if you're sure nothing else uses it)
-- DROP EXTENSION IF EXISTS "uuid-ossp";

