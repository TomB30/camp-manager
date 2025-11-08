/**
 * Mock data for the camp manager application
 * This file contains all the sample data used for development and testing
 */

import type {
  Camper,
  StaffMember,
  Location,
  HousingRoom,
  Event,
  Area,
  Group,
  Program,
  Activity,
  Certification,
  Color,
  Session,
  Role,
  Camp,
  DurationPreset,
} from "@/generated/api";

// Helper function to generate UUIDs (simple version for mock data)
let idCounter = 0;
const generateId = (): string => {
  idCounter++;
  return `00000000-0000-0000-0000-${idCounter.toString().padStart(12, "0")}`;
};

// Helper to format date for October 2025
const octoberDate = (
  day: number,
  hour: number = 9,
  minute: number = 0,
): string => {
  return new Date(2025, 9, day, hour, minute).toISOString();
};

// Constants for multi-tenancy
const TENANT_ID = generateId();
const CAMP_ID = generateId();

// Camp (singleton)
export const camp: Camp = {
  meta: {
    id: CAMP_ID,
    tenantId: TENANT_ID,
    name: "Sunset Lake Summer Camp",
    description:
      "A premier summer camp experience nestled in the beautiful mountains, offering adventure, learning, and lifelong friendships.",
    createdAt: octoberDate(1),
    updatedAt: octoberDate(1),
  },
  spec: {
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    dailyStartTime: "08:00",
    dailyEndTime: "20:00",
    address: {
      street: "123 Camp Road",
      city: "Mountain View",
      state: "CA",
      zipCode: "94043",
      country: "USA",
    },
    contactInfo: {
      phone: "555-camp-FUN",
      email: "info@sunsetlakecamp.com",
      website: "https://www.sunsetlakecamp.com",
    },
    logoUrl: "https://via.placeholder.com/200x200?text=Camp+Logo",
  },
};

// Duration Presets
export const durationPresets: DurationPreset[] = [
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Quick Activity",
      description: "Short 30-minute activities or transitions",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      durationMinutes: 30,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Standard Session",
      description: "Standard 1-hour activity session",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      durationMinutes: 60,
      default: true,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Extended Activity",
      description: "90-minute extended activity session",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      durationMinutes: 90,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Half Day",
      description: "2-hour half-day program",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      durationMinutes: 120,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Full Program",
      description: "3-hour full program session",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      durationMinutes: 180,
    },
  },
];

// Colors
export const colors: Color[] = [
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Ocean Blue",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      hexValue: "#0891B2",
      default: true,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Sunset Orange",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      hexValue: "#F97316",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Forest Green",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      hexValue: "#16A34A",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Berry Purple",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      hexValue: "#9333EA",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Coral Pink",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      hexValue: "#EC4899",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Sky Blue",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      hexValue: "#3B82F6",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Lemon Yellow",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      hexValue: "#EAB308",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Cherry Red",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      hexValue: "#DC2626",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Mint Green",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      hexValue: "#10B981",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Lavender",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      hexValue: "#A855F7",
    },
  },
];

// Camp Sessions (6 sessions)
export const sessions: Session[] = [
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Early Fall Session",
      description: "Perfect start to fall activities",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      startDate: "2025-10-01",
      endDate: "2025-10-05",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Mid Fall Session A",
      description: "Mid-fall adventures",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      startDate: "2025-10-06",
      endDate: "2025-10-10",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Mid Fall Session B",
      description: "Continued fall fun",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      startDate: "2025-10-11",
      endDate: "2025-10-15",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Late Fall Session A",
      description: "Late fall exploration",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      startDate: "2025-10-16",
      endDate: "2025-10-20",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Late Fall Session B",
      description: "Halloween prep week",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      startDate: "2025-10-21",
      endDate: "2025-10-25",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Mid Fall Session A",
      description: "Mid-fall adventures",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      startDate: "2025-10-06",
      endDate: "2025-10-10",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Mid Fall Session B",
      description: "Continued fall fun",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      startDate: "2025-10-11",
      endDate: "2025-10-15",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Halloween Week",
      description: "Spooky fun and festivities",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      startDate: "2025-10-26",
      endDate: "2025-10-31",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Late Fall Session B",
      description: "Halloween prep week",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      startDate: "2025-10-21",
      endDate: "2025-10-25",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Halloween Week",
      description: "Spooky fun and festivities",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      startDate: "2025-10-26",
      endDate: "2025-10-31",
    },
  },
];

