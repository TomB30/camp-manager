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
} from "@/types";

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

// Colors
export const colors: Color[] = [
  {
    id: generateId(),
    name: "Ocean Blue",
    hexValue: "#0891B2",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Sunset Orange",
    hexValue: "#F97316",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Forest Green",
    hexValue: "#16A34A",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Berry Purple",
    hexValue: "#9333EA",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Coral Pink",
    hexValue: "#EC4899",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Sky Blue",
    hexValue: "#3B82F6",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Lemon Yellow",
    hexValue: "#EAB308",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Cherry Red",
    hexValue: "#DC2626",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Mint Green",
    hexValue: "#10B981",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Lavender",
    hexValue: "#A855F7",
    createdAt: octoberDate(1),
  },
];

// Camp Sessions (6 sessions)
export const sessions: Session[] = [
  {
    id: generateId(),
    name: "Early Fall Session",
    startDate: "2025-10-01",
    endDate: "2025-10-05",
    description: "Perfect start to fall activities",
    maxCampers: 40,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Mid Fall Session A",
    startDate: "2025-10-06",
    endDate: "2025-10-10",
    description: "Mid-fall adventures",
    maxCampers: 45,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Mid Fall Session B",
    startDate: "2025-10-11",
    endDate: "2025-10-15",
    description: "Continued fall fun",
    maxCampers: 40,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Late Fall Session A",
    startDate: "2025-10-16",
    endDate: "2025-10-20",
    description: "Late fall exploration",
    maxCampers: 38,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Late Fall Session B",
    startDate: "2025-10-21",
    endDate: "2025-10-25",
    description: "Halloween prep week",
    maxCampers: 42,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Halloween Week",
    startDate: "2025-10-26",
    endDate: "2025-10-31",
    description: "Spooky fun and festivities",
    maxCampers: 50,
    createdAt: octoberDate(1),
  },
];

// Areas (4 areas)
export const areas: Area[] = [
  {
    id: generateId(),
    name: "North Campus",
    description: "Main activity area with classrooms and sports facilities",
    type: "facility",
    capacity: 150,
    equipment: ["Tables", "Chairs", "Whiteboards", "Projectors"],
    notes: "Primary area for structured activities",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Lakefront",
    description: "Waterfront area for aquatic activities",
    type: "water",
    capacity: 60,
    equipment: ["Kayaks", "Life jackets", "Canoes", "Swimming platforms"],
    notes: "Requires lifeguard certification",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Forest Trail",
    description: "Outdoor adventure area with hiking trails",
    type: "outdoor",
    capacity: 80,
    equipment: ["Trail markers", "First aid stations", "Binoculars"],
    notes: "Great for nature exploration",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Central Commons",
    description: "Indoor gathering space and dining area",
    type: "indoor",
    capacity: 200,
    equipment: ["Tables", "Chairs", "Kitchen facilities", "Stage"],
    notes: "Main dining and assembly area",
    createdAt: octoberDate(1),
  },
];

