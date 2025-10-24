import type { Location } from "@/types";
import { areasFixture } from "./areas.fixture";

export const locationsFixture: Location[] = [
  // North Campus locations
  {
    id: "location-1",
    name: "Classroom A",
    capacity: 25,
    type: "classroom",
    areaId: areasFixture[0].id,
    equipment: ["Projector", "Whiteboard"],
    notes: "Main classroom",
  },
  {
    id: "location-2",
    name: "Classroom B",
    capacity: 25,
    type: "classroom",
    areaId: areasFixture[0].id,
    equipment: ["Projector", "Whiteboard"],
    notes: "Science lab",
  },
  {
    id: "location-3",
    name: "Art Studio",
    capacity: 20,
    type: "arts",
    areaId: areasFixture[0].id,
    equipment: ["Easels", "Paint supplies", "Clay"],
    notes: "Creative space",
  },
  // Lakefront locations
  {
    id: "location-4",
    name: "Swimming Area",
    capacity: 30,
    type: "outdoor",
    areaId: areasFixture[1].id,
    equipment: ["Life jackets", "Floats"],
    notes: "Supervised swimming",
  },
  {
    id: "location-5",
    name: "Boating Dock",
    capacity: 20,
    type: "outdoor",
    areaId: areasFixture[1].id,
    equipment: ["Kayaks", "Canoes", "Paddles"],
    notes: "Water activities",
  },
  // Forest Trail locations
  {
    id: "location-6",
    name: "North Trail Head",
    capacity: 25,
    type: "outdoor",
    areaId: areasFixture[2].id,
    equipment: ["Trail maps", "First aid kit"],
    notes: "Hiking start point",
  },
  {
    id: "location-7",
    name: "Nature Center",
    capacity: 30,
    type: "activity",
    areaId: areasFixture[2].id,
    equipment: ["Microscopes", "Field guides", "Specimens"],
    notes: "Educational center",
  },
  // Central Commons locations
  {
    id: "location-8",
    name: "Main Dining Hall",
    capacity: 150,
    type: "dining",
    areaId: areasFixture[3].id,
    equipment: ["Tables", "Chairs", "Kitchen"],
    notes: "Main meals",
  },
  {
    id: "location-9",
    name: "Assembly Hall",
    capacity: 200,
    type: "activity",
    areaId: areasFixture[3].id,
    equipment: ["Stage", "Sound system", "Lights"],
    notes: "Large gatherings",
  },
  // Sports Complex locations
  {
    id: "location-10",
    name: "Soccer Field",
    capacity: 40,
    type: "sports",
    areaId: areasFixture[4].id,
    equipment: ["Soccer balls", "Goals", "Cones"],
    notes: "Outdoor field",
  },
];