// Areas (4 areas)
export const areas: Area[] = [
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "North Campus",
      description: "Main activity area with classrooms and sports facilities",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 150,
      equipment: ["Tables", "Chairs", "Whiteboards", "Projectors"],
      notes: "Primary area for structured activities",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Lakefront",
      description: "Waterfront area for aquatic activities",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 60,
      equipment: ["Kayaks", "Life jackets", "Canoes", "Swimming platforms"],
      notes: "Requires lifeguard certification",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Forest Trail",
      description: "Outdoor adventure area with hiking trails",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 80,
      equipment: ["Trail markers", "First aid stations", "Binoculars"],
      notes: "Great for nature exploration",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Central Commons",
      description: "Indoor gathering space and dining area",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 200,
      equipment: ["Tables", "Chairs", "Kitchen facilities", "Stage"],
      notes: "Main dining and assembly area",
    },
  },
];

// Locations (16 locations distributed across areas)
export const locations: Location[] = [
  // North Campus locations
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Classroom A",
      description: "Main classroom",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 25,
      areaId: areas[0].meta.id,
      equipment: ["Projector", "Whiteboard"],
      notes: "Main classroom",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Classroom B",
      description: "Science lab",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 25,
      areaId: areas[0].meta.id,
      equipment: ["Projector", "Whiteboard"],
      notes: "Science lab",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Art Studio",
      description: "Creative space",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 20,
      areaId: areas[0].meta.id,
      equipment: ["Easels", "Paint supplies", "Clay"],
      notes: "Creative space",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Basketball Court",
      description: "Indoor court",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 30,
      areaId: areas[0].meta.id,
      equipment: ["Soccer balls", "Goals", "Cones"],
      notes: "Outdoor field",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Sports Field",
      description: "Outdoor field",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 40,
      areaId: areas[0].meta.id,
      equipment: ["Soccer balls", "Goals", "Cones"],
      notes: "Outdoor field",
    },
  },
  // Lakefront locations
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Swimming Area",
      description: "Supervised swimming",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 30,
      areaId: areas[1].meta.id,
      equipment: ["Life jackets", "Floats"],
      notes: "Supervised swimming",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Boating Dock",
      description: "Water activities",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 20,
      areaId: areas[1].meta.id,
      equipment: ["Kayaks", "Canoes", "Paddles"],
      notes: "Water activities",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Beach Area",
      description: "Sandy beach",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 40,
      areaId: areas[1].meta.id,
      equipment: ["Beach toys", "Umbrellas"],
      notes: "Sandy beach",
    },
  },

  // Forest Trail locations
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "North Trail Head",
      description: "Hiking start point",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 25,
      areaId: areas[2].meta.id,
      equipment: ["Trail maps", "First aid kit"],
      notes: "Hiking start point",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Nature Center",
      description: "Educational center",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 30,
      areaId: areas[2].meta.id,
      equipment: ["Microscopes", "Field guides", "Specimens"],
      notes: "Educational center",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Campfire Circle",
      description: "Evening activities",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 50,
      areaId: areas[2].meta.id,
      equipment: ["Fire pit", "Benches", "S'more supplies"],
      notes: "Evening activities",
    },
  },

  // Central Commons locations
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Main Dining Hall",
      description: "All meals served here",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 150,
      areaId: areas[3].meta.id,
      equipment: ["Tables", "Chairs", "Serving stations"],
      notes: "All meals served here",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Assembly Hall",
      description: "Large gatherings",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 200,
      areaId: areas[3].meta.id,
      equipment: ["Stage", "Sound system", "Projector"],
      notes: "Large gatherings",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Game Room",
      description: "Recreation",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 30,
      areaId: areas[3].meta.id,
      equipment: ["Board games", "Video games", "Pool table"],
      notes: "Recreation",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Craft Workshop",
      description: "Hands-on projects",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 25,
      areaId: areas[3].meta.id,
      equipment: ["Craft supplies", "Tools", "Workbenches"],
      notes: "Hands-on projects",
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Music Room",
      description: "Music activities",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      capacity: 20,
      areaId: areas[3].meta.id,
      equipment: ["Instruments", "Music stands", "Speakers"],
      notes: "Music activities",
    },
  },
];