// Locations (16 locations distributed across areas)
export const locations: Location[] = [
  // North Campus locations
  {
    id: generateId(),
    name: "Classroom A",
    capacity: 25,
    type: "classroom",
    areaId: areas[0].id,
    equipment: ["Projector", "Whiteboard"],
    notes: "Main classroom",
  },
  {
    id: generateId(),
    name: "Classroom B",
    capacity: 25,
    type: "classroom",
    areaId: areas[0].id,
    equipment: ["Projector", "Whiteboard"],
    notes: "Science lab",
  },
  {
    id: generateId(),
    name: "Art Studio",
    capacity: 20,
    type: "arts",
    areaId: areas[0].id,
    equipment: ["Easels", "Paint supplies", "Clay"],
    notes: "Creative space",
  },
  {
    id: generateId(),
    name: "Basketball Court",
    capacity: 30,
    type: "sports",
    areaId: areas[0].id,
    equipment: ["Basketballs", "Hoops"],
    notes: "Indoor court",
  },
  {
    id: generateId(),
    name: "Soccer Field",
    capacity: 40,
    type: "sports",
    areaId: areas[0].id,
    equipment: ["Soccer balls", "Goals", "Cones"],
    notes: "Outdoor field",
  },

  // Lakefront locations
  {
    id: generateId(),
    name: "Swimming Area",
    capacity: 30,
    type: "outdoor",
    areaId: areas[1].id,
    equipment: ["Life jackets", "Floats"],
    notes: "Supervised swimming",
  },
  {
    id: generateId(),
    name: "Boating Dock",
    capacity: 20,
    type: "outdoor",
    areaId: areas[1].id,
    equipment: ["Kayaks", "Canoes", "Paddles"],
    notes: "Water activities",
  },
  {
    id: generateId(),
    name: "Beach Area",
    capacity: 40,
    type: "outdoor",
    areaId: areas[1].id,
    equipment: ["Beach toys", "Umbrellas"],
    notes: "Sandy beach",
  },

  // Forest Trail locations
  {
    id: generateId(),
    name: "North Trail Head",
    capacity: 25,
    type: "outdoor",
    areaId: areas[2].id,
    equipment: ["Trail maps", "First aid kit"],
    notes: "Hiking start point",
  },
  {
    id: generateId(),
    name: "Nature Center",
    capacity: 30,
    type: "activity",
    areaId: areas[2].id,
    equipment: ["Microscopes", "Field guides", "Specimens"],
    notes: "Educational center",
  },
  {
    id: generateId(),
    name: "Campfire Circle",
    capacity: 50,
    type: "outdoor",
    areaId: areas[2].id,
    equipment: ["Fire pit", "Benches", "S'more supplies"],
    notes: "Evening activities",
  },

  // Central Commons locations
  {
    id: generateId(),
    name: "Main Dining Hall",
    capacity: 150,
    type: "dining",
    areaId: areas[3].id,
    equipment: ["Tables", "Chairs", "Serving stations"],
    notes: "All meals served here",
  },
  {
    id: generateId(),
    name: "Assembly Hall",
    capacity: 200,
    type: "activity",
    areaId: areas[3].id,
    equipment: ["Stage", "Sound system", "Projector"],
    notes: "Large gatherings",
  },
  {
    id: generateId(),
    name: "Game Room",
    capacity: 30,
    type: "activity",
    areaId: areas[3].id,
    equipment: ["Board games", "Video games", "Pool table"],
    notes: "Recreation",
  },
  {
    id: generateId(),
    name: "Craft Workshop",
    capacity: 25,
    type: "arts",
    areaId: areas[3].id,
    equipment: ["Craft supplies", "Tools", "Workbenches"],
    notes: "Hands-on projects",
  },
  {
    id: generateId(),
    name: "Music Room",
    capacity: 20,
    type: "activity",
    areaId: areas[3].id,
    equipment: ["Instruments", "Music stands", "Speakers"],
    notes: "Music activities",
  },
];

// Housing Rooms (6 rooms distributed across areas)
export const housingRooms: HousingRoom[] = [
  { id: generateId(), name: "Eagles Nest", beds: 10, areaId: areas[0].id },
  { id: generateId(), name: "Bears Den", beds: 10, areaId: areas[0].id },
  { id: generateId(), name: "Wolves Lodge", beds: 8, areaId: areas[1].id },
  { id: generateId(), name: "Hawks Haven", beds: 8, areaId: areas[1].id },
  { id: generateId(), name: "Deer Cabin", beds: 10, areaId: areas[2].id },
  { id: generateId(), name: "Fox Den", beds: 4, areaId: areas[3].id },
];

// Certifications
export const certifications: Certification[] = [
  {
    id: generateId(),
    name: "First Aid",
    description: "Basic first aid and CPR certification",
    validityPeriodMonths: 24,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Lifeguard",
    description: "Certified lifeguard for water activities",
    validityPeriodMonths: 12,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Wilderness Survival",
    description: "Outdoor survival and navigation skills",
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Archery Instructor",
    description: "Certified to teach archery",
    validityPeriodMonths: 36,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Arts & Crafts Instructor",
    description: "Art education and safety certification",
    createdAt: octoberDate(1),
  },
];

