-- Migration: 001_init_tenants_camps_users (DOWN)
-- Description: Rolls back initial tables for tenants, camps, users, access rules, refresh tokens, colors, areas, certifications, sessions, roles, locations, housing_rooms, campers, staff_members, groups, and junction tables
-- Created: 2025-11-06

-- Drop tables in reverse order of dependencies
-- First drop events and related tables
DROP TABLE IF EXISTS events CASCADE;

-- Drop junction tables for programs and activities
DROP TABLE IF EXISTS program_staff_groups CASCADE;
DROP TABLE IF EXISTS program_locations CASCADE;

-- Drop activities and programs
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS programs CASCADE;

-- Drop junction tables for groups, campers, staff
DROP TABLE IF EXISTS staff_member_certifications CASCADE;
DROP TABLE IF EXISTS group_groups CASCADE;
DROP TABLE IF EXISTS group_staff_members CASCADE;
DROP TABLE IF EXISTS group_campers CASCADE;

-- Drop import jobs table
DROP TABLE IF EXISTS import_jobs CASCADE;

-- Then drop main tables
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS staff_members CASCADE;
DROP TABLE IF EXISTS campers CASCADE;

-- Original tables
DROP TABLE IF EXISTS time_blocks CASCADE;
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