// Housing Rooms (6 rooms distributed across areas)
export const housingRooms: HousingRoom[] = [
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Eagles Nest",
      description: "Eagles Nest",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: { beds: 10, areaId: areas[0].meta.id, bathroom: "shared" },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Bears Den",
      description: "Bears Den",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: { beds: 10, areaId: areas[0].meta.id, bathroom: "shared" },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Wolves Lodge",
      description: "Wolves Lodge",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: { beds: 8, areaId: areas[1].meta.id, bathroom: "shared" },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Hawks Haven",
      description: "Hawks Haven",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: { beds: 8, areaId: areas[1].meta.id, bathroom: "shared" },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Deer Cabin",
      description: "Deer Cabin",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: { beds: 10, areaId: areas[2].meta.id, bathroom: "shared" },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Fox Den",
      description: "Fox Den",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: { beds: 4, areaId: areas[3].meta.id, bathroom: "private" },
  },
];

// Certifications
export const certifications: Certification[] = [
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "First Aid",
      description: "First Aid",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Lifeguard",
      description: "Lifeguard",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Arts & Crafts Instructor",
      description: "Art education and safety certification",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Camp Director",
      description: "Overall camp management and leadership",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Program Supervisor",
      description: "Oversees program activities and staff coordination",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Camp Counselor",
      description: "Direct camper supervision and activity facilitation",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Camp Nurse",
      description: "Medical care and health management",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Activity Instructor",
      description: "Specialized activity instruction and skill development",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
];

export const roles: Role[] = [
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Camp Director",
      description: "Overall camp management and leadership",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Program Supervisor",
      description: "Oversees program activities and staff coordination",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Camp Counselor",
      description: "Direct camper supervision and activity facilitation",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Camp Nurse",
      description: "Medical care and health management",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Activity Instructor",
      description: "Specialized activity instruction and skill development",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {},
  },
];

// Staff Members (10 staff) (now using meta/spec)
export const staffMembers: StaffMember[] = [
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Sarah Johnson",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      birthday: "2006-12-01",
      roleId: roles[0].meta.id, // Camp Director
      phone: "555-0101",
      gender: "female",
      certificationIds: [certifications[0].meta.id, certifications[2].meta.id],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Michael Chen",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      birthday: "2002-11-02",
      roleId: roles[1].meta.id, // Program Supervisor
      phone: "555-0102",
      gender: "male",
      certificationIds: [certifications[0].meta.id, certifications[1].meta.id],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Emily Rodriguez",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      birthday: "2005-01-03",
      roleId: roles[2].meta.id, // Camp Counselor
      phone: "555-0103",
      gender: "female",
      certificationIds: [certifications[0].meta.id, certifications[4].meta.id],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "David Thompson",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      birthday: "2009-11-07",
      roleId: roles[2].meta.id, // Camp Counselor
      phone: "555-0104",
      gender: "male",
      certificationIds: [certifications[0].meta.id, certifications[1].meta.id],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Jessica Martinez",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      birthday: "2007-10-05",
      roleId: roles[3].meta.id, // Camp Nurse
      phone: "555-0105",
      gender: "female",
      certificationIds: [certifications[0].meta.id],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Daniel Lee",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      birthday: "2008-03-06",
      roleId: roles[4].meta.id, // Activity Instructor
      phone: "555-0106",
      gender: "male",
      certificationIds: [certifications[0].meta.id, certifications[7].meta.id],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Ashley Wilson",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      birthday: "2008-04-07",
      roleId: roles[2].meta.id, // Camp Counselor
      phone: "555-0107",
      gender: "female",
      certificationIds: [certifications[0].meta.id],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Andrew Nguyen",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      birthday: "2018-11-08",
      roleId: roles[2].meta.id, // Camp Counselor
      phone: "555-0108",
      gender: "male",
      certificationIds: [certifications[0].meta.id],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Olivia Patel",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      birthday: "2018-11-09",
      roleId: roles[1].meta.id, // Program Supervisor
      phone: "555-0109",
      gender: "female",
      certificationIds: [certifications[0].meta.id, certifications[5].meta.id],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Ethan Kim",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      birthday: "2019-11-10",
      roleId: roles[4].meta.id, // Activity Instructor
      phone: "555-0110",
      gender: "male",
      certificationIds: [certifications[0].meta.id, certifications[7].meta.id],
    },
  },
];