// Staff Members (10 staff)
export const staffMembers: StaffMember[] = [
  {
    id: generateId(),
    firstName: "Sarah",
    lastName: "Johnson",
    roleId: "director",
    email: "sarah.johnson@camp.com",
    phone: "555-0101",
    certificationIds: [certifications[0].id, certifications[2].id],
    photoUrl: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    id: generateId(),
    firstName: "Michael",
    lastName: "Chen",
    roleId: "supervisor",
    email: "michael.chen@camp.com",
    phone: "555-0102",
    certificationIds: [certifications[0].id, certifications[1].id],
    photoUrl: "https://i.pravatar.cc/150?u=michael",
  },
  {
    id: generateId(),
    firstName: "Emily",
    lastName: "Rodriguez",
    roleId: "counselor",
    email: "emily.rodriguez@camp.com",
    phone: "555-0103",
    certificationIds: [certifications[0].id, certifications[4].id],
    photoUrl: "https://i.pravatar.cc/150?u=emily",
  },
  {
    id: generateId(),
    firstName: "David",
    lastName: "Thompson",
    roleId: "counselor",
    email: "david.thompson@camp.com",
    phone: "555-0104",
    certificationIds: [certifications[0].id, certifications[1].id],
    photoUrl: "https://i.pravatar.cc/150?u=david",
  },
  {
    id: generateId(),
    firstName: "Jessica",
    lastName: "Martinez",
    roleId: "nurse",
    email: "jessica.martinez@camp.com",
    phone: "555-0105",
    certificationIds: [certifications[0].id],
    photoUrl: "https://i.pravatar.cc/150?u=jessica",
  },
  {
    id: generateId(),
    firstName: "Ryan",
    lastName: "Anderson",
    roleId: "instructor",
    email: "ryan.anderson@camp.com",
    phone: "555-0106",
    certificationIds: [certifications[0].id, certifications[3].id],
    photoUrl: "https://i.pravatar.cc/150?u=ryan",
  },
  {
    id: generateId(),
    firstName: "Amanda",
    lastName: "White",
    roleId: "counselor",
    email: "amanda.white@camp.com",
    phone: "555-0107",
    certificationIds: [certifications[0].id, certifications[2].id],
    photoUrl: "https://i.pravatar.cc/150?u=amanda",
  },
  {
    id: generateId(),
    firstName: "Christopher",
    lastName: "Lee",
    roleId: "instructor",
    email: "chris.lee@camp.com",
    phone: "555-0108",
    certificationIds: [certifications[0].id, certifications[4].id],
    photoUrl: "https://i.pravatar.cc/150?u=chris",
  },
  {
    id: generateId(),
    firstName: "Rachel",
    lastName: "Brown",
    roleId: "counselor",
    email: "rachel.brown@camp.com",
    phone: "555-0109",
    certificationIds: [certifications[0].id, certifications[1].id],
    photoUrl: "https://i.pravatar.cc/150?u=rachel",
  },
  {
    id: generateId(),
    firstName: "Daniel",
    lastName: "Wilson",
    roleId: "counselor",
    email: "daniel.wilson@camp.com",
    phone: "555-0110",
    certificationIds: [certifications[0].id, certifications[2].id],
    photoUrl: "https://i.pravatar.cc/150?u=daniel",
  },
];

// Set manager IDs after array creation
staffMembers[1].managerId = staffMembers[0].id; // Michael reports to Sarah
staffMembers[2].managerId = staffMembers[1].id; // Emily reports to Michael
staffMembers[3].managerId = staffMembers[1].id; // David reports to Michael
staffMembers[4].managerId = staffMembers[0].id; // Jessica reports to Sarah
staffMembers[5].managerId = staffMembers[1].id; // Ryan reports to Michael
staffMembers[6].managerId = staffMembers[1].id; // Amanda reports to Michael
staffMembers[7].managerId = staffMembers[1].id; // Christopher reports to Michael
staffMembers[8].managerId = staffMembers[1].id; // Rachel reports to Michael
staffMembers[9].managerId = staffMembers[1].id; // Daniel reports to Michael

// Groups (6 groups with housing rooms)
export const groups: Group[] = [
  {
    id: generateId(),
    name: "Eagles Group",
    description: "Adventurous group in Eagles Nest",
    housingRoomId: housingRooms[0].id,
    staffIds: [staffMembers[2].id, staffMembers[3].id],
    sessionId: sessions[0].id,
    colorId: colors[0].id,
    camperIds: [], // Will be populated after campers are created
    labelIds: [],
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Bears Group",
    description: "Strong and brave Bears group",
    housingRoomId: housingRooms[1].id,
    staffIds: [staffMembers[6].id, staffMembers[7].id],
    sessionId: sessions[1].id,
    colorId: colors[1].id,
    camperIds: [],
    labelIds: [],
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Wolves Group",
    description: "Pack-minded Wolves team",
    housingRoomId: housingRooms[2].id,
    staffIds: [staffMembers[8].id],
    sessionId: sessions[2].id,
    colorId: colors[2].id,
    camperIds: [],
    labelIds: [],
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Hawks Group",
    description: "Sharp-eyed Hawks group",
    housingRoomId: housingRooms[3].id,
    staffIds: [staffMembers[9].id],
    sessionId: sessions[3].id,
    colorId: colors[3].id,
    camperIds: [],
    labelIds: [],
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Deer Group",
    description: "Graceful and gentle Deer cabin",
    housingRoomId: housingRooms[4].id,
    staffIds: [staffMembers[2].id],
    sessionId: sessions[4].id,
    colorId: colors[4].id,
    camperIds: [],
    labelIds: [],
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Fox Group",
    description: "Clever Fox Den residents",
    housingRoomId: housingRooms[5].id,
    staffIds: [staffMembers[6].id],
    sessionId: sessions[5].id,
    colorId: colors[5].id,
    camperIds: [],
    labelIds: [],
    createdAt: octoberDate(1),
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
    const hasAllergies = Math.random() > 0.8;

    const camper: Camper = {
      id: generateId(),
      firstName: camperFirstNames[camperIndex],
      lastName: camperLastNames[camperIndex],
      age,
      gender,
      parentContact: `parent${camperIndex + 1}@email.com`,
      allergies: hasAllergies
        ? ["Peanuts", "Dairy"].slice(0, Math.ceil(Math.random() * 2))
        : [],
      medicalNotes: hasAllergies ? "Please check meal ingredients" : undefined,
      photoUrl: `https://i.pravatar.cc/150?u=camper${camperIndex}`,
      registrationDate: octoberDate(1, 10, camperIndex),
      sessionId: group.sessionId,
      housingRoomId: group.housingRoomId,
    };

    campers.push(camper);
    group.camperIds!.push(camper.id); // Add camper ID to group

    camperIndex++;
  }
});

