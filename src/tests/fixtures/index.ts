/**
 * Test fixtures index
 * Central export point for all test fixtures
 */

// Core fixtures
export * from "./colors.fixture";
export * from "./sessions.fixture";
export * from "./roles.fixture";
export * from "./certifications.fixture";
export * from "./programs.fixture";
export * from "./areas.fixture";
export * from "./locations.fixture";
export * from "./housingRooms.fixture";

// Entity fixtures
export * from "./campers.fixture";
export * from "./staffMembers.fixture";
export * from "./activities.fixture";
export * from "./events.fixture";
export * from "./groups.fixture";

// Utilities
export * from "./builders";
export * from "./scenarios";

/**
 * Get all fixtures as a single object
 */
export const getAllFixtures = () => ({
  colors: require("./colors.fixture").colorsFixture,
  sessions: require("./sessions.fixture").sessionsFixture,
  roles: require("./roles.fixture").rolesFixture,
  certifications: require("./certifications.fixture").certificationsFixture,
  programs: require("./programs.fixture").programsFixture,
  areas: require("./areas.fixture").areasFixture,
  locations: require("./locations.fixture").locationsFixture,
  housingRooms: require("./housingRooms.fixture").housingRoomsFixture,
  campers: require("./campers.fixture").campersFixture,
  staffMembers: require("./staffMembers.fixture").staffMembersFixture,
  activities: require("./activities.fixture").activitiesFixture,
  events: require("./events.fixture").eventsFixture,
  groups: require("./groups.fixture").groupsFixture,
});

