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

// Extended sleeping rooms for more campers (20 cabins total)
const cabinNames = [
  'Eagles', 'Hawks', 'Wolves', 'Butterflies', 'Fireflies', 'Dolphins',
  'Tigers', 'Bears', 'Panthers', 'Foxes', 'Owls', 'Ravens',
  'Falcons', 'Cougars', 'Lynx', 'Otters', 'Beavers', 'Moose',
  'Elk', 'Bison', 'Cardinals', 'Blue Jays', 'Sparrows', 'Swallows'
];

const generateSleepingRooms = (count: number): SleepingRoom[] => {
  const rooms: SleepingRoom[] = [];
  const locations = [
    { id: 8, name: 'North Wing, Floor 1' },
    { id: 9, name: 'North Wing, Floor 2' },
    { id: 10, name: 'South Wing, Floor 1' },
    { id: 11, name: 'South Wing, Floor 2' },
  ];
  
  for (let i = 1; i <= count; i++) {
    const locationIndex = (i - 1) % locations.length;
    const location = locations[locationIndex];
    rooms.push({
      id: generateId('sleeping', i),
      name: `Cabin ${i} - ${cabinNames[i - 1]}`,
      beds: i <= 16 ? 12 : 10, // First 16 cabins have 12 beds, rest have 10
      location: location.name,
      locationId: generateId('location', location.id),
    });
  }
  
  return rooms;
};

export const mockSleepingRooms: SleepingRoom[] = generateSleepingRooms(24);

// Family Groups - fundamental organizational units (one per sleeping room)
const familyGroupColors = [
  '#3B82F6', '#10B981', '#6366F1', '#EC4899', '#F59E0B', '#06B6D4',
  '#EF4444', '#8B5CF6', '#F97316', '#14B8A6', '#84CC16', '#A855F7',
  '#FB923C', '#22D3EE', '#FCD34D', '#FB7185', '#67E8F9', '#FDE047',
  '#FDBA74', '#C084FC', '#86EFAC', '#FCA5A5', '#BAE6FD', '#D8B4FE'
];

const generateFamilyGroups = (sleepingRooms: SleepingRoom[]): FamilyGroup[] => {
  const groups: FamilyGroup[] = [];
  const weekDates = [
    { start: new Date('2024-06-10'), end: new Date('2024-06-17') },
    { start: new Date('2024-06-17'), end: new Date('2024-06-24') },
    { start: new Date('2024-06-24'), end: new Date('2024-07-01') },
  ];
  
  sleepingRooms.forEach((room, index) => {
    const weekIndex = index % 3;
    const week = weekDates[weekIndex];
    const staffCount = 1 + (index % 2); // 1 or 2 staff per family
    const staffIds: string[] = [];
    
    // Assign staff members (we'll have more staff now)
    for (let s = 0; s < staffCount; s++) {
      const staffId = ((index * 2 + s) % 48) + 2; // Cycle through staff 2-49 (excluding director)
      staffIds.push(generateId('staff', staffId));
    }
    
    groups.push({
      id: generateId('family', index + 1),
      name: `${cabinNames[index]} Family`,
      description: `Family group for Cabin ${index + 1}`,
      sleepingRoomId: room.id,
      staffMemberIds: staffIds,
      startDate: week.start.toISOString(),
      endDate: week.end.toISOString(),
      color: familyGroupColors[index % familyGroupColors.length],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
    });
  });
  
  return groups;
};

export const mockFamilyGroups: FamilyGroup[] = generateFamilyGroups(mockSleepingRooms);

// Generate many campers - expanded name lists
const firstNames = {
  male: [
    'Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Alexander',
    'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan', 'Jackson', 'Levi', 'Sebastian', 'Mateo',
    'Jack', 'Owen', 'Theodore', 'Aiden', 'Samuel', 'Joseph', 'John', 'David', 'Wyatt', 'Matthew',
    'Luke', 'Asher', 'Carter', 'Julian', 'Grayson', 'Leo', 'Jayden', 'Gabriel', 'Isaac', 'Lincoln',
    'Anthony', 'Hudson', 'Dylan', 'Ezra', 'Thomas', 'Charles', 'Christopher', 'Jaxon', 'Maverick', 'Josiah'
  ],
  female: [
    'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia', 'Harper', 'Evelyn',
    'Abigail', 'Emily', 'Elizabeth', 'Mila', 'Ella', 'Avery', 'Sofia', 'Camila', 'Aria', 'Scarlett',
    'Victoria', 'Madison', 'Luna', 'Grace', 'Chloe', 'Penelope', 'Layla', 'Riley', 'Zoey', 'Nora',
    'Lily', 'Eleanor', 'Hannah', 'Lillian', 'Addison', 'Aubrey', 'Ellie', 'Stella', 'Natalie', 'Zoe',
    'Leah', 'Hazel', 'Violet', 'Aurora', 'Savannah', 'Audrey', 'Brooklyn', 'Bella', 'Claire', 'Skylar'
  ]
};

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const allergies = ['Peanuts', 'Tree nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame', 'Gluten'];