// Programs (4 programs)
export const programs: Program[] = [
  {
    id: generateId(),
    name: "Outdoor Adventures",
    description: "Hiking, camping, and wilderness exploration",
    colorId: colors[2].id,
    activityIds: [], // Will be filled after activities are created
    staffMemberIds: [
      staffMembers[5].id,
      staffMembers[6].id,
      staffMembers[9].id,
    ],
    locationIds: [locations[8].id, locations[9].id, locations[10].id],
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Water Sports",
    description: "Swimming, kayaking, and water safety",
    colorId: colors[0].id,
    activityIds: [],
    staffMemberIds: [staffMembers[3].id, staffMembers[8].id],
    locationIds: [locations[5].id, locations[6].id, locations[7].id],
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Arts & Creativity",
    description: "Painting, crafts, music, and creative expression",
    colorId: colors[4].id,
    activityIds: [],
    staffMemberIds: [staffMembers[2].id, staffMembers[7].id],
    locationIds: [locations[2].id, locations[14].id, locations[15].id],
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Sports & Games",
    description: "Team sports, games, and physical activities",
    colorId: colors[1].id,
    activityIds: [],
    staffMemberIds: [
      staffMembers[3].id,
      staffMembers[5].id,
      staffMembers[9].id,
    ],
    locationIds: [locations[3].id, locations[4].id, locations[13].id],
    createdAt: octoberDate(1),
  },
];

