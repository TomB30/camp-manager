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

// Camp (singleton)
export const camp: Camp = {
  meta: {
    id: generateId(),
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
      phone: "555-CAMP-FUN",
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
      name: "Eagles Nest",
      description: "Eagles Nest",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: { beds: 10, areaId: areas[0].meta.id },
  },
  {
    meta: {
      id: generateId(),
      name: "Bears Den",
      description: "Bears Den",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: { beds: 10, areaId: areas[0].meta.id },
  },
  {
    meta: {
      id: generateId(),
      name: "Wolves Lodge",
      description: "Wolves Lodge",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: { beds: 8, areaId: areas[1].meta.id },
  },
  {
    meta: {
      id: generateId(),
      name: "Hawks Haven",
      description: "Hawks Haven",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: { beds: 8, areaId: areas[1].meta.id },
  },
  {
    meta: {
      id: generateId(),
      name: "Deer Cabin",
      description: "Deer Cabin",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: { beds: 10, areaId: areas[2].meta.id },
  },
  {
    meta: {
      id: generateId(),
      name: "Fox Den",
      description: "Fox Den",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: { beds: 4, areaId: areas[3].meta.id },
  },
];

// Certifications
export const certifications: Certification[] = [
  {
    meta: {
      id: generateId(),
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
      name: "Sarah Johnson",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      roleId: roles[0].meta.id, // Camp Director
      email: "sarah.johnson@camp.com",
      phone: "555-0101",
      certificationIds: [certifications[0].meta.id, certifications[2].meta.id],
      photoUrl: "https://i.pravatar.cc/150?u=sarah",
    },
  },
  {
    meta: {
      id: generateId(),
      name: "Michael Chen",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      roleId: roles[1].meta.id, // Program Supervisor
      email: "michael.chen@camp.com",
      phone: "555-0102",
      certificationIds: [certifications[0].meta.id, certifications[1].meta.id],
      photoUrl: "https://i.pravatar.cc/150?u=michael",
    },
  },
  {
    meta: {
      id: generateId(),
      name: "Emily Rodriguez",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      roleId: roles[2].meta.id, // Camp Counselor
      email: "emily.rodriguez@camp.com",
      phone: "555-0103",
      certificationIds: [certifications[0].meta.id, certifications[4].meta.id],
      photoUrl: "https://i.pravatar.cc/150?u=emily",
    },
  },
  {
    meta: {
      id: generateId(),
      name: "David Thompson",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      roleId: roles[2].meta.id, // Camp Counselor
      email: "david.thompson@camp.com",
      phone: "555-0104",
      certificationIds: [certifications[0].meta.id, certifications[1].meta.id],
      photoUrl: "https://i.pravatar.cc/150?u=david",
    },
  },
  {
    meta: {
      id: generateId(),
      name: "Jessica Martinez",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      roleId: roles[3].meta.id, // Camp Nurse
      email: "jessica.martinez@camp.com",
      phone: "555-0105",
      certificationIds: [certifications[0].meta.id],
      photoUrl: "https://i.pravatar.cc/150?u=jessica",
    },
  },
  {
    meta: {
      id: generateId(),
      name: "Daniel Lee",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      roleId: roles[4].meta.id, // Activity Instructor
      email: "daniel.lee@camp.com",
      phone: "555-0106",
      certificationIds: [certifications[0].meta.id, certifications[7].meta.id],
      photoUrl: "https://i.pravatar.cc/150?u=daniel",
    },
  },
  {
    meta: {
      id: generateId(),
      name: "Ashley Wilson",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      roleId: roles[2].meta.id, // Camp Counselor
      email: "ashley.wilson@camp.com",
      phone: "555-0107",
      certificationIds: [certifications[0].meta.id],
      photoUrl: "https://i.pravatar.cc/150?u=ashley",
    },
  },
  {
    meta: {
      id: generateId(),
      name: "Andrew Nguyen",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      roleId: roles[2].meta.id, // Camp Counselor
      email: "andrew.nguyen@camp.com",
      phone: "555-0108",
      certificationIds: [certifications[0].meta.id],
      photoUrl: "https://i.pravatar.cc/150?u=andrew",
    },
  },
  {
    meta: {
      id: generateId(),
      name: "Olivia Patel",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      roleId: roles[1].meta.id, // Program Supervisor
      email: "olivia.patel@camp.com",
      phone: "555-0109",
      certificationIds: [certifications[0].meta.id, certifications[5].meta.id],
      photoUrl: "https://i.pravatar.cc/150?u=olivia",
    },
  },
  {
    meta: {
      id: generateId(),
      name: "Ethan Kim",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      roleId: roles[4].meta.id, // Activity Instructor
      email: "ethan.kim@camp.com",
      phone: "555-0110",
      certificationIds: [certifications[0].meta.id, certifications[7].meta.id],
      photoUrl: "https://i.pravatar.cc/150?u=ethan",
    },
  },
];

// Set manager IDs after array creation
staffMembers[1].spec.managerId = staffMembers[0].meta.id; // Michael reports to Sarah
staffMembers[2].spec.managerId = staffMembers[1].meta.id; // Emily reports to Michael
staffMembers[3].spec.managerId = staffMembers[1].meta.id; // David reports to Michael
staffMembers[4].spec.managerId = staffMembers[0].meta.id; // Jessica reports to Sarah
staffMembers[5].spec.managerId = staffMembers[1].meta.id; // Ryan reports to Michael
staffMembers[6].spec.managerId = staffMembers[1].meta.id; // Amanda reports to Michael
staffMembers[7].spec.managerId = staffMembers[1].meta.id; // Christopher reports to Michael
staffMembers[8].spec.managerId = staffMembers[1].meta.id; // Rachel reports to Michael
staffMembers[9].spec.managerId = staffMembers[1].meta.id; // Daniel reports to Michael

// Groups (6 groups with housing rooms)
export const groups: Group[] = [
  {
    meta: {
      id: generateId(),
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
      labelIds: [],
    },
  },
  {
    meta: {
      id: generateId(),
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
      labelIds: [],
    },
  },
  {
    meta: {
      id: generateId(),
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
      labelIds: [],
    },
  },
  {
    meta: {
      id: generateId(),
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
      labelIds: [],
    },
  },
  {
    meta: {
      id: generateId(),
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
      labelIds: [],
    },
  },
  {
    meta: {
      id: generateId(),
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
      labelIds: [],
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

    const camper: Camper = {
      meta: {
        id: generateId(),
        name: `${camperFirstNames[camperIndex]} ${camperLastNames[camperIndex]}`,
        createdAt: octoberDate(1),
        updatedAt: octoberDate(1),
      },
      spec: {
        age,
        gender,
        photoUrl: `https://i.pravatar.cc/150?u=camper${camperIndex}`,
        registrationDate: octoberDate(1, 10, camperIndex),
        sessionId: group.spec.sessionId,
        housingRoomId: group.spec.housingRoomId,
        familyGroupId: group.meta.id,
      },
    };
    campers.push(camper);
    camperIndex++;
  }
});

// Programs (4 programs)
export const programs: Program[] = [
  {
    meta: {
      id: generateId(),
      name: "Outdoor Adventures",
      description: "Hiking, camping, and wilderness exploration",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      colorId: colors[2].meta.id,
      activityIds: [], // Will be filled after activities are created
      staffMemberIds: [
        staffMembers[5].meta.id,
        staffMembers[6].meta.id,
        staffMembers[9].meta.id,
      ],
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
      name: "Water Sports",
      description: "Swimming, kayaking, and water safety",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      colorId: colors[0].meta.id,
      activityIds: [],
      staffMemberIds: [staffMembers[3].meta.id, staffMembers[8].meta.id],
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
      name: "Arts & Creativity",
      description: "Painting, crafts, music, and creative expression",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      colorId: colors[4].meta.id,
      activityIds: [],
      staffMemberIds: [staffMembers[2].meta.id, staffMembers[7].meta.id],
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
      name: "Sports & Games",
      description: "Team sports, games, and physical activities",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      colorId: colors[1].meta.id,
      activityIds: [],
      staffMemberIds: [
        staffMembers[3].meta.id,
        staffMembers[5].meta.id,
        staffMembers[9].meta.id,
      ],
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
      name: "Nature Hike",
      description: "Guided nature walk through forest trails",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[0].meta.id],
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
      name: "Wildlife Discovery",
      description: "Learn about local wildlife and ecosystems",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[0].meta.id],
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
      name: "Campfire Stories",
      description: "Evening storytelling around the campfire",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[0].meta.id],
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
      name: "Outdoor Survival Skills",
      description: "Learn basic wilderness survival techniques",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[0].meta.id],
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
      name: "Swimming Lessons",
      description: "Learn to swim or improve swimming skills",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[1].meta.id],
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
      name: "Kayaking Adventure",
      description: "Kayaking basics and water exploration",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[1].meta.id],
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
      name: "Beach Games",
      description: "Fun games and activities on the beach",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[1].meta.id],
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
      name: "Painting Workshop",
      description: "Express yourself through watercolor and acrylics",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[2].meta.id],
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
      name: "Crafts & DIY",
      description: "Create handmade crafts and projects",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[2].meta.id],
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
      name: "Music Jam Session",
      description: "Learn instruments and make music together",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[2].meta.id],
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
      name: "Theater & Drama",
      description: "Acting, improvisation, and performance",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[2].meta.id],
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
      name: "Basketball",
      description: "Team basketball games and drills",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[3].meta.id],
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
      name: "Soccer Practice",
      description: "Soccer skills and friendly matches",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[3].meta.id],
      duration: 60,
      defaultLocationId: locations[4].meta.id,
      minStaff: 1,
      defaultCapacity: 40,
    },
  },
  {
    meta: {
      id: generateId(),
      name: "Board Game Tournament",
      description: "Strategy games and friendly competition",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[3].meta.id],
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
      name: "Team Building Games",
      description: "Cooperative games and challenges",
      createdAt: octoberDate(1),
      updatedAt: octoberDate(1),
    },
    spec: {
      programIds: [programs[3].meta.id],
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
        programId: activity.spec.programIds[0],
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