const generateCampers = (count: number, totalFamilyGroups: number): Camper[] => {
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
    
    // Distribute campers evenly across family groups (~10-12 per group)
    const campersPerGroup = Math.ceil(count / totalFamilyGroups);
    const familyGroupIndex = Math.floor((i - 1) / campersPerGroup) % totalFamilyGroups;
    const familyGroupId = generateId('family', familyGroupIndex + 1);
    
    // 20% chance of having an allergy
    const hasAllergy = (i * 7) % 100 < 20;
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

export const mockCampers: Camper[] = generateCampers(350, mockFamilyGroups.length);

// Generate staff members
const staffFirstNames = [
  'Sarah', 'James', 'Mike', 'Jessica', 'David', 'Rachel', 'Tom', 'Amanda', 'Chris', 'Emily',
  'Marcus', 'Lisa', 'Brian', 'Jennifer', 'Kevin', 'Nicole', 'Ryan', 'Ashley', 'Eric', 'Melissa',
  'Daniel', 'Laura', 'Justin', 'Stephanie', 'Matthew', 'Michelle', 'Andrew', 'Angela', 'Joshua', 'Heather',
  'Brandon', 'Amber', 'Tyler', 'Rebecca', 'Jason', 'Christina', 'Aaron', 'Megan', 'Adam', 'Kimberly',
  'Nathan', 'Amy', 'Zachary', 'Brittany', 'Kyle', 'Samantha', 'Jacob', 'Katherine', 'Patrick', 'Christine'
];

const staffLastNames = [
  'Connor', 'Rodriguez', 'Peterson', 'Lee', 'Chen', 'Martinez', 'Wilson', 'Foster', 'Bryant', 'Davis',
  'Thompson', 'Kim', 'Anderson', 'White', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen',
  'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez',
  'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans',
  'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell'
];

const certificationCombos = [
  [1, 2, 3, 6], // First Aid, CPR, Wilderness First Aid, Climbing Instructor
  [1, 2, 3, 8], // First Aid, CPR, Wilderness First Aid, Ropes Course
  [1, 2, 7], // First Aid, CPR, Archery
  [4, 5, 2, 1], // Lifeguard, Swimming Instructor, CPR, First Aid
  [4, 5, 9, 2, 1], // Lifeguard, Swimming Instructor, Boat Driver, CPR, First Aid
  [1, 2, 4, 9], // First Aid, CPR, Lifeguard, Boat Driver
  [1, 2, 8, 6], // First Aid, CPR, Ropes Course, Climbing
  [4, 5, 2, 1], // Lifeguard, Swimming Instructor, CPR, First Aid (repeat for more coverage)
  [1, 2, 6], // First Aid, CPR, Climbing Instructor (more climbing instructors)
  [1, 2, 7], // First Aid, CPR, Archery (more archery instructors)
];

const generateStaff = (count: number): StaffMember[] => {
  const staff: StaffMember[] = [];
  
  // Director
  staff.push({
    id: generateId('staff', 1),
    firstName: 'Sarah',
    lastName: 'Connor',
    role: 'director',
    email: 'sarah.connor@camp.com',
    phone: '555-0101',
    certifications: ['First Aid', 'CPR', 'Wilderness First Aid', 'Climbing Instructor'],
    certificationIds: [generateId('cert', 1), generateId('cert', 2), generateId('cert', 3), generateId('cert', 6)],
    managerId: undefined,
  });
  
  // Supervisors (4 total - reporting to director)
  for (let i = 2; i <= 5; i++) {
    const certCombo = certificationCombos[(i - 2) % certificationCombos.length];
    staff.push({
      id: generateId('staff', i),
      firstName: staffFirstNames[i - 1],
      lastName: staffLastNames[i - 1],
    role: 'supervisor',
      email: `${staffFirstNames[i - 1].toLowerCase()}.${staffLastNames[i - 1].toLowerCase()}@camp.com`,
      phone: `555-${String(100 + i).padStart(4, '0')}`,
      certifications: certCombo.map(c => mockCertifications[c - 1].name),
      certificationIds: certCombo.map(c => generateId('cert', c)),
      managerId: generateId('staff', 1),
    });
  }
  
  // Nurses (2 - reporting to director)
  for (let i = 6; i <= 7; i++) {
    staff.push({
      id: generateId('staff', i),
      firstName: staffFirstNames[i - 1],
      lastName: staffLastNames[i - 1],
    role: 'nurse',
      email: `${staffFirstNames[i - 1].toLowerCase()}.${staffLastNames[i - 1].toLowerCase()}@camp.com`,
      phone: `555-${String(100 + i).padStart(4, '0')}`,
      certifications: ['First Aid', 'CPR', 'Wilderness First Aid'],
      certificationIds: [generateId('cert', 1), generateId('cert', 2), generateId('cert', 3)],
      managerId: generateId('staff', 1),
    });
  }
  
  // Rest of staff (counselors and instructors - reporting to supervisors)
  const roles: Array<'counselor' | 'instructor'> = ['counselor', 'instructor'];
  for (let i = 8; i <= count; i++) {
    const role = roles[(i - 8) % 2];
    const supervisorId = 2 + ((i - 8) % 4); // Cycle through supervisors 2-5
    const certCombo = certificationCombos[(i - 8) % certificationCombos.length];
    
    staff.push({
      id: generateId('staff', i),
      firstName: staffFirstNames[i % staffFirstNames.length],
      lastName: staffLastNames[i % staffLastNames.length],
      role,
      email: `${staffFirstNames[i % staffFirstNames.length].toLowerCase()}.${staffLastNames[i % staffLastNames.length].toLowerCase()}@camp.com`,
      phone: `555-${String(100 + i).padStart(4, '0')}`,
      certifications: certCombo.map(c => mockCertifications[c - 1].name),
      certificationIds: certCombo.map(c => generateId('cert', c)),
      managerId: generateId('staff', supervisorId),
    });
  }
  
  return staff;
};

export const mockStaffMembers: StaffMember[] = generateStaff(50);

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
  
  // Helper to get sequential campers without overlap
  const getCampers = (count: number, startIdx: number) => {
    const campers = [];
    const totalCampers = 350;
    for (let i = 0; i < count; i++) {
      const camperId = ((startIdx + i) % totalCampers) + 1;
      campers.push(generateId('camper', camperId));
    }
    return campers;
  };
  
  // Get current month details
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startDay = 1 - today.getDate(); // Start from the 1st of the month
  
  // Generate events for all days in the month
  for (let day = startDay; day < startDay + daysInMonth; day++) {
    const dayMod = Math.abs(day) % 7;
    // Use different camper pools for different time slots to avoid conflicts
    let morningPool = (Math.abs(day) * 30) % 350;
    let afternoonPool1 = (Math.abs(day) * 30 + 100) % 350;
    let afternoonPool2 = (Math.abs(day) * 30 + 200) % 350;
    let eveningPool = (Math.abs(day) * 30 + 50) % 350;
    
    // Morning Assembly (9:00-9:30) - Large groups (not every day)
    if (dayMod === 1 || dayMod === 3 || dayMod === 5) {
      events.push(createEvent(
        eventId++,
        'Morning Assembly',
        day,
        9,
        0.5,
        generateId('room', 1),
        150,
        'activity',
        [generateId('staff', 1), generateId('staff', 2), generateId('staff', 3)],
        getCampers(120, morningPool),
        '#6366F1',
      ));
    }
    
    // Morning Activities Block 1 (10:00-11:30)
    // Multiple concurrent activities with different camper pools
    if (dayMod === 0 || dayMod === 3) {
      // Pottery from Arts & Crafts Program - Group A
      events.push(createEvent(
        eventId++,
        'Pottery',
        day,
        10,
        1.5,
        generateId('room', 2),
        15,
        'activity',
        [generateId('staff', 14), generateId('staff', 22)],
        getCampers(12, morningPool),
        '#EC4899',
        undefined,
        generateId('program', 2),
        generateId('activity', 5)
      ));
      // Soccer - Group B
      events.push(createEvent(
        eventId++,
        'Soccer',
        day,
        10,
        1.5,
        generateId('room', 3),
        25,
        'sports',
        [generateId('staff', 26), generateId('staff', 30)],
        getCampers(22, morningPool + 12),
        '#F59E0B',
        undefined,
        generateId('program', 6),
        generateId('activity', 21)
      ));
      // Theater Workshop - Group C
      events.push(createEvent(
        eventId++,
        'Theater Workshop',
        day,
        10,
        1.5,
        generateId('room', 10),
        20,
        'activity',
        [generateId('staff', 13)],
        getCampers(18, morningPool + 34),
        '#8B5CF6',
        undefined,
        generateId('program', 4),
        generateId('activity', 13)
      ));
      // Nature Hike - Group D
      events.push(createEvent(
        eventId++,
        'Nature Hike',
        day,
        10,
        2,
        generateId('room', 7),
        20,
        'activity',
        [generateId('staff', 21), generateId('staff', 25)],
        getCampers(18, morningPool + 52),
        '#14B8A6',
        undefined,
        generateId('program', 5),
        generateId('activity', 17)
      ));
    } else if (dayMod === 1 || dayMod === 4) {
      // Swimming Lessons from Watersports Program
      // Staff 11, 12, 15 have Lifeguard + Swimming Instructor
      // Intentionally use wrong staff on day 4 for demo conflict
      const swimmingStaff = day === (startDay + 3)
        ? [generateId('staff', 8), generateId('staff', 10)] // Missing Lifeguard/Swimming Instructor!
        : [generateId('staff', 11), generateId('staff', 15)];
      events.push(createEvent(
        eventId++,
        'Swimming Lessons',
        day,
        10,
        1,
        generateId('room', 4),
        15,
        'sports',
        swimmingStaff,
        getCampers(12, morningPool),
        '#60A5FA',
        ['Lifeguard', 'Swimming Instructor'],
        generateId('program', 1),
        generateId('activity', 2)
      ));
      // Painting Workshop - different campers
      events.push(createEvent(
        eventId++,
        'Painting Workshop',
        day,
        10,
        1.25,
        generateId('room', 2),
        18,
        'activity',
        [generateId('staff', 18)],
        getCampers(15, morningPool + 12),
        '#F472B6',
        undefined,
        generateId('program', 2),
        generateId('activity', 6)
      ));
      // Basketball - Group C
      events.push(createEvent(
        eventId++,
        'Basketball',
        day,
        10,
        1.5,
        generateId('room', 9),
        20,
        'sports',
        [generateId('staff', 30)],
        getCampers(18, morningPool + 27),
        '#FBBF24',
        undefined,
        generateId('program', 6),
        generateId('activity', 22)
      ));
      // Coding Basics - Group D
      events.push(createEvent(
        eventId++,
        'Coding Basics',
        day,
        10,
        1.5,
        generateId('room', 5),
        15,
        'activity',
        [generateId('staff', 33)],
        getCampers(14, morningPool + 45),
        '#06B6D4',
        undefined,
        generateId('program', 9),
        generateId('activity', 31)
      ));
    } else if (dayMod === 2 || dayMod === 5) {
      // Rock Climbing from Adventure Sports Program
      // Staff 8, 14, 16, 18 have Climbing Instructor + First Aid
      // Intentionally use wrong staff on day 1 for demo conflict
      const climbingStaff = day === startDay 
        ? [generateId('staff', 9), generateId('staff', 11)] // Missing Climbing Instructor!
        : [generateId('staff', 8), generateId('staff', 14)];
      events.push(createEvent(
        eventId++,
        'Rock Climbing',
        day,
        10,
        1.5,
        generateId('room', 3),
        12,
        'activity',
        climbingStaff,
        getCampers(10, morningPool),
        '#10B981',
        ['Climbing Instructor', 'First Aid'],
        generateId('program', 3),
        generateId('activity', 9)
      ));
      // Archery - Group B
      // Staff 10, 17, 20 have Archery Instructor
      // Intentionally use wrong staff on day 2 for demo conflict
      const archeryStaff = day === (startDay + 1)
        ? [generateId('staff', 15), generateId('staff', 19)] // Missing Archery Instructor!
        : [generateId('staff', 10), generateId('staff', 17)];
      events.push(createEvent(
        eventId++,
        'Archery',
        day,
        10,
        1,
        generateId('room', 7),
        15,
        'activity',
        archeryStaff,
        getCampers(12, morningPool + 10),
        '#34D399',
        ['Archery Instructor'],
        generateId('program', 3),
        generateId('activity', 10)
      ));
      // Music Jam Session - Group C
      events.push(createEvent(
        eventId++,
        'Music Jam Session',
        day,
        10,
        1,
        generateId('room', 8),
        15,
        'activity',
        [generateId('staff', 17)],
        getCampers(14, morningPool + 22),
        '#A78BFA',
        undefined,
        generateId('program', 4),
        generateId('activity', 14)
      ));
      // Baking Class - Group D
      events.push(createEvent(
        eventId++,
        'Baking Class',
        day,
        10,
        1.5,
        generateId('room', 6),
        12,
        'activity',
        [generateId('staff', 28), generateId('staff', 32)],
        getCampers(11, morningPool + 36),
        '#EF4444',
        undefined,
        generateId('program', 8),
        generateId('activity', 28)
      ));
    } else {
      // General Soccer Practice
      events.push(createEvent(
        eventId++,
        'Soccer',
        day,
        10,
        1.5,
        generateId('room', 3),
        25,
        'sports',
        [generateId('staff', 26), generateId('staff', 34)],
        getCampers(22, morningPool),
        '#F59E0B',
        undefined,
        generateId('program', 6),
        generateId('activity', 21)
      ));
      // Yoga - Group B
      events.push(createEvent(
        eventId++,
        'Yoga',
        day,
        10,
        1,
        generateId('room', 1),
        25,
        'activity',
        [generateId('staff', 36)],
        getCampers(24, morningPool + 22),
        '#A855F7',
        undefined,
        generateId('program', 10),
        generateId('activity', 34)
      ));
      // Tie-Dye - Group C
      events.push(createEvent(
        eventId++,
        'Tie-Dye',
        day,
        10,
        1.5,
        generateId('room', 2),
        20,
        'activity',
        [generateId('staff', 22)],
        getCampers(18, morningPool + 46),
        '#F9A8D4',
        undefined,
        generateId('program', 2),
        generateId('activity', 8)
      ));
    }
    
    // Lunch (12:00-1:00) - Everyone (can accommodate all)
    events.push(createEvent(
      eventId++,
      'Lunch',
      day,
      12,
      1,
      generateId('room', 6),
      400,
      'meal',
      [generateId('staff', 2), generateId('staff', 7), generateId('staff', 12), generateId('staff', 15)],
      getCampers(350, 0), // All campers
      '#64748B',
    ));
    
    // Afternoon Activities Block 1 (2:00-4:00) - Multiple concurrent activities
    if (dayMod === 0 || dayMod === 2 || dayMod === 4) {
      // Wakeboarding from Watersports Program - Group A
      // Staff 12, 13 have Lifeguard + Boat Driver
      // Intentionally use wrong staff on day 1 & 2 for demo conflicts
      const wakeboardingStaff = day <= (startDay + 1) 
        ? [generateId('staff', 5), generateId('staff', 6)] // Missing certifications!
        : [generateId('staff', 12), generateId('staff', 13)];
      events.push(createEvent(
        eventId++,
        'Wakeboarding',
        day,
        14,
        2,
        generateId('room', 5),
        8,
        'sports',
        wakeboardingStaff,
        getCampers(7, afternoonPool1),
        '#3B82F6',
        ['Lifeguard', 'Boat Driver'],
        generateId('program', 1),
        generateId('activity', 1)
      ));
      // Music Class - Group B (different campers)
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
        getCampers(12, afternoonPool1 + 7),
        '#F59E0B',
      ));
    } else if (dayMod === 1 || dayMod === 3) {
      // Painting Workshop from Arts & Crafts Program - Group A
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
        getCampers(12, afternoonPool1),
        '#F472B6',
        undefined,
        generateId('program', 2),
        generateId('activity', 5)
      ));
      // Basketball - Group B (different campers, same time)
      events.push(createEvent(
        eventId++,
        'Basketball',
        day,
        14,
        1.5,
        generateId('room', 3),
        20,
        'sports',
        [generateId('staff', 6)],
        getCampers(16, afternoonPool1 + 12),
        '#EF4444',
      ));
    } else {
      // Kayaking from Watersports Program - Group A
      // Staff 11, 12, 13, 15 have Lifeguard certification
      events.push(createEvent(
        eventId++,
        'Kayaking',
        day,
        14,
        1.5,
        generateId('room', 5),
        10,
        'sports',
        [generateId('staff', 12), generateId('staff', 13)],
        getCampers(9, afternoonPool1),
        '#2563EB',
        ['Lifeguard'],
        generateId('program', 1),
        generateId('activity', 3)
      ));
    }
    
    // Afternoon Activities Block 2 (4:00-5:30)
    if (dayMod % 2 === 0) {
      // Archery from Adventure Sports Program - Group A
      // Staff 10, 17, 20 have Archery Instructor
      events.push(createEvent(
        eventId++,
        'Archery',
        day,
        16,
        1.5,
        generateId('room', 7),
        12,
        'activity',
        [generateId('staff', 20), generateId('staff', 27)],
        getCampers(10, afternoonPool2),
        '#10B981',
        ['Archery Instructor'],
        generateId('program', 3),
        generateId('activity', 8)
      ));
      
      // Jewelry Making from Arts & Crafts Program - Group B
      events.push(createEvent(
        eventId++,
        'Jewelry Making',
        day,
        16,
        1,
        generateId('room', 9),
        12,
        'activity',
        [generateId('staff', 12)],
        getCampers(10, afternoonPool2 + 10),
        '#DB2777',
        undefined,
        generateId('program', 2),
        generateId('activity', 6)
      ));
    } else {
      // Basketball - Group A
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
        getCampers(16, afternoonPool2),
        '#EF4444',
      ));
    }
    
    // Dinner (6:00-7:00) - Everyone (can accommodate all)
    events.push(createEvent(
      eventId++,
      'Dinner',
      day,
      18,
      1,
      generateId('room', 6),
      400,
      'meal',
      [generateId('staff', 3), generateId('staff', 6), generateId('staff', 10), generateId('staff', 14)],
      getCampers(350, 0), // All campers
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
        150,
        'activity',
        [generateId('staff', 1), generateId('staff', 2), generateId('staff', 3), generateId('staff', 16)],
        getCampers(120, eveningPool),
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
        100,
        'activity',
        [generateId('staff', 1), generateId('staff', 7), generateId('staff', 17)],
        getCampers(80, eveningPool),
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
        150,
        'activity',
        [generateId('staff', 2), generateId('staff', 4), generateId('staff', 18)],
        getCampers(130, eveningPool),
        '#8B5CF6',
      ));
      // Intentionally create ONE conflict for demonstration - small overlap
      if (day === startDay + 7) { // Only on one specific day
        events.push(createEvent(
          eventId++,
          'Game Night',
          day,
          20,
          1.5,
          generateId('room', 8),
          40,
          'activity',
          [generateId('staff', 8), generateId('staff', 19)],
          getCampers(30, eveningPool), // Same campers as Movie Night - creates conflict!
          '#A78BFA',
        ));
      }
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
        200,
        'free-time',
        [generateId('staff', 1), generateId('staff', 2), generateId('staff', 20)],
        getCampers(150, eveningPool),
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

