import type { Camper, StaffMember, Room, SleepingRoom, Event, CamperGroup, FamilyGroup, Program, Activity, Location, Certification } from '@/types/api';

// Generate consistent IDs
const generateId = (prefix: string, index: number) => `${prefix}-${String(index).padStart(3, '0')}`;

// Certifications - Setup first as they're referenced by staff
export const mockCertifications: Certification[] = [
  {
    id: generateId('cert', 1),
    name: 'First Aid',
    description: 'Basic first aid training for emergency response',
    expirationRequired: true,
    validityPeriodMonths: 24,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('cert', 2),
    name: 'CPR',
    description: 'Cardiopulmonary resuscitation certification',
    expirationRequired: true,
    validityPeriodMonths: 24,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('cert', 3),
    name: 'Wilderness First Aid',
    description: 'Advanced first aid for wilderness and outdoor settings',
    expirationRequired: true,
    validityPeriodMonths: 36,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('cert', 4),
    name: 'Lifeguard',
    description: 'Certified lifeguard for pool and waterfront supervision',
    expirationRequired: true,
    validityPeriodMonths: 24,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('cert', 5),
    name: 'Swimming Instructor',
    description: 'Certified to teach swimming lessons',
    expirationRequired: true,
    validityPeriodMonths: 36,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('cert', 6),
    name: 'Climbing Instructor',
    description: 'Certified rock climbing and bouldering instructor',
    expirationRequired: true,
    validityPeriodMonths: 24,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('cert', 7),
    name: 'Archery Instructor',
    description: 'Certified archery safety and instruction',
    expirationRequired: true,
    validityPeriodMonths: 36,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('cert', 8),
    name: 'Ropes Course Instructor',
    description: 'High and low ropes course facilitation',
    expirationRequired: true,
    validityPeriodMonths: 24,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('cert', 9),
    name: 'Boat Driver',
    description: 'Licensed boat operation for water activities',
    expirationRequired: true,
    validityPeriodMonths: 60,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('cert', 10),
    name: 'Food Handler',
    description: 'Food safety and handling certification',
    expirationRequired: true,
    validityPeriodMonths: 36,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
];

// Locations - Setup before rooms and sleeping rooms
export const mockLocations: Location[] = [
  {
    id: generateId('location', 1),
    name: 'Main Building A',
    description: 'Primary administrative and activity building',
    type: 'indoor',
    capacity: 100,
    equipment: ['HVAC', 'Fire Suppression', 'Emergency Exits'],
    notes: 'Central location with easy access',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('location', 2),
    name: 'Arts & Crafts Building B',
    description: 'Dedicated arts and creative activities building',
    type: 'indoor',
    capacity: 50,
    equipment: ['Sinks', 'Storage Cabinets', 'Ventilation'],
    notes: 'Near the main hall',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('location', 3),
    name: 'Education Building C',
    description: 'Classrooms and learning spaces',
    type: 'indoor',
    capacity: 60,
    equipment: ['WiFi', 'Projectors', 'Whiteboards'],
    notes: 'Quiet zone for focused activities',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('location', 4),
    name: 'Sports Field Alpha',
    description: 'Large outdoor field for sports and games',
    type: 'field',
    capacity: 50,
    equipment: ['Goals', 'Field Markings', 'Benches'],
    notes: 'Grass field with irrigation',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('location', 5),
    name: 'Recreation Center',
    description: 'Indoor recreation facility with pool',
    type: 'facility',
    capacity: 80,
    equipment: ['Showers', 'Lockers', 'First Aid Station'],
    notes: 'Pool area requires lifeguard on duty',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('location', 6),
    name: 'Central Plaza',
    description: 'Outdoor gathering space',
    type: 'outdoor',
    capacity: 100,
    equipment: ['Shade Structures', 'Benches', 'Water Fountains'],
    notes: 'Weather dependent activities',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('location', 7),
    name: 'Basketball Court',
    description: 'Outdoor basketball court',
    type: 'outdoor',
    capacity: 30,
    equipment: ['Hoops', 'Court Lines', 'Scoreboard'],
    notes: 'Well-lit for evening activities',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('location', 8),
    name: 'North Cabin Area',
    description: 'North wing sleeping quarters - Floor 1',
    type: 'indoor',
    capacity: 20,
    equipment: ['Climate Control', 'Bathroom Facilities'],
    notes: 'Ground floor cabins',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('location', 9),
    name: 'North Cabin Area - Upper',
    description: 'North wing sleeping quarters - Floor 2',
    type: 'indoor',
    capacity: 20,
    equipment: ['Climate Control', 'Bathroom Facilities'],
    notes: 'Second floor cabins',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('location', 10),
    name: 'South Cabin Area',
    description: 'South wing sleeping quarters - Floor 1',
    type: 'indoor',
    capacity: 20,
    equipment: ['Climate Control', 'Bathroom Facilities'],
    notes: 'Ground floor cabins',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('location', 11),
    name: 'South Cabin Area - Upper',
    description: 'South wing sleeping quarters - Floor 2',
    type: 'indoor',
    capacity: 20,
    equipment: ['Climate Control', 'Bathroom Facilities'],
    notes: 'Second floor cabins',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('location', 12),
    name: 'Lakefront',
    description: 'Waterfront area with dock and beach',
    type: 'water',
    capacity: 40,
    equipment: ['Dock', 'Boat Launch', 'Life Jackets', 'Safety Equipment'],
    notes: 'Requires lifeguard supervision at all times',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
];

// Extended sleeping rooms for more campers
export const mockSleepingRooms: SleepingRoom[] = [
  {
    id: generateId('sleeping', 1),
    name: 'Cabin 1 - Eagles',
    beds: 8,
    location: 'North Wing, Floor 1',
    locationId: generateId('location', 8),
  },
  {
    id: generateId('sleeping', 2),
    name: 'Cabin 2 - Hawks',
    beds: 8,
    location: 'North Wing, Floor 1',
    locationId: generateId('location', 8),
  },
  {
    id: generateId('sleeping', 3),
    name: 'Cabin 3 - Wolves',
    beds: 8,
    location: 'North Wing, Floor 2',
    locationId: generateId('location', 9),
  },
  {
    id: generateId('sleeping', 4),
    name: 'Cabin 4 - Butterflies',
    beds: 8,
    location: 'South Wing, Floor 1',
    locationId: generateId('location', 10),
  },
  {
    id: generateId('sleeping', 5),
    name: 'Cabin 5 - Fireflies',
    beds: 8,
    location: 'South Wing, Floor 1',
    locationId: generateId('location', 10),
  },
  {
    id: generateId('sleeping', 6),
    name: 'Cabin 6 - Dolphins',
    beds: 8,
    location: 'South Wing, Floor 2',
    locationId: generateId('location', 11),
  },
];

// Family Groups - fundamental organizational units
export const mockFamilyGroups: FamilyGroup[] = [
  {
    id: generateId('family', 1),
    name: 'Eagles Family',
    description: 'Family group for Cabin 1',
    sleepingRoomId: generateId('sleeping', 1),
    staffMemberIds: [generateId('staff', 2), generateId('staff', 6)],
    startDate: new Date('2024-06-10').toISOString(),
    endDate: new Date('2024-06-17').toISOString(),
    color: '#3B82F6',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('family', 2),
    name: 'Hawks Family',
    description: 'Family group for Cabin 2',
    sleepingRoomId: generateId('sleeping', 2),
    staffMemberIds: [generateId('staff', 8)],
    startDate: new Date('2024-06-10').toISOString(),
    endDate: new Date('2024-06-17').toISOString(),
    color: '#10B981',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('family', 3),
    name: 'Wolves Family',
    description: 'Family group for Cabin 3',
    sleepingRoomId: generateId('sleeping', 3),
    staffMemberIds: [generateId('staff', 2)],
    startDate: new Date('2024-06-17').toISOString(),
    endDate: new Date('2024-06-24').toISOString(),
    color: '#6366F1',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('family', 4),
    name: 'Butterflies Family',
    description: 'Family group for Cabin 4',
    sleepingRoomId: generateId('sleeping', 4),
    staffMemberIds: [generateId('staff', 3), generateId('staff', 7)],
    startDate: new Date('2024-06-17').toISOString(),
    endDate: new Date('2024-06-24').toISOString(),
    color: '#EC4899',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('family', 5),
    name: 'Fireflies Family',
    description: 'Family group for Cabin 5',
    sleepingRoomId: generateId('sleeping', 5),
    staffMemberIds: [generateId('staff', 4)],
    startDate: new Date('2024-06-24').toISOString(),
    endDate: new Date('2024-07-01').toISOString(),
    color: '#F59E0B',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('family', 6),
    name: 'Dolphins Family',
    description: 'Family group for Cabin 6',
    sleepingRoomId: generateId('sleeping', 6),
    staffMemberIds: [generateId('staff', 3)],
    startDate: new Date('2024-06-24').toISOString(),
    endDate: new Date('2024-07-01').toISOString(),
    color: '#06B6D4',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
];

// Generate many campers
const firstNames = {
  male: ['Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan', 'Jackson', 'Levi', 'Sebastian', 'Mateo', 'Jack', 'Owen', 'Theodore', 'Aiden', 'Samuel', 'Joseph', 'John', 'David', 'Wyatt', 'Matthew'],
  female: ['Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Emily', 'Elizabeth', 'Mila', 'Ella', 'Avery', 'Sofia', 'Camila', 'Aria', 'Scarlett', 'Victoria', 'Madison', 'Luna', 'Grace', 'Chloe', 'Penelope', 'Layla', 'Riley', 'Zoey', 'Nora']
};

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

const allergies = ['Peanuts', 'Tree nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'];

const generateCampers = (count: number): Camper[] => {
  const campers: Camper[] = [];
  let maleCount = 0;
  let femaleCount = 0;
  
  for (let i = 1; i <= count; i++) {
    const gender: 'male' | 'female' = i % 2 === 0 ? 'male' : 'female';
    const genderNames = firstNames[gender];
    const nameIndex = gender === 'male' ? maleCount++ : femaleCount++;
    const firstName = genderNames[nameIndex % genderNames.length];
    const lastName = lastNames[(i - 1) % lastNames.length];
    const age = 6 + (i % 10); // Ages 6-15
    
    // Assign to family groups (6 campers per family group, 6 family groups)
    const familyGroupIndex = Math.floor((i - 1) / 6) % 6;
    const familyGroupId = generateId('family', familyGroupIndex + 1);
    
    // 25% chance of having an allergy
    const hasAllergy = Math.random() < 0.25;
    const camperAllergies = hasAllergy ? [allergies[i % allergies.length]] : [];
    
    campers.push({
      id: generateId('camper', i),
      firstName,
      lastName,
      age,
      gender,
      parentContact: `parent${i}@example.com`,
      allergies: camperAllergies,
      medicalNotes: hasAllergy ? `Please avoid ${camperAllergies[0]}` : undefined,
      registrationDate: new Date(2025, 5, 1 + (i % 7)).toISOString(),
      familyGroupId,
    });
  }
  
  return campers;
};

export const mockCampers: Camper[] = generateCampers(36);

export const mockStaffMembers: StaffMember[] = [
  {
    id: generateId('staff', 1),
    firstName: 'Sarah',
    lastName: 'Connor',
    role: 'director',
    email: 'sarah.connor@camp.com',
    phone: '555-0101',
    certifications: ['First Aid', 'CPR', 'Wilderness First Aid'],
    certificationIds: [generateId('cert', 1), generateId('cert', 2), generateId('cert', 3)],
    managerId: undefined, // Top of hierarchy
  },
  {
    id: generateId('staff', 9),
    firstName: 'James',
    lastName: 'Rodriguez',
    role: 'supervisor',
    email: 'james.rodriguez@camp.com',
    phone: '555-0109',
    certifications: ['First Aid', 'CPR', 'Wilderness First Aid'],
    certificationIds: [generateId('cert', 1), generateId('cert', 2), generateId('cert', 3)],
    managerId: generateId('staff', 1), // Reports to Sarah (Director)
  },
  {
    id: generateId('staff', 2),
    firstName: 'Mike',
    lastName: 'Peterson',
    role: 'counselor',
    email: 'mike.peterson@camp.com',
    phone: '555-0102',
    certifications: ['First Aid', 'CPR'],
    certificationIds: [generateId('cert', 1), generateId('cert', 2)],
    managerId: generateId('staff', 9), // Reports to James (Supervisor)
  },
  {
    id: generateId('staff', 3),
    firstName: 'Jessica',
    lastName: 'Lee',
    role: 'counselor',
    email: 'jessica.lee@camp.com',
    phone: '555-0103',
    certifications: ['First Aid', 'CPR'],
    certificationIds: [generateId('cert', 1), generateId('cert', 2)],
    managerId: generateId('staff', 9), // Reports to James (Supervisor)
  },
  {
    id: generateId('staff', 4),
    firstName: 'David',
    lastName: 'Chen',
    role: 'instructor',
    email: 'david.chen@camp.com',
    phone: '555-0104',
    certifications: ['Lifeguard', 'Swimming Instructor', 'CPR'],
    certificationIds: [generateId('cert', 4), generateId('cert', 5), generateId('cert', 2)],
    managerId: generateId('staff', 9), // Reports to James (Supervisor)
  },
  {
    id: generateId('staff', 5),
    firstName: 'Rachel',
    lastName: 'Martinez',
    role: 'nurse',
    email: 'rachel.martinez@camp.com',
    phone: '555-0105',
    certifications: ['First Aid', 'CPR', 'Wilderness First Aid'],
    certificationIds: [generateId('cert', 1), generateId('cert', 2), generateId('cert', 3)],
    managerId: generateId('staff', 1), // Reports directly to Sarah (Director)
  },
  {
    id: generateId('staff', 6),
    firstName: 'Tom',
    lastName: 'Wilson',
    role: 'counselor',
    email: 'tom.wilson@camp.com',
    phone: '555-0106',
    certifications: ['First Aid', 'CPR'],
    certificationIds: [generateId('cert', 1), generateId('cert', 2)],
    managerId: generateId('staff', 9), // Reports to James (Supervisor)
  },
  {
    id: generateId('staff', 7),
    firstName: 'Amanda',
    lastName: 'Foster',
    role: 'counselor',
    email: 'amanda.foster@camp.com',
    phone: '555-0107',
    certifications: ['First Aid', 'CPR'],
    certificationIds: [generateId('cert', 1), generateId('cert', 2)],
    managerId: generateId('staff', 9), // Reports to James (Supervisor)
  },
  {
    id: generateId('staff', 8),
    firstName: 'Chris',
    lastName: 'Bryant',
    role: 'counselor',
    email: 'chris.bryant@camp.com',
    phone: '555-0108',
    certifications: ['First Aid', 'CPR', 'Wilderness First Aid'],
    certificationIds: [generateId('cert', 1), generateId('cert', 2), generateId('cert', 3)],
    managerId: generateId('staff', 9), // Reports to James (Supervisor)
  },
];

export const mockRooms: Room[] = [
  {
    id: generateId('room', 1),
    name: 'Main Hall',
    capacity: 50,
    type: 'activity',
    location: 'Building A',
    locationId: generateId('location', 1),
    equipment: ['Projector', 'Sound System', 'Tables', 'Chairs'],
  },
  {
    id: generateId('room', 2),
    name: 'Art Studio',
    capacity: 15,
    type: 'arts',
    location: 'Building B',
    locationId: generateId('location', 2),
    equipment: ['Easels', 'Paint Supplies', 'Clay', 'Kiln'],
  },
  {
    id: generateId('room', 3),
    name: 'Sports Field',
    capacity: 30,
    type: 'sports',
    location: 'Outdoor Area 1',
    locationId: generateId('location', 4),
    equipment: ['Soccer Goals', 'Cones', 'Balls'],
  },
  {
    id: generateId('room', 4),
    name: 'Swimming Pool',
    capacity: 20,
    type: 'sports',
    location: 'Recreation Center',
    locationId: generateId('location', 5),
    equipment: ['Pool Noodles', 'Kickboards', 'Life Vests'],
  },
  {
    id: generateId('room', 5),
    name: 'Classroom A',
    capacity: 20,
    type: 'classroom',
    location: 'Building C',
    locationId: generateId('location', 3),
    equipment: ['Whiteboard', 'Desks', 'Books', 'Computers'],
  },
  {
    id: generateId('room', 6),
    name: 'Dining Hall',
    capacity: 60,
    type: 'dining',
    location: 'Building C',
    locationId: generateId('location', 3),
    equipment: ['Tables', 'Benches', 'Kitchen Access'],
  },
  {
    id: generateId('room', 7),
    name: 'Outdoor Plaza',
    capacity: 40,
    type: 'outdoor',
    location: 'Central Campus',
    locationId: generateId('location', 6),
    equipment: ['Picnic Tables', 'Shade Structures', 'Water Fountain'],
  },
  {
    id: generateId('room', 8),
    name: 'Music Room',
    capacity: 15,
    type: 'arts',
    location: 'Building B',
    locationId: generateId('location', 2),
    equipment: ['Piano', 'Guitars', 'Drums', 'Microphones'],
  },
  {
    id: generateId('room', 9),
    name: 'Basketball Court',
    capacity: 20,
    type: 'sports',
    location: 'Outdoor Area 2',
    locationId: generateId('location', 7),
    equipment: ['Basketballs', 'Scoreboard', 'Benches'],
  },
  {
    id: generateId('room', 10),
    name: 'Theater Stage',
    capacity: 25,
    type: 'arts',
    location: 'Building A',
    locationId: generateId('location', 1),
    equipment: ['Stage', 'Costumes', 'Props', 'Lighting'],
  },
];

// Helper to create events for the month
const createEvent = (
  id: number,
  title: string,
  dayOffset: number, // 0 = today, 1 = tomorrow, etc.
  startHour: number,
  durationHours: number,
  roomId: string,
  capacity: number,
  type: Event['type'],
  staffIds: string[],
  camperIds: string[],
  color: string,
  requiredCerts?: string[],
  programId?: string,
  activityId?: string
): Event => {
  const today = new Date();
  const eventDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset, startHour, 0);
  const endTime = new Date(eventDate.getTime() + durationHours * 60 * 60 * 1000);

  return {
    id: generateId('event', id),
    title,
    startTime: eventDate.toISOString(),
    endTime: endTime.toISOString(),
    roomId,
    capacity,
    type,
    assignedStaffIds: staffIds,
    enrolledCamperIds: camperIds,
    color,
    requiredCertifications: requiredCerts,
    programId,
    activityId,
  };
};

// Generate a full month of varied events
const generateMonthEvents = (): Event[] => {
  const events: Event[] = [];
  let eventId = 1;
  
  // Helper to get random campers
  const getRandomCampers = (count: number, startIdx: number = 0) => {
    const campers = [];
    for (let i = 0; i < count; i++) {
      campers.push(generateId('camper', startIdx + i + 1));
    }
    return campers;
  };
  
  // Get current month details
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startDay = 1 - today.getDate(); // Start from the 1st of the month
  
  // Generate events for all days in the month
  for (let day = startDay; day < startDay + daysInMonth; day++) {
    const camperOffset = (Math.abs(day) * 8) % 40;
    const dayMod = Math.abs(day) % 7;
    
    // Morning Assembly (9:00-9:30) - Everyone (not every day)
    if (dayMod === 1 || dayMod === 3 || dayMod === 5) {
      events.push(createEvent(
        eventId++,
        'Morning Assembly',
        day,
        9,
        0.5,
        generateId('room', 1),
        50,
        'activity',
        [generateId('staff', 1), generateId('staff', 2)],
        getRandomCampers(30, camperOffset),
        '#6366F1',
      ));
    }
    
    // Morning Activities Block 1 (10:00-11:30)
    // Rotate through different program activities
    if (dayMod === 0 || dayMod === 3) {
      // Pottery from Arts & Crafts Program
      events.push(createEvent(
        eventId++,
        'Pottery',
        day,
        10,
        1.5,
        generateId('room', 6),
        10,
        'activity',
        [generateId('staff', 2)],
        getRandomCampers(8, camperOffset),
        '#EC4899',
        undefined,
        generateId('program', 2),
        generateId('activity', 4)
      ));
    } else if (dayMod === 1 || dayMod === 4) {
      // Swimming Lessons from Watersports Program
      events.push(createEvent(
        eventId++,
        'Swimming Lessons',
        day,
        10,
        1,
        generateId('room', 10),
        12,
        'sports',
        [generateId('staff', 4), generateId('staff', 5)],
        getRandomCampers(10, camperOffset),
        '#60A5FA',
        ['Lifeguard', 'Swimming Instructor'],
        generateId('program', 1),
        generateId('activity', 2)
      ));
    } else if (dayMod === 2 || dayMod === 5) {
      // Rock Climbing from Adventure Sports Program
      events.push(createEvent(
        eventId++,
        'Rock Climbing',
        day,
        10,
        1.5,
        generateId('room', 3),
        8,
        'activity',
        [generateId('staff', 1), generateId('staff', 3)],
        getRandomCampers(7, camperOffset),
        '#10B981',
        ['Climbing Instructor', 'First Aid'],
        generateId('program', 3),
        generateId('activity', 7)
      ));
    } else {
      // General Soccer Practice
      events.push(createEvent(
        eventId++,
        'Soccer Practice',
        day,
        10,
        1.5,
        generateId('room', 7),
        20,
        'sports',
        [generateId('staff', 6), generateId('staff', 8)],
        getRandomCampers(16, camperOffset),
        '#10B981',
      ));
    }
    
    // Lunch (12:00-1:00) - Everyone
    events.push(createEvent(
      eventId++,
      'Lunch',
      day,
      12,
      1,
      generateId('room', 6),
      60,
      'meal',
      [generateId('staff', 2), generateId('staff', 7)],
      getRandomCampers(40, camperOffset),
      '#64748B',
    ));
    
    // Afternoon Activities Block 1 (2:00-3:30)
    if (dayMod === 0 || dayMod === 2 || dayMod === 4) {
      // Wakeboarding from Watersports Program
      events.push(createEvent(
        eventId++,
        'Wakeboarding',
        day,
        14,
        2,
        generateId('room', 5),
        8,
        'sports',
        [generateId('staff', 5), generateId('staff', 6)],
        getRandomCampers(7, camperOffset),
        '#3B82F6',
        ['Lifeguard', 'Boat Driver'],
        generateId('program', 1),
        generateId('activity', 1)
      ));
    } else if (dayMod === 1 || dayMod === 3) {
      // Painting Workshop from Arts & Crafts Program
      events.push(createEvent(
        eventId++,
        'Painting Workshop',
        day,
        14,
        1.25,
        generateId('room', 9),
        15,
        'activity',
        [generateId('staff', 2)],
        getRandomCampers(12, camperOffset),
        '#F472B6',
        undefined,
        generateId('program', 2),
        generateId('activity', 5)
      ));
    } else {
      // Kayaking from Watersports Program
      events.push(createEvent(
        eventId++,
        'Kayaking',
        day,
        14,
        1.5,
        generateId('room', 5),
        10,
        'sports',
        [generateId('staff', 5), generateId('staff', 6)],
        getRandomCampers(9, camperOffset),
        '#2563EB',
        ['Lifeguard'],
        generateId('program', 1),
        generateId('activity', 3)
      ));
    }
    
    // Second afternoon activity
    if (dayMod === 0 || dayMod === 3 || dayMod === 5) {
      events.push(createEvent(
        eventId++,
        'Music Class',
        day,
        14,
        1,
        generateId('room', 8),
        15,
        'activity',
        [generateId('staff', 3)],
        getRandomCampers(12, camperOffset + 10),
        '#F59E0B',
      ));
    }
    
    // Afternoon Activities Block 2 (4:00-5:30)
    if (dayMod % 2 === 0) {
      // Archery from Adventure Sports Program
      events.push(createEvent(
        eventId++,
        'Archery',
        day,
        16,
        1.5,
        generateId('room', 7),
        12,
        'activity',
        [generateId('staff', 1)],
        getRandomCampers(10, camperOffset),
        '#10B981',
        ['Archery Instructor'],
        generateId('program', 3),
        generateId('activity', 8)
      ));
      
      // Jewelry Making from Arts & Crafts Program
      events.push(createEvent(
        eventId++,
        'Jewelry Making',
        day,
        16,
        1,
        generateId('room', 9),
        12,
        'activity',
        [generateId('staff', 8)],
        getRandomCampers(10, camperOffset + 10),
        '#DB2777',
        undefined,
        generateId('program', 2),
        generateId('activity', 6)
      ));
    } else {
      events.push(createEvent(
        eventId++,
        'Basketball',
        day,
        16,
        1.5,
        generateId('room', 3),
        20,
        'sports',
        [generateId('staff', 6)],
        getRandomCampers(16, camperOffset),
        '#EF4444',
      ));
    }
    
    // Dinner (6:00-7:00) - Everyone
    events.push(createEvent(
      eventId++,
      'Dinner',
      day,
      18,
      1,
      generateId('room', 6),
      60,
      'meal',
      [generateId('staff', 3), generateId('staff', 6)],
      getRandomCampers(40, camperOffset),
      '#64748B',
    ));
    
    // Evening Activity (7:30-8:30) - Not every day
    if (dayMod === 2 || dayMod === 5) {
      events.push(createEvent(
        eventId++,
        'Campfire & Songs',
        day,
        19.5,
        1,
        generateId('room', 7),
        40,
        'activity',
        [generateId('staff', 1), generateId('staff', 2), generateId('staff', 3)],
        getRandomCampers(35, camperOffset),
        '#F97316',
      ));
    } else if (dayMod === 6) {
      events.push(createEvent(
        eventId++,
        'Talent Show',
        day,
        19.5,
        1.5,
        generateId('room', 10),
        25,
        'activity',
        [generateId('staff', 1), generateId('staff', 7)],
        getRandomCampers(20, camperOffset),
        '#8B5CF6',
      ));
    } else if (dayMod === 4) {
      events.push(createEvent(
        eventId++,
        'Movie Night',
        day,
        19.5,
        2,
        generateId('room', 1),
        45,
        'activity',
        [generateId('staff', 2), generateId('staff', 4)],
        getRandomCampers(38, camperOffset),
        '#8B5CF6',
      ));
    }
    
    // Quiet Time (9:00 PM) - Most days
    if (dayMod !== 6) {
      events.push(createEvent(
        eventId++,
        'Quiet Time',
        day,
        21,
        1,
        generateId('room', 1),
        50,
        'free-time',
        [generateId('staff', 1), generateId('staff', 2)],
        getRandomCampers(40, camperOffset),
        '#475569',
      ));
    }
  }
  
  return events;
};

export const mockEvents: Event[] = generateMonthEvents();

// Example Camper Groups
export const mockCamperGroups: CamperGroup[] = [
  {
    id: generateId('group', 1),
    name: 'Junior Campers',
    description: 'Campers ages 6-9 for age-appropriate activities',
    color: '#10B981',
    filters: {
      ageMin: 6,
      ageMax: 9,
    },
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('group', 2),
    name: 'Senior Campers',
    description: 'Campers ages 13+ for advanced activities',
    color: '#6366F1',
    filters: {
      ageMin: 13,
    },
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('group', 3),
    name: 'Middle Age Campers',
    description: 'Campers ages 10-12 for age-appropriate activities',
    color: '#F59E0B',
    filters: {
      ageMin: 10,
      ageMax: 12,
    },
    createdAt: new Date(2025, 5, 2).toISOString(),
    updatedAt: new Date(2025, 5, 2).toISOString(),
  },
  {
    id: generateId('group', 4),
    name: 'Girls Power',
    description: 'All female campers for girls-only activities',
    color: '#EC4899',
    filters: {
      gender: 'female',
    },
    createdAt: new Date(2025, 5, 2).toISOString(),
    updatedAt: new Date(2025, 5, 2).toISOString(),
  },
  {
    id: generateId('group', 5),
    name: 'Allergy-Aware Group',
    description: 'Campers with allergies for special meal planning',
    color: '#EF4444',
    filters: {
      hasAllergies: true,
    },
    createdAt: new Date(2025, 5, 3).toISOString(),
    updatedAt: new Date(2025, 5, 3).toISOString(),
  },
];

// Programs
export const mockPrograms: Program[] = [
  {
    id: generateId('program', 1),
    name: 'Watersports',
    description: 'Water-based activities including wakeboarding, jet skiing, and swimming',
    color: '#3B82F6',
    activityIds: [], // Will be populated by activities
    staffMemberIds: ['staff-005', 'staff-006'], // Staff with relevant certifications
    roomIds: ['room-005', 'room-010'], // Lake and Pool
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 2),
    name: 'Arts & Crafts',
    description: 'Creative activities including pottery, painting, and jewelry making',
    color: '#EC4899',
    activityIds: [],
    staffMemberIds: ['staff-002', 'staff-008'],
    roomIds: ['room-006', 'room-009'], // Art Studios
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 3),
    name: 'Adventure Sports',
    description: 'High-energy outdoor activities including rock climbing, archery, and ropes course',
    color: '#10B981',
    activityIds: [],
    staffMemberIds: ['staff-001', 'staff-003'],
    roomIds: ['room-003', 'room-007'], // Gym and Outdoor Field
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
];

// Activities
export const mockActivities: Activity[] = [
  // Watersports Activities
  {
    id: generateId('activity', 1),
    name: 'Wakeboarding',
    description: 'Learn wakeboarding basics or improve your skills on the lake',
    programIds: [generateId('program', 1)],
    durationMinutes: 120,
    defaultRoomId: 'room-005', // Lake
    requiredCertifications: ['Lifeguard', 'Boat Driver'],
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 8,
    color: '#3B82F6',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 2),
    name: 'Swimming Lessons',
    description: 'Structured swimming instruction for all skill levels',
    programIds: [generateId('program', 1)],
    durationMinutes: 60,
    defaultRoomId: 'room-010', // Pool
    requiredCertifications: ['Lifeguard', 'Swimming Instructor'],
    minStaff: 2,
    maxStaff: 2,
    defaultCapacity: 12,
    color: '#60A5FA',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 3),
    name: 'Kayaking',
    description: 'Explore the lake in kayaks with guided instruction',
    programIds: [generateId('program', 1)],
    durationMinutes: 90,
    defaultRoomId: 'room-005', // Lake
    requiredCertifications: ['Lifeguard'],
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 10,
    color: '#2563EB',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  // Arts & Crafts Activities
  {
    id: generateId('activity', 4),
    name: 'Pottery',
    description: 'Create your own pottery pieces on the wheel',
    programIds: [generateId('program', 2)],
    durationMinutes: 90,
    defaultRoomId: 'room-006', // Art Studio 1
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 10,
    color: '#EC4899',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 5),
    name: 'Painting Workshop',
    description: 'Express yourself through various painting techniques',
    programIds: [generateId('program', 2)],
    durationMinutes: 75,
    defaultRoomId: 'room-009', // Art Studio 2
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 15,
    color: '#F472B6',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 6),
    name: 'Jewelry Making',
    description: 'Design and create your own jewelry pieces',
    programIds: [generateId('program', 2)],
    durationMinutes: 60,
    defaultRoomId: 'room-009', // Art Studio 2
    minStaff: 1,
    maxStaff: 1,
    defaultCapacity: 12,
    color: '#DB2777',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  // Adventure Sports Activities
  {
    id: generateId('activity', 7),
    name: 'Rock Climbing',
    description: 'Indoor rock climbing with safety instruction',
    programIds: [generateId('program', 3)],
    durationMinutes: 90,
    defaultRoomId: 'room-003', // Gym
    requiredCertifications: ['Climbing Instructor', 'First Aid'],
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 10,
    color: '#10B981',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 8),
    name: 'Archery',
    description: 'Learn archery basics and target practice',
    programIds: [generateId('program', 3)],
    durationMinutes: 60,
    defaultRoomId: 'room-007', // Outdoor Field
    requiredCertifications: ['Archery Instructor'],
    minStaff: 2,
    maxStaff: 2,
    defaultCapacity: 12,
    color: '#34D399',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 9),
    name: 'Ropes Course',
    description: 'Challenge yourself on our high ropes course',
    programIds: [generateId('program', 3)],
    durationMinutes: 120,
    defaultRoomId: 'room-007', // Outdoor Field
    requiredCertifications: ['Ropes Course Instructor', 'First Aid'],
    minStaff: 3,
    maxStaff: 4,
    defaultCapacity: 8,
    color: '#059669',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
];

// Update programs with activity IDs
mockPrograms[0].activityIds = [
  generateId('activity', 1),
  generateId('activity', 2),
  generateId('activity', 3),
];
mockPrograms[1].activityIds = [
  generateId('activity', 4),
  generateId('activity', 5),
  generateId('activity', 6),
];
mockPrograms[2].activityIds = [
  generateId('activity', 7),
  generateId('activity', 8),
  generateId('activity', 9),
];

// Export all mock data together for easy import
export const mockData = {
  campers: mockCampers,
  staffMembers: mockStaffMembers,
  rooms: mockRooms,
  sleepingRooms: mockSleepingRooms,
  events: mockEvents,
  camperGroups: mockCamperGroups,
  familyGroups: mockFamilyGroups,
  programs: mockPrograms,
  activities: mockActivities,
  locations: mockLocations,
  certifications: mockCertifications,
};