// Activities (distributed across programs)
export const activities: Activity[] = [
  // Outdoor Adventures activities
  {
    id: generateId(),
    name: "Nature Hike",
    description: "Guided nature walk through forest trails",
    programIds: [programs[0].id],
    duration: 90,
    defaultLocationId: locations[8].id,
    requiredCertificationIds: [certifications[2].id],
    minStaff: 2,
    defaultCapacity: 25,
    colorId: colors[2].id,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Wildlife Discovery",
    description: "Learn about local wildlife and ecosystems",
    programIds: [programs[0].id],
    duration: 60,
    defaultLocationId: locations[9].id,
    requiredCertificationIds: [certifications[2].id],
    minStaff: 1,
    defaultCapacity: 30,
    colorId: colors[2].id,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Campfire Stories",
    description: "Evening storytelling around the campfire",
    programIds: [programs[0].id],
    duration: 60,
    defaultLocationId: locations[10].id,
    requiredCertificationIds: [certifications[2].id],
    minStaff: 1,
    defaultCapacity: 50,
    colorId: colors[2].id,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Outdoor Survival Skills",
    description: "Learn basic wilderness survival techniques",
    programIds: [programs[0].id],
    duration: 120,
    defaultLocationId: locations[8].id,
    requiredCertificationIds: [certifications[2].id],
    minStaff: 2,
    defaultCapacity: 20,
    colorId: colors[2].id,
    createdAt: octoberDate(1),
  },

  // Water Sports activities
  {
    id: generateId(),
    name: "Swimming Lessons",
    description: "Learn to swim or improve swimming skills",
    programIds: [programs[1].id],
    duration: 60,
    defaultLocationId: locations[5].id,
    requiredCertificationIds: [certifications[1].id],
    minStaff: 2,
    defaultCapacity: 30,
    colorId: colors[0].id,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Kayaking Adventure",
    description: "Kayaking basics and water exploration",
    programIds: [programs[1].id],
    duration: 90,
    defaultLocationId: locations[6].id,
    requiredCertificationIds: [certifications[1].id],
    minStaff: 2,
    defaultCapacity: 20,
    colorId: colors[0].id,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Beach Games",
    description: "Fun games and activities on the beach",
    programIds: [programs[1].id],
    duration: 60,
    defaultLocationId: locations[7].id,
    requiredCertificationIds: [certifications[1].id],
    minStaff: 2,
    defaultCapacity: 40,
    colorId: colors[0].id,
    createdAt: octoberDate(1),
  },

  // Arts & Creativity activities
  {
    id: generateId(),
    name: "Painting Workshop",
    description: "Express yourself through watercolor and acrylics",
    programIds: [programs[2].id],
    duration: 90,
    defaultLocationId: locations[2].id,
    requiredCertificationIds: [certifications[4].id],
    minStaff: 1,
    defaultCapacity: 20,
    colorId: colors[4].id,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Crafts & DIY",
    description: "Create handmade crafts and projects",
    programIds: [programs[2].id],
    duration: 60,
    defaultLocationId: locations[14].id,
    requiredCertificationIds: [certifications[4].id],
    minStaff: 1,
    defaultCapacity: 25,
    colorId: colors[4].id,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Music Jam Session",
    description: "Learn instruments and make music together",
    programIds: [programs[2].id],
    duration: 60,
    defaultLocationId: locations[15].id,
    minStaff: 1,
    defaultCapacity: 20,
    colorId: colors[4].id,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Theater & Drama",
    description: "Acting, improvisation, and performance",
    programIds: [programs[2].id],
    duration: 90,
    defaultLocationId: locations[12].id,
    minStaff: 1,
    defaultCapacity: 30,
    colorId: colors[4].id,
    createdAt: octoberDate(1),
  },

  // Sports & Games activities
  {
    id: generateId(),
    name: "Basketball",
    description: "Team basketball games and drills",
    programIds: [programs[3].id],
    duration: 60,
    defaultLocationId: locations[3].id,
    minStaff: 1,
    defaultCapacity: 30,
    colorId: colors[1].id,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Soccer Practice",
    description: "Soccer skills and friendly matches",
    programIds: [programs[3].id],
    duration: 60,
    defaultLocationId: locations[4].id,
    minStaff: 1,
    defaultCapacity: 40,
    colorId: colors[1].id,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Board Game Tournament",
    description: "Strategy games and friendly competition",
    programIds: [programs[3].id],
    duration: 90,
    defaultLocationId: locations[13].id,
    minStaff: 1,
    defaultCapacity: 30,
    colorId: colors[1].id,
    createdAt: octoberDate(1),
  },
  {
    id: generateId(),
    name: "Team Building Games",
    description: "Cooperative games and challenges",
    programIds: [programs[3].id],
    duration: 60,
    defaultLocationId: locations[4].id,
    minStaff: 2,
    defaultCapacity: 40,
    colorId: colors[1].id,
    createdAt: octoberDate(1),
  },
];

// Update program activity IDs
programs[0].activityIds = [
  activities[0].id,
  activities[1].id,
  activities[2].id,
  activities[3].id,
];
programs[1].activityIds = [
  activities[4].id,
  activities[5].id,
  activities[6].id,
];
programs[2].activityIds = [
  activities[7].id,
  activities[8].id,
  activities[9].id,
  activities[10].id,
];
programs[3].activityIds = [
  activities[11].id,
  activities[12].id,
  activities[13].id,
  activities[14].id,
];

// Events (60 events across October 2025, distributed across all days)
export const events: Event[] = [];

// Helper to create events for a specific day
const createDailyEvents = (day: number, sessionIndex: number) => {
  const session = sessions[sessionIndex];
  const relevantGroups = groups.filter((g) => g.sessionId === session.id);

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

    events.push({
      id: generateId(),
      title: activity.name,
      description: activity.description,
      startDate: octoberDate(day, time.hour, 0),
      endDate: octoberDate(day, time.hour, time.duration),
      locationId: activity.defaultLocationId || locations[0].id,
      capacity: activity.defaultCapacity || 30,
      groupIds: [group.id],
      excludeStaffIds: [],
      excludeCamperIds: [],
      requiredCertificationIds: activity.requiredCertificationIds || [],
      colorId: activity.colorId,
      programId: activity.programIds[0],
      activityId: activity.id,
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
  colors,
  sessions,
  areas,
  locations,
  housingRooms,
  certifications,
  staffMembers,
  campers,
  programs,
  activities,
  groups,
  events,
};

export default mockData;