// Programs - Expanded to 10 programs
export const mockPrograms: Program[] = [
  {
    id: generateId('program', 1),
    name: 'Watersports',
    description: 'Water-based activities including wakeboarding, kayaking, and swimming',
    color: '#3B82F6',
    activityIds: [],
    staffMemberIds: ['staff-008', 'staff-010', 'staff-012', 'staff-016', 'staff-020'],
    roomIds: ['room-004', 'room-010'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 2),
    name: 'Arts & Crafts',
    description: 'Creative activities including pottery, painting, and jewelry making',
    color: '#EC4899',
    activityIds: [],
    staffMemberIds: ['staff-014', 'staff-018', 'staff-022'],
    roomIds: ['room-002', 'room-008'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 3),
    name: 'Adventure Sports',
    description: 'High-energy outdoor activities including rock climbing, archery, and ropes course',
    color: '#10B981',
    activityIds: [],
    staffMemberIds: ['staff-009', 'staff-011', 'staff-015', 'staff-019'],
    roomIds: ['room-003', 'room-007'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 4),
    name: 'Performing Arts',
    description: 'Theater, music, dance, and performance activities',
    color: '#8B5CF6',
    activityIds: [],
    staffMemberIds: ['staff-013', 'staff-017', 'staff-24'],
    roomIds: ['room-008', 'room-010'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 5),
    name: 'Science & Nature',
    description: 'Outdoor education, biology, astronomy, and environmental science',
    color: '#14B8A6',
    activityIds: [],
    staffMemberIds: ['staff-021', 'staff-025', 'staff-29'],
    roomIds: ['room-005', 'room-007'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 6),
    name: 'Team Sports',
    description: 'Soccer, basketball, volleyball, and other team-based sports',
    color: '#F59E0B',
    activityIds: [],
    staffMemberIds: ['staff-026', 'staff-30', 'staff-34'],
    roomIds: ['room-003', 'room-009'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 7),
    name: 'Leadership Development',
    description: 'Team building, leadership skills, and communication workshops',
    color: '#6366F1',
    activityIds: [],
    staffMemberIds: ['staff-027', 'staff-31', 'staff-35'],
    roomIds: ['room-001', 'room-005'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 8),
    name: 'Cooking & Culinary',
    description: 'Baking, cooking classes, and food science',
    color: '#EF4444',
    activityIds: [],
    staffMemberIds: ['staff-028', 'staff-32'],
    roomIds: ['room-006'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 9),
    name: 'Technology & Gaming',
    description: 'Coding, robotics, video production, and board games',
    color: '#06B6D4',
    activityIds: [],
    staffMemberIds: ['staff-033', 'staff-37', 'staff-41'],
    roomIds: ['room-005'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 10),
    name: 'Wellness & Mindfulness',
    description: 'Yoga, meditation, fitness, and mental health activities',
    color: '#A855F7',
    activityIds: [],
    staffMemberIds: ['staff-036', 'staff-40', 'staff-44'],
    roomIds: ['room-001', 'room-007'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
];

// Activities - Expanded to 35 activities across all programs
export const mockActivities: Activity[] = [
  // Watersports Activities (Program 1)
  {
    id: generateId('activity', 1),
    name: 'Wakeboarding',
    description: 'Learn wakeboarding basics or improve your skills on the lake',
    programIds: [generateId('program', 1)],
    durationMinutes: 120,
    defaultRoomId: 'room-004',
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
    defaultRoomId: 'room-004',
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
    defaultRoomId: 'room-004',
    requiredCertifications: ['Lifeguard'],
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 10,
    color: '#2563EB',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 4),
    name: 'Stand-Up Paddleboarding',
    description: 'Balance and paddle on stand-up paddleboards',
    programIds: [generateId('program', 1)],
    durationMinutes: 75,
    defaultRoomId: 'room-004',
    requiredCertifications: ['Lifeguard'],
    minStaff: 2,
    maxStaff: 2,
    defaultCapacity: 10,
    color: '#1D4ED8',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  // Arts & Crafts Activities (Program 2)
  {
    id: generateId('activity', 5),
    name: 'Pottery',
    description: 'Create your own pottery pieces on the wheel',
    programIds: [generateId('program', 2)],
    durationMinutes: 90,
    defaultRoomId: 'room-002',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 10,
    color: '#EC4899',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 6),
    name: 'Painting Workshop',
    description: 'Express yourself through various painting techniques',
    programIds: [generateId('program', 2)],
    durationMinutes: 75,
    defaultRoomId: 'room-002',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 15,
    color: '#F472B6',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 7),
    name: 'Jewelry Making',
    description: 'Design and create your own jewelry pieces',
    programIds: [generateId('program', 2)],
    durationMinutes: 60,
    defaultRoomId: 'room-002',
    minStaff: 1,
    maxStaff: 1,
    defaultCapacity: 12,
    color: '#DB2777',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 8),
    name: 'Tie-Dye',
    description: 'Create colorful tie-dye shirts and accessories',
    programIds: [generateId('program', 2)],
    durationMinutes: 90,
    defaultRoomId: 'room-002',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 20,
    color: '#F9A8D4',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  // Adventure Sports Activities (Program 3)
  {
    id: generateId('activity', 9),
    name: 'Rock Climbing',
    description: 'Indoor rock climbing with safety instruction',
    programIds: [generateId('program', 3)],
    durationMinutes: 90,
    defaultRoomId: 'room-003',
    requiredCertifications: ['Climbing Instructor', 'First Aid'],
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 10,
    color: '#10B981',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 10),
    name: 'Archery',
    description: 'Learn archery basics and target practice',
    programIds: [generateId('program', 3)],
    durationMinutes: 60,
    defaultRoomId: 'room-007',
    requiredCertifications: ['Archery Instructor'],
    minStaff: 2,
    maxStaff: 2,
    defaultCapacity: 12,
    color: '#34D399',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 11),
    name: 'Ropes Course',
    description: 'Challenge yourself on our high ropes course',
    programIds: [generateId('program', 3)],
    durationMinutes: 120,
    defaultRoomId: 'room-007',
    requiredCertifications: ['Ropes Course Instructor', 'First Aid'],
    minStaff: 3,
    maxStaff: 4,
    defaultCapacity: 8,
    color: '#059669',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 12),
    name: 'Orienteering',
    description: 'Navigation and map reading in the wilderness',
    programIds: [generateId('program', 3)],
    durationMinutes: 120,
    defaultRoomId: 'room-007',
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 15,
    color: '#10B981',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  // Performing Arts Activities (Program 4)
  {
    id: generateId('activity', 13),
    name: 'Theater Workshop',
    description: 'Acting exercises and scene work',
    programIds: [generateId('program', 4)],
    durationMinutes: 90,
    defaultRoomId: 'room-010',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 20,
    color: '#8B5CF6',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 14),
    name: 'Music Jam Session',
    description: 'Play instruments and create music together',
    programIds: [generateId('program', 4)],
    durationMinutes: 60,
    defaultRoomId: 'room-008',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 15,
    color: '#A78BFA',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 15),
    name: 'Dance Class',
    description: 'Learn various dance styles and choreography',
    programIds: [generateId('program', 4)],
    durationMinutes: 75,
    defaultRoomId: 'room-001',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 25,
    color: '#C4B5FD',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 16),
    name: 'Improv Comedy',
    description: 'Quick thinking and comedy improvisation',
    programIds: [generateId('program', 4)],
    durationMinutes: 60,
    defaultRoomId: 'room-010',
    minStaff: 1,
    maxStaff: 1,
    defaultCapacity: 18,
    color: '#7C3AED',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  // Science & Nature Activities (Program 5)
  {
    id: generateId('activity', 17),
    name: 'Nature Hike',
    description: 'Explore local trails and learn about ecology',
    programIds: [generateId('program', 5)],
    durationMinutes: 120,
    defaultRoomId: 'room-007',
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 20,
    color: '#14B8A6',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 18),
    name: 'Stargazing',
    description: 'Learn about constellations and astronomy',
    programIds: [generateId('program', 5)],
    durationMinutes: 90,
    defaultRoomId: 'room-007',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 30,
    color: '#5EEAD4',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 19),
    name: 'Biology Lab',
    description: 'Hands-on experiments and microscope work',
    programIds: [generateId('program', 5)],
    durationMinutes: 75,
    defaultRoomId: 'room-005',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 15,
    color: '#2DD4BF',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 20),
    name: 'Gardening',
    description: 'Learn about plants and sustainable gardening',
    programIds: [generateId('program', 5)],
    durationMinutes: 60,
    defaultRoomId: 'room-007',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 12,
    color: '#14B8A6',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  // Team Sports Activities (Program 6)
  {
    id: generateId('activity', 21),
    name: 'Soccer',
    description: 'Team soccer games and skill development',
    programIds: [generateId('program', 6)],
    durationMinutes: 90,
    defaultRoomId: 'room-003',
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 22,
    color: '#F59E0B',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 22),
    name: 'Basketball',
    description: 'Basketball drills and games',
    programIds: [generateId('program', 6)],
    durationMinutes: 90,
    defaultRoomId: 'room-009',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 20,
    color: '#FBBF24',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 23),
    name: 'Volleyball',
    description: 'Volleyball techniques and matches',
    programIds: [generateId('program', 6)],
    durationMinutes: 75,
    defaultRoomId: 'room-003',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 16,
    color: '#FCD34D',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 24),
    name: 'Ultimate Frisbee',
    description: 'Fast-paced team frisbee games',
    programIds: [generateId('program', 6)],
    durationMinutes: 60,
    defaultRoomId: 'room-003',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 20,
    color: '#F59E0B',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  // Leadership Development Activities (Program 7)
  {
    id: generateId('activity', 25),
    name: 'Team Building Games',
    description: 'Collaborative challenges and trust exercises',
    programIds: [generateId('program', 7)],
    durationMinutes: 90,
    defaultRoomId: 'room-007',
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 25,
    color: '#6366F1',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 26),
    name: 'Public Speaking',
    description: 'Develop confidence and presentation skills',
    programIds: [generateId('program', 7)],
    durationMinutes: 60,
    defaultRoomId: 'room-005',
    minStaff: 1,
    maxStaff: 1,
    defaultCapacity: 15,
    color: '#818CF8',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 27),
    name: 'Conflict Resolution',
    description: 'Learn mediation and problem-solving skills',
    programIds: [generateId('program', 7)],
    durationMinutes: 75,
    defaultRoomId: 'room-005',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 20,
    color: '#A5B4FC',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  // Cooking & Culinary Activities (Program 8)
  {
    id: generateId('activity', 28),
    name: 'Baking Class',
    description: 'Learn to bake cookies, cakes, and pastries',
    programIds: [generateId('program', 8)],
    durationMinutes: 90,
    defaultRoomId: 'room-006',
    minStaff: 2,
    maxStaff: 2,
    defaultCapacity: 12,
    color: '#EF4444',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 29),
    name: 'Cooking Workshop',
    description: 'Prepare healthy meals and learn kitchen safety',
    programIds: [generateId('program', 8)],
    durationMinutes: 120,
    defaultRoomId: 'room-006',
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 15,
    color: '#F87171',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 30),
    name: 'Food Science',
    description: 'Explore the chemistry of cooking',
    programIds: [generateId('program', 8)],
    durationMinutes: 75,
    defaultRoomId: 'room-006',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 12,
    color: '#FCA5A5',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  // Technology & Gaming Activities (Program 9)
  {
    id: generateId('activity', 31),
    name: 'Coding Basics',
    description: 'Introduction to programming with Scratch or Python',
    programIds: [generateId('program', 9)],
    durationMinutes: 90,
    defaultRoomId: 'room-005',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 15,
    color: '#06B6D4',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 32),
    name: 'Robotics',
    description: 'Build and program simple robots',
    programIds: [generateId('program', 9)],
    durationMinutes: 120,
    defaultRoomId: 'room-005',
    minStaff: 2,
    maxStaff: 2,
    defaultCapacity: 12,
    color: '#22D3EE',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 33),
    name: 'Board Game Tournament',
    description: 'Strategic board games and tournaments',
    programIds: [generateId('program', 9)],
    durationMinutes: 90,
    defaultRoomId: 'room-001',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 20,
    color: '#67E8F9',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  // Wellness & Mindfulness Activities (Program 10)
  {
    id: generateId('activity', 34),
    name: 'Yoga',
    description: 'Gentle yoga practice for all levels',
    programIds: [generateId('program', 10)],
    durationMinutes: 60,
    defaultRoomId: 'room-001',
    minStaff: 1,
    maxStaff: 1,
    defaultCapacity: 25,
    color: '#A855F7',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 35),
    name: 'Meditation & Mindfulness',
    description: 'Breathing exercises and guided meditation',
    programIds: [generateId('program', 10)],
    durationMinutes: 45,
    defaultRoomId: 'room-007',
    minStaff: 1,
    maxStaff: 1,
    defaultCapacity: 30,
    color: '#C084FC',
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
];