// Groups (6 groups with housing rooms)
export const groups: Group[] = [
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Eagles Group",
      description: "Adventurous group in Eagles Nest",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      housingRoomId: housingRooms[0].meta.id,
      staffIds: [staffMembers[2].meta.id, staffMembers[3].meta.id],
      sessionId: sessions[0].meta.id,
      camperIds: [], // Will be populated after campers are created
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Bears Group",
      description: "Strong and brave Bears group",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      housingRoomId: housingRooms[1].meta.id,
      staffIds: [staffMembers[6].meta.id, staffMembers[7].meta.id],
      sessionId: sessions[1].meta.id,
      camperIds: [],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Wolves Group",
      description: "Pack-minded Wolves team",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      housingRoomId: housingRooms[2].meta.id,
      staffIds: [staffMembers[8].meta.id],
      sessionId: sessions[2].meta.id,
      camperIds: [],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Hawks Group",
      description: "Sharp-eyed Hawks group",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      housingRoomId: housingRooms[3].meta.id,
      staffIds: [staffMembers[9].meta.id],
      sessionId: sessions[3].meta.id,
      camperIds: [],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Deer Group",
      description: "Graceful and gentle Deer cabin",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      housingRoomId: housingRooms[4].meta.id,
      staffIds: [staffMembers[2].meta.id],
      sessionId: sessions[4].meta.id,
      camperIds: [],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Fox Group",
      description: "Clever Fox Den residents",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      housingRoomId: housingRooms[5].meta.id,
      staffIds: [staffMembers[6].meta.id],
      sessionId: sessions[5].meta.id,
      camperIds: [],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Water sports staff group",
      description: "Staff group for water sports program",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      staffIds: [staffMembers[2].meta.id, staffMembers[3].meta.id],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Outdoor adventures staff group",
      description: "Staff group for outdoor adventures program",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      staffIds: [staffMembers[6].meta.id, staffMembers[7].meta.id],
    },
  },
];

// Campers (50 campers, distributed across groups)
const camperFirstNames = [
  "Alex",
  "Bailey",
  "Charlie",
  "Dakota",
  "Ellis",
  "Finley",
  "Gray",
  "Harper",
  "Indigo",
  "Jordan",
  "Kai",
  "Logan",
  "Morgan",
  "Noah",
  "Olive",
  "Parker",
  "Quinn",
  "River",
  "Sage",
  "Taylor",
  "Uma",
  "Val",
  "Wren",
  "Xander",
  "Yuki",
  "Zara",
  "Avery",
  "Blake",
  "Casey",
  "Drew",
  "Emery",
  "Frankie",
  "Genesis",
  "Hayden",
  "Iris",
  "Jules",
  "Kendall",
  "Lane",
  "Marley",
  "Noel",
  "Ocean",
  "Peyton",
  "Quincy",
  "Reese",
  "Skylar",
  "Tatum",
  "Unity",
  "Vienna",
  "Winter",
  "Zion",
];

const camperLastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
];

export const campers: Camper[] = [];

// Distribute campers across groups
const campersPerGroup = [10, 10, 8, 8, 10, 4]; // Matches housing room bed counts

let camperIndex = 0;
groups.forEach((group, groupIndex) => {
  const numCampers = campersPerGroup[groupIndex];
  for (let i = 0; i < numCampers; i++) {
    const gender = Math.random() > 0.5 ? "male" : "female";
    const age = 8 + Math.floor(Math.random() * 7); // Ages 8-14
    // Calculate birthday based on age (making them that age in October 2025)
    const birthYear = 2025 - age;
    const birthMonth = Math.floor(Math.random() * 12); // Random month 0-11
    const birthDay = 1 + Math.floor(Math.random() * 28); // Day 1-28 (safe for all months)
    const birthday = `${birthYear}-${String(birthMonth + 1).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;

    const camper: Camper = {
      meta: {
        tenantId: TENANT_ID,
        campId: CAMP_ID,
        id: generateId(),
        name: `${camperFirstNames[camperIndex]} ${camperLastNames[camperIndex]}`,
        createdAt: octoberDate(1),
        updatedAt: octoberDate(1),
      },
      spec: {
        birthday,
        gender,
        sessionId: group.spec.sessionId || "",
        housingGroupId: group.spec.housingRoomId,
        groupIds: [group.meta.id],
      },
    };
    campers.push(camper);
    if (!group.spec.camperIds) {
      group.spec.camperIds = [];
    }
    group.spec.camperIds.push(camper.meta.id);
    camperIndex++;
  }
});

// Programs (4 programs)
export const programs: Program[] = [
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Outdoor Adventures",
      description: "Hiking, camping, and wilderness exploration",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      colorId: colors[2].meta.id,
      activityIds: [], // Will be filled after activities are created
      staffGroupIds: [groups[7].meta.id],
      locationIds: [
        locations[8].meta.id,
        locations[9].meta.id,
        locations[10].meta.id,
      ],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Water Sports",
      description: "Swimming, kayaking, and water safety",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      colorId: colors[0].meta.id,
      activityIds: [],
      staffGroupIds: [groups[6].meta.id],
      locationIds: [
        locations[5].meta.id,
        locations[6].meta.id,
        locations[7].meta.id,
      ],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Arts & Creativity",
      description: "Painting, crafts, music, and creative expression",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      colorId: colors[4].meta.id,
      activityIds: [],
      staffGroupIds: [],
      locationIds: [
        locations[2].meta.id,
        locations[14].meta.id,
        locations[15].meta.id,
      ],
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Sports & Games",
      description: "Team sports, games, and physical activities",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      colorId: colors[1].meta.id,
      activityIds: [],
      staffGroupIds: [],
      locationIds: [
        locations[3].meta.id,
        locations[4].meta.id,
        locations[13].meta.id,
      ],
    },
  },
];

// Activities (distributed across programs)
export const activities: Activity[] = [
  // Outdoor Adventures activities
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Nature Hike",
      description: "Guided nature walk through forest trails",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[0].meta.id,
      duration: 90,
      defaultLocationId: locations[8].meta.id,
      requiredCertificationIds: [certifications[2].meta.id],
      minStaff: 2,
      defaultCapacity: 25,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Wildlife Discovery",
      description: "Learn about local wildlife and ecosystems",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[0].meta.id,
      duration: 60,
      defaultLocationId: locations[9].meta.id,
      requiredCertificationIds: [certifications[2].meta.id],
      minStaff: 1,
      defaultCapacity: 30,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Campfire Stories",
      description: "Evening storytelling around the campfire",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[0].meta.id,
      duration: 60,
      defaultLocationId: locations[10].meta.id,
      requiredCertificationIds: [certifications[2].meta.id],
      minStaff: 1,
      defaultCapacity: 50,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Outdoor Survival Skills",
      description: "Learn basic wilderness survival techniques",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[0].meta.id,
      duration: 120,
      defaultLocationId: locations[8].meta.id,
      requiredCertificationIds: [certifications[2].meta.id],
      minStaff: 2,
      defaultCapacity: 20,
    },
  },

  // Water Sports activities
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Swimming Lessons",
      description: "Learn to swim or improve swimming skills",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[1].meta.id,
      duration: 60,
      defaultLocationId: locations[5].meta.id,
      requiredCertificationIds: [certifications[1].meta.id],
      minStaff: 2,
      defaultCapacity: 30,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Kayaking Adventure",
      description: "Kayaking basics and water exploration",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[1].meta.id,
      duration: 90,
      defaultLocationId: locations[6].meta.id,
      requiredCertificationIds: [certifications[1].meta.id],
      minStaff: 2,
      defaultCapacity: 20,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Beach Games",
      description: "Fun games and activities on the beach",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[1].meta.id,
      duration: 60,
      defaultLocationId: locations[7].meta.id,
      requiredCertificationIds: [certifications[1].meta.id],
      minStaff: 2,
      defaultCapacity: 40,
    },
  },
  // Arts & Creativity activities
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Painting Workshop",
      description: "Express yourself through watercolor and acrylics",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[2].meta.id,
      duration: 90,
      defaultLocationId: locations[2].meta.id,
      requiredCertificationIds: [certifications[4].meta.id],
      minStaff: 1,
      defaultCapacity: 20,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Crafts & DIY",
      description: "Create handmade crafts and projects",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[2].meta.id,
      duration: 60,
      defaultLocationId: locations[14].meta.id,
      requiredCertificationIds: [certifications[4].meta.id],
      minStaff: 1,
      defaultCapacity: 25,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Music Jam Session",
      description: "Learn instruments and make music together",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[2].meta.id,
      duration: 60,
      defaultLocationId: locations[15].meta.id,
      requiredCertificationIds: [certifications[4].meta.id],
      minStaff: 1,
      defaultCapacity: 20,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Theater & Drama",
      description: "Acting, improvisation, and performance",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[2].meta.id,
      duration: 90,
      defaultLocationId: locations[12].meta.id,
      requiredCertificationIds: [certifications[4].meta.id],
      minStaff: 1,
      defaultCapacity: 30,
    },
  },
  // Sports & Games activities
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Basketball",
      description: "Team basketball games and drills",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[3].meta.id,
      duration: 60,
      defaultLocationId: locations[3].meta.id,
      requiredCertificationIds: [certifications[4].meta.id],
      minStaff: 1,
      defaultCapacity: 30,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Soccer Practice",
      description: "Soccer skills and friendly matches",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[3].meta.id,
      duration: 60,
      defaultLocationId: locations[4].meta.id,
      minStaff: 1,
      defaultCapacity: 40,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Board Game Tournament",
      description: "Strategy games and friendly competition",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[3].meta.id,
      duration: 90,
      defaultLocationId: locations[13].meta.id,
      requiredCertificationIds: [certifications[4].meta.id],
      minStaff: 1,
      defaultCapacity: 30,
    },
  },
  {
    meta: {
      id: generateId(),
      tenantId: TENANT_ID,
      campId: CAMP_ID,
      name: "Team Building Games",
      description: "Cooperative games and challenges",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programId: programs[3].meta.id,
      duration: 60,
      defaultLocationId: locations[4].meta.id,
      requiredCertificationIds: [certifications[4].meta.id],
      minStaff: 2,
      defaultCapacity: 40,
    },
  },
];

// Update program activity IDs
programs[0].spec.activityIds = [
  activities[0].meta.id,
  activities[1].meta.id,
  activities[2].meta.id,
  activities[3].meta.id,
];
programs[1].spec.activityIds = [
  activities[4].meta.id,
  activities[5].meta.id,
  activities[6].meta.id,
];
programs[2].spec.activityIds = [
  activities[7].meta.id,
  activities[8].meta.id,
  activities[9].meta.id,
  activities[10].meta.id,
];
programs[3].spec.activityIds = [
  activities[11].meta.id,
  activities[12].meta.id,
  activities[13].meta.id,
  activities[14].meta.id,
];

// Events (60 events across October 2025, distributed across all days)
export const events: Event[] = [];

// Helper to create events for a specific day
const createDailyEvents = (day: number, sessionIndex: number) => {
  const session = sessions[sessionIndex];
  const relevantGroups = groups.filter(
    (g) => g.spec.sessionId === session.meta.id,
  );

  if (relevantGroups.length === 0) return;

  // Morning activities (9 AM - 12 PM)
  const morningActivities = [
    { activity: activities[0], time: { hour: 9, duration: 90 } },
    { activity: activities[4], time: { hour: 9, duration: 60 } },
    { activity: activities[11], time: { hour: 10, duration: 60 } },
  ];

  // Afternoon activities (2 PM - 5 PM)
  const afternoonActivities = [
    { activity: activities[7], time: { hour: 14, duration: 90 } },
    { activity: activities[12], time: { hour: 14, duration: 60 } },
    { activity: activities[5], time: { hour: 15, duration: 90 } },
  ];

  // Evening activities (7 PM - 9 PM)
  const eveningActivities = [
    { activity: activities[2], time: { hour: 19, duration: 60 } },
    { activity: activities[10], time: { hour: 19, duration: 90 } },
  ];

  const allDayActivities = [
    ...morningActivities,
    ...afternoonActivities,
    ...eveningActivities,
  ];

  // Create 2-3 events per day
  const numEvents = 2 + (day % 2); // Alternates between 2 and 3 events per day

  for (let i = 0; i < numEvents && i < allDayActivities.length; i++) {
    const { activity, time } = allDayActivities[i];
    const group = relevantGroups[i % relevantGroups.length];

    // Get color from the activity's program
    const program = programs.find((p) =>
      p.spec.activityIds?.includes(activity.meta.id),
    );
    const eventColorId = program?.spec.colorId;

    events.push({
      meta: {
        id: generateId(),
        tenantId: TENANT_ID,
        campId: CAMP_ID,
        name: activity.meta.name,
        description: activity.meta.description,
        createdAt: octoberDate(day, time.hour, 0),
        updatedAt: octoberDate(day, time.hour, time.duration),
      },
      spec: {
        startDate: octoberDate(day, time.hour, 0),
        endDate: octoberDate(day, time.hour, time.duration),
        locationId: activity.spec.defaultLocationId || locations[0].meta.id,
        capacity: activity.spec.defaultCapacity || 30,
        groupIds: [group.meta.id],
        excludeStaffIds: [],
        excludeCamperIds: [],
        requiredCertificationIds: activity.spec.requiredCertificationIds || [],
        colorId: eventColorId,
        programId: activity.spec.programId,
        activityId: activity.meta.id,
      },
    });
  }
};

// Create events for each day of October
for (let day = 1; day <= 31; day++) {
  // Determine which session this day belongs to
  let sessionIndex = 0;
  if (day >= 1 && day <= 5) sessionIndex = 0;
  else if (day >= 6 && day <= 10) sessionIndex = 1;
  else if (day >= 11 && day <= 15) sessionIndex = 2;
  else if (day >= 16 && day <= 20) sessionIndex = 3;
  else if (day >= 21 && day <= 25) sessionIndex = 4;
  else if (day >= 26 && day <= 31) sessionIndex = 5;

  createDailyEvents(day, sessionIndex);

  // Stop if we've reached 60 events
  if (events.length >= 60) break;
}

// Trim to exactly 60 events
while (events.length > 60) {
  events.pop();
}

// Export all mock data
export const mockData = {
  camp,
  durationPresets,
  colors,
  sessions,
  areas,
  locations,
  housingRooms,
  certifications,
  roles,
  staffMembers,
  campers,
  programs,
  activities,
  groups,
  events,
};

export default mockData;