// Update programs with activity IDs
mockPrograms[0].activityIds = [generateId('activity', 1), generateId('activity', 2), generateId('activity', 3), generateId('activity', 4)];
mockPrograms[1].activityIds = [generateId('activity', 5), generateId('activity', 6), generateId('activity', 7), generateId('activity', 8)];
mockPrograms[2].activityIds = [generateId('activity', 9), generateId('activity', 10), generateId('activity', 11), generateId('activity', 12)];
mockPrograms[3].activityIds = [generateId('activity', 13), generateId('activity', 14), generateId('activity', 15), generateId('activity', 16)];
mockPrograms[4].activityIds = [generateId('activity', 17), generateId('activity', 18), generateId('activity', 19), generateId('activity', 20)];
mockPrograms[5].activityIds = [generateId('activity', 21), generateId('activity', 22), generateId('activity', 23), generateId('activity', 24)];
mockPrograms[6].activityIds = [generateId('activity', 25), generateId('activity', 26), generateId('activity', 27)];
mockPrograms[7].activityIds = [generateId('activity', 28), generateId('activity', 29), generateId('activity', 30)];
mockPrograms[8].activityIds = [generateId('activity', 31), generateId('activity', 32), generateId('activity', 33)];
mockPrograms[9].activityIds = [generateId('activity', 34), generateId('activity', 35)];

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
