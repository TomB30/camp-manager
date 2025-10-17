import type { Camper, StaffMember, Location, HousingRoom, Event, Area, Label, CamperGroup, FamilyGroup, Program, Activity, Certification, CampColor, CampSession } from '@/types';

// Generate consistent IDs
const generateId = (prefix: string, index: number) => `${prefix}-${String(index).padStart(3, '0')}`;

// Colors - Setup first for use throughout the system
export const mockColors: CampColor[] = [
  {
    id: generateId('color', 1),
    name: 'Ocean Blue',
    hexValue: '#3B82F6',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('color', 2),
    name: 'Forest Green',
    hexValue: '#10B981',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('color', 3),
    name: 'Sunset Orange',
    hexValue: '#F59E0B',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('color', 4),
    name: 'Royal Purple',
    hexValue: '#8B5CF6',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('color', 5),
    name: 'Flamingo Pink',
    hexValue: '#EC4899',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('color', 6),
    name: 'Fire Red',
    hexValue: '#EF4444',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('color', 7),
    name: 'Teal Wave',
    hexValue: '#14B8A6',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('color', 8),
    name: 'Indigo Night',
    hexValue: '#6366F1',
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
];

// Sessions - Define camp registration periods
export const mockSessions: CampSession[] = [
  {
    id: generateId('session', 1),
    name: 'Week 1: Adventure Begins',
    startDate: new Date(2025, 5, 15).toISOString().split('T')[0], // June 15, 2025
    endDate: new Date(2025, 5, 21).toISOString().split('T')[0], // June 21, 2025
    description: 'Opening week of summer camp - perfect for first-time campers',
    maxCampers: 150,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('session', 2),
    name: 'Week 2: Explorer\'s Quest',
    startDate: new Date(2025, 5, 22).toISOString().split('T')[0], // June 22, 2025
    endDate: new Date(2025, 5, 28).toISOString().split('T')[0], // June 28, 2025
    description: 'Focus on outdoor adventure and nature exploration',
    maxCampers: 150,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('session', 3),
    name: 'Week 3-4: Summer Spectacular',
    startDate: new Date(2025, 5, 29).toISOString().split('T')[0], // June 29, 2025
    endDate: new Date(2025, 6, 12).toISOString().split('T')[0], // July 12, 2025
    description: 'Extended two-week session with special programming',
    maxCampers: 175,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('session', 4),
    name: 'Week 5: Arts & Performance',
    startDate: new Date(2025, 6, 13).toISOString().split('T')[0], // July 13, 2025
    endDate: new Date(2025, 6, 19).toISOString().split('T')[0], // July 19, 2025
    description: 'Creative arts, theater, and performance showcase',
    maxCampers: 150,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('session', 5),
    name: 'Week 6: Grand Finale',
    startDate: new Date(2025, 6, 20).toISOString().split('T')[0], // July 20, 2025
    endDate: new Date(2025, 6, 26).toISOString().split('T')[0], // July 26, 2025
    description: 'Closing week with camp-wide games and celebrations',
    maxCampers: 150,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
];

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

// Areas - Setup before locations and housing rooms
export const mockLocations: Area[] = [
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

// Extended housing rooms for more campers (20 rooms total)
const cabinNames = [
  'Eagles', 'Hawks', 'Wolves', 'Butterflies', 'Fireflies', 'Dolphins',
  'Tigers', 'Bears', 'Panthers', 'Foxes', 'Owls', 'Ravens',
  'Falcons', 'Cougars', 'Lynx', 'Otters', 'Beavers', 'Moose',
  'Elk', 'Bison', 'Cardinals', 'Blue Jays', 'Sparrows', 'Swallows'
];

const generateSleepingRooms = (count: number): HousingRoom[] => {
  const rooms: HousingRoom[] = [];
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
      areaId: generateId('location', location.id),
    });
  }
  
  return rooms;
};

export const mockSleepingRooms: HousingRoom[] = generateSleepingRooms(24);

// Family Groups - fundamental organizational units (one per housing room)
const generateFamilyGroups = (sleepingRooms: HousingRoom[]): FamilyGroup[] => {
  const groups: FamilyGroup[] = [];
  
  sleepingRooms.forEach((room, index) => {
    // Distribute family groups across the 5 sessions evenly
    const sessionIndex = (index % 5) + 1;
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
      housingRoomId: room.id,
      staffMemberIds: staffIds,
      sessionId: generateId('session', sessionIndex),
      colorId: mockColors[index % mockColors.length].id,
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
  
  // Create a more unique name pairing by using different cycling rates
  // This ensures that first and last names don't repeat in the same pattern
  for (let i = 1; i <= count; i++) {
    const gender: 'male' | 'female' = i % 2 === 0 ? 'male' : 'female';
    const genderNames = firstNames[gender];
    const nameIndex = gender === 'male' ? maleCount++ : femaleCount++;
    
    // Use different offsets for first and last names to create more unique combinations
    const firstNameIndex = nameIndex % genderNames.length;
    // Use a prime number offset (17) to ensure different pairing patterns
    const lastNameIndex = ((i - 1) * 17) % lastNames.length;
    
    const firstName = genderNames[firstNameIndex];
    const lastName = lastNames[lastNameIndex];
    const age = 6 + (i % 10); // Ages 6-15
    
    // Distribute campers evenly across family groups (~10-12 per group)
    const campersPerGroup = Math.ceil(count / totalFamilyGroups);
    const familyGroupIndex = Math.floor((i - 1) / campersPerGroup) % totalFamilyGroups;
    const familyGroupId = generateId('family', familyGroupIndex + 1);
    
    // 20% chance of having an allergy
    const hasAllergy = (i * 7) % 100 < 20;
    const camperAllergies = hasAllergy ? [allergies[i % allergies.length]] : [];
    
    // Distribute campers across 5 sessions evenly
    const sessionIndex = (i % 5) + 1;
    const sessionId = generateId('session', sessionIndex);
    
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
      sessionId,
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
      certificationIds: certCombo.map(c => generateId('cert', c)),
      managerId: generateId('staff', supervisorId),
    });
  }
  
  return staff;
};

export const mockStaffMembers: StaffMember[] = generateStaff(50);

export const mockRooms: Location[] = [
  {
    id: generateId('room', 1),
    name: 'Main Hall',
    capacity: 50,
    type: 'activity',
    areaId: generateId('location', 1),
    equipment: ['Projector', 'Sound System', 'Tables', 'Chairs'],
  },
  {
    id: generateId('room', 2),
    name: 'Art Studio',
    capacity: 15,
    type: 'arts',
    areaId: generateId('location', 2),
    equipment: ['Easels', 'Paint Supplies', 'Clay', 'Kiln'],
  },
  {
    id: generateId('room', 3),
    name: 'Sports Field',
    capacity: 30,
    type: 'sports',
    areaId: generateId('location', 4),
    equipment: ['Soccer Goals', 'Cones', 'Balls'],
  },
  {
    id: generateId('room', 4),
    name: 'Swimming Pool',
    capacity: 20,
    type: 'sports',
    areaId: generateId('location', 5),
    equipment: ['Pool Noodles', 'Kickboards', 'Life Vests'],
  },
  {
    id: generateId('room', 5),
    name: 'Classroom A',
    capacity: 20,
    type: 'classroom',
    areaId: generateId('location', 3),
    equipment: ['Whiteboard', 'Desks', 'Books', 'Computers'],
  },
  {
    id: generateId('room', 6),
    name: 'Dining Hall',
    capacity: 60,
    type: 'dining',
    areaId: generateId('location', 3),
    equipment: ['Tables', 'Benches', 'Kitchen Access'],
  },
  {
    id: generateId('room', 7),
    name: 'Outdoor Plaza',
    capacity: 40,
    type: 'outdoor',
    areaId: generateId('location', 6),
    equipment: ['Picnic Tables', 'Shade Structures', 'Water Fountain'],
  },
  {
    id: generateId('room', 8),
    name: 'Music Room',
    capacity: 15,
    type: 'arts',
    areaId: generateId('location', 2),
    equipment: ['Piano', 'Guitars', 'Drums', 'Microphones'],
  },
  {
    id: generateId('room', 9),
    name: 'Basketball Court',
    capacity: 20,
    type: 'sports',
    areaId: generateId('location', 7),
    equipment: ['Basketballs', 'Scoreboard', 'Benches'],
  },
  {
    id: generateId('room', 10),
    name: 'Theater Stage',
    capacity: 25,
    type: 'arts',
    areaId: generateId('location', 1),
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
  locationId: string,
  capacity: number,
  groupIds: string[],
  colorId: string,
  requiredCerts?: string[],
  programId?: string,
  activityId?: string,
  excludeStaffIds?: string[],
  excludeCamperIds?: string[]
): Event => {
  const today = new Date();
  const eventDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset, startHour, 0);
  const endTime = new Date(eventDate.getTime() + durationHours * 60 * 60 * 1000);

  return {
    id: generateId('event', id),
    title,
    startTime: eventDate.toISOString(),
    endTime: endTime.toISOString(),
    locationId,
    capacity,
    groupIds,
    excludeStaffIds,
    excludeCamperIds,
    colorId,
    requiredCertifications: requiredCerts,
    programId,
    activityId,
  };
};

// Generate a full month of varied events
const generateMonthEvents = (): Event[] => {
  const events: Event[] = [];
  let eventId = 1;
  
  // Helper to get groups for events
  const getGroups = (count: number, startIdx: number, includeFamilyGroups: boolean = true) => {
    const groups = [];
    
    // Mix of camper groups (5 total) and family groups (24 total)
    if (count <= 2) {
      // Small events: use 1-2 camper groups
      for (let i = 0; i < count; i++) {
        const groupIdx = ((startIdx + i) % 5) + 1;
        groups.push(generateId('group', groupIdx));
      }
    } else if (count <= 5 && includeFamilyGroups) {
      // Medium events: use 2-5 family groups
      for (let i = 0; i < count; i++) {
        const familyIdx = ((startIdx + i) % 24) + 1;
        groups.push(generateId('family', familyIdx));
      }
    } else {
      // Large events: mix of camper groups and some family groups
      const camperGroupCount = Math.min(3, Math.floor(count / 2));
      const familyGroupCount = Math.min(count - camperGroupCount, 6);
      
      for (let i = 0; i < camperGroupCount; i++) {
        const groupIdx = ((startIdx + i) % 5) + 1;
        groups.push(generateId('group', groupIdx));
      }
      
      if (includeFamilyGroups) {
        for (let i = 0; i < familyGroupCount; i++) {
          const familyIdx = ((startIdx + i) % 24) + 1;
          groups.push(generateId('family', familyIdx));
        }
      }
    }
    
    return groups;
  };
  
  // Get current month details
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startDay = 1 - today.getDate(); // Start from the 1st of the month
  
  // Generate events for all days in the month
  for (let day = startDay; day < startDay + daysInMonth; day++) {
    const dayMod = Math.abs(day) % 7;
    const groupOffset = Math.abs(day);
    
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
        getGroups(8, groupOffset), // All camper groups + some family groups
        mockColors[7].id,
      ));
    }
    
    // Morning Activities Block 1 (10:00-11:30)
    // Multiple concurrent activities with different groups
    if (dayMod === 0 || dayMod === 3) {
      // Pottery from Arts & Crafts Program - Junior Campers
      events.push(createEvent(
        eventId++,
        'Pottery',
        day,
        10,
        1.5,
        generateId('room', 2),
        15,
        [generateId('group', 1)], // Junior Campers
        mockColors[5].id,
        undefined,
        generateId('program', 2),
        generateId('activity', 5)
      ));
      // Soccer - Middle Age and some family groups
      events.push(createEvent(
        eventId++,
        'Soccer',
        day,
        10,
        1.5,
        generateId('room', 3),
        25,
        [generateId('group', 3), generateId('family', 1 + (groupOffset % 24))],
        mockColors[3].id,
        undefined,
        generateId('program', 6),
        generateId('activity', 21)
      ));
      // Theater Workshop - Senior Campers
      events.push(createEvent(
        eventId++,
        'Theater Workshop',
        day,
        10,
        1.5,
        generateId('room', 10),
        20,
        [generateId('group', 2)], // Senior Campers
        mockColors[4].id,
        undefined,
        generateId('program', 4),
        generateId('activity', 13)
      ));
      // Nature Hike - Mixed groups
      events.push(createEvent(
        eventId++,
        'Nature Hike',
        day,
        10,
        2,
        generateId('room', 7),
        20,
        getGroups(3, groupOffset + 1),
        mockColors[7].id,
        undefined,
        generateId('program', 5),
        generateId('activity', 17)
      ));
    } else if (dayMod === 1 || dayMod === 4) {
      // Swimming Lessons from Watersports Program
      events.push(createEvent(
        eventId++,
        'Swimming Lessons',
        day,
        10,
        1,
        generateId('room', 4),
        15,
        [generateId('family', 1 + (groupOffset % 24)), generateId('family', 1 + ((groupOffset + 1) % 24))],
        mockColors[7].id,
        ['Lifeguard', 'Swimming Instructor'],
        generateId('program', 1),
        generateId('activity', 2)
      ));
      // Painting Workshop - Girls Power group
      events.push(createEvent(
        eventId++,
        'Painting Workshop',
        day,
        10,
        1.25,
        generateId('room', 2),
        18,
        [generateId('group', 4)], // Girls Power
        mockColors[5].id,
        undefined,
        generateId('program', 2),
        generateId('activity', 6)
      ));
      // Basketball - Mixed groups
      events.push(createEvent(
        eventId++,
        'Basketball',
        day,
        10,
        1.5,
        generateId('room', 9),
        20,
        getGroups(2, groupOffset + 2),
        mockColors[3].id,
        undefined,
        generateId('program', 6),
        generateId('activity', 22)
      ));
      // Coding Basics - Junior and Middle Age
      events.push(createEvent(
        eventId++,
        'Coding Basics',
        day,
        10,
        1.5,
        generateId('room', 5),
        15,
        [generateId('group', 1), generateId('group', 3)],
        mockColors[2].id,
        undefined,
        generateId('program', 9),
        generateId('activity', 31)
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
        12,
        [generateId('group', 2)], // Senior Campers
        mockColors[2].id,
        ['Climbing Instructor', 'First Aid'],
        generateId('program', 3),
        generateId('activity', 9)
      ));
      // Archery - Multiple groups
      events.push(createEvent(
        eventId++,
        'Archery',
        day,
        10,
        1,
        generateId('room', 7),
        15,
        [generateId('group', 3), generateId('family', 1 + (groupOffset % 24))],
        mockColors[2].id,
        ['Archery Instructor'],
        generateId('program', 3),
        generateId('activity', 10)
      ));
      // Music Jam Session - Family groups
      events.push(createEvent(
        eventId++,
        'Music Jam Session',
        day,
        10,
        1,
        generateId('room', 8),
        15,
        getGroups(2, groupOffset + 3),
        mockColors[4].id,
        undefined,
        generateId('program', 4),
        generateId('activity', 14)
      ));
      // Baking Class - Allergy-Aware Group with some exclusions
      const excludedCampers = day === startDay ? [generateId('camper', 1), generateId('camper', 15)] : undefined;
      events.push(createEvent(
        eventId++,
        'Baking Class',
        day,
        10,
        1.5,
        generateId('room', 6),
        12,
        [generateId('group', 5)], // Allergy-Aware Group
        mockColors[6].id,
        undefined,
        generateId('program', 8),
        generateId('activity', 28),
        undefined,
        excludedCampers
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
        getGroups(3, groupOffset),
        mockColors[3].id,
        undefined,
        generateId('program', 6),
        generateId('activity', 21)
      ));
      // Yoga - Large mixed group
      events.push(createEvent(
        eventId++,
        'Yoga',
        day,
        10,
        1,
        generateId('room', 1),
        25,
        getGroups(4, groupOffset + 1),
        mockColors[4].id,
        undefined,
        generateId('program', 10),
        generateId('activity', 34)
      ));
      // Tie-Dye - Girls Power
      events.push(createEvent(
        eventId++,
        'Tie-Dye',
        day,
        10,
        1.5,
        generateId('room', 2),
        20,
        [generateId('group', 4)], // Girls Power
        mockColors[5].id,
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
      getGroups(10, groupOffset), // All groups
      mockColors[0].id,
    ));
    
    // Afternoon Activities Block 1 (2:00-4:00) - Multiple concurrent activities
    if (dayMod === 0 || dayMod === 2 || dayMod === 4) {
      // Wakeboarding from Watersports Program - Senior Campers
      events.push(createEvent(
        eventId++,
        'Wakeboarding',
        day,
        14,
        2,
        generateId('room', 5),
        8,
        [generateId('group', 2)], // Senior Campers
        mockColors[0].id,
        ['Lifeguard', 'Boat Driver'],
        generateId('program', 1),
        generateId('activity', 1)
      ));
      // Music Class - Family groups
      events.push(createEvent(
        eventId++,
        'Music Class',
        day,
        14,
        1,
        generateId('room', 8),
        15,
        getGroups(2, groupOffset + 4),
        mockColors[3].id,
      ));
    } else if (dayMod === 1 || dayMod === 3) {
      // Painting Workshop from Arts & Crafts Program - Girls Power
      events.push(createEvent(
        eventId++,
        'Painting Workshop',
        day,
        14,
        1.25,
        generateId('room', 9),
        15,
        [generateId('group', 4)], // Girls Power
        mockColors[5].id,
        undefined,
        generateId('program', 2),
        generateId('activity', 5)
      ));
      // Basketball - Mixed groups
      events.push(createEvent(
        eventId++,
        'Basketball',
        day,
        14,
        1.5,
        generateId('room', 3),
        20,
        getGroups(2, groupOffset + 5),
        mockColors[6].id,
      ));
    } else {
      // Kayaking from Watersports Program - Multiple family groups
      events.push(createEvent(
        eventId++,
        'Kayaking',
        day,
        14,
        1.5,
        generateId('room', 5),
        10,
        [generateId('family', 1 + (groupOffset % 24)), generateId('family', 1 + ((groupOffset + 2) % 24))],
        mockColors[0].id,
        ['Lifeguard'],
        generateId('program', 1),
        generateId('activity', 3)
      ));
    }
    
    // Afternoon Activities Block 2 (4:00-5:30)
    if (dayMod % 2 === 0) {
      // Archery from Adventure Sports Program - Middle Age with staff exclusion on first day
      const excludedStaff = day === startDay ? [generateId('staff', 2)] : undefined;
      events.push(createEvent(
        eventId++,
        'Archery',
        day,
        16,
        1.5,
        generateId('room', 7),
        12,
        [generateId('group', 3), generateId('family', 1 + (groupOffset % 24))],
        mockColors[2].id,
        ['Archery Instructor'],
        generateId('program', 3),
        generateId('activity', 8),
        excludedStaff
      ));
      
      // Jewelry Making from Arts & Crafts Program - Girls Power
      events.push(createEvent(
        eventId++,
        'Jewelry Making',
        day,
        16,
        1,
        generateId('room', 9),
        12,
        [generateId('group', 4)], // Girls Power
        mockColors[5].id,
        undefined,
        generateId('program', 2),
        generateId('activity', 6)
      ));
    } else {
      // Basketball - Mixed groups
      events.push(createEvent(
        eventId++,
        'Basketball',
        day,
        16,
        1.5,
        generateId('room', 3),
        20,
        getGroups(3, groupOffset + 6),
        mockColors[6].id,
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
      getGroups(10, groupOffset + 1), // All groups
      mockColors[0].id,
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
        getGroups(7, groupOffset + 7),
        mockColors[3].id,
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
        getGroups(6, groupOffset + 8),
        mockColors[4].id,
      ));
    } else if (dayMod === 4) {
      const movieNightGroups = getGroups(7, groupOffset + 9);
      events.push(createEvent(
        eventId++,
        'Movie Night',
        day,
        19.5,
        2,
        generateId('room', 1),
        150,
        movieNightGroups,
        mockColors[4].id,
      ));
      // Intentionally create ONE conflict for demonstration - overlap on day 7
      if (day === startDay + 7) {
        events.push(createEvent(
          eventId++,
          'Game Night',
          day,
          20,
          1.5,
          generateId('room', 8),
          40,
          [movieNightGroups[0], movieNightGroups[1]], // Same groups as Movie Night - creates conflict!
          mockColors[4].id,
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
        getGroups(8, groupOffset + 10),
        mockColors[0].id,
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
    colorId: generateId('color', 2), // Forest Green
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
    colorId: generateId('color', 8), // Indigo Night
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
    colorId: generateId('color', 3), // Sunset Orange
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
    colorId: generateId('color', 5), // Flamingo Pink
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
    colorId: generateId('color', 6), // Fire Red
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
    colorId: generateId('color', 1), // Ocean Blue
    activityIds: [],
    staffMemberIds: ['staff-008', 'staff-010', 'staff-012', 'staff-016', 'staff-020'],
    locationIds: ['room-004', 'room-010'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 2),
    name: 'Arts & Crafts',
    description: 'Creative activities including pottery, painting, and jewelry making',
    colorId: generateId('color', 5), // Flamingo Pink
    activityIds: [],
    staffMemberIds: ['staff-014', 'staff-018', 'staff-022'],
    locationIds: ['room-002', 'room-008'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 3),
    name: 'Adventure Sports',
    description: 'High-energy outdoor activities including rock climbing, archery, and ropes course',
    colorId: generateId('color', 2), // Forest Green
    activityIds: [],
    staffMemberIds: ['staff-009', 'staff-011', 'staff-015', 'staff-019'],
    locationIds: ['room-003', 'room-007'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 4),
    name: 'Performing Arts',
    description: 'Theater, music, dance, and performance activities',
    colorId: generateId('color', 4), // Royal Purple
    activityIds: [],
    staffMemberIds: ['staff-013', 'staff-017', 'staff-024'],
    locationIds: ['room-008', 'room-010'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 5),
    name: 'Science & Nature',
    description: 'Outdoor education, biology, astronomy, and environmental science',
    colorId: generateId('color', 7), // Teal Wave
    activityIds: [],
    staffMemberIds: ['staff-021', 'staff-025', 'staff-029'],
    locationIds: ['room-005', 'room-007'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 6),
    name: 'Team Sports',
    description: 'Soccer, basketball, volleyball, and other team-based sports',
    colorId: generateId('color', 3), // Sunset Orange
    activityIds: [],
    staffMemberIds: ['staff-026', 'staff-030', 'staff-034'],
    locationIds: ['room-003', 'room-009'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 7),
    name: 'Leadership Development',
    description: 'Team building, leadership skills, and communication workshops',
    colorId: generateId('color', 8), // Indigo Night
    activityIds: [],
    staffMemberIds: ['staff-027', 'staff-031', 'staff-035'],
    locationIds: ['room-001', 'room-005'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 8),
    name: 'Cooking & Culinary',
    description: 'Baking, cooking classes, and food science',
    colorId: generateId('color', 6), // Fire Red
    activityIds: [],
    staffMemberIds: ['staff-028', 'staff-032'],
    locationIds: ['room-006'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 9),
    name: 'Technology & Gaming',
    description: 'Coding, robotics, video production, and board games',
    colorId: generateId('color', 7), // Teal Wave
    activityIds: [],
    staffMemberIds: ['staff-033', 'staff-037', 'staff-041'],
    locationIds: ['room-005'],
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('program', 10),
    name: 'Wellness & Mindfulness',
    description: 'Yoga, meditation, fitness, and mental health activities',
    colorId: generateId('color', 4), // Royal Purple
    activityIds: [],
    staffMemberIds: ['staff-036', 'staff-040', 'staff-044'],
    locationIds: ['room-001', 'room-007'],
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
    defaultLocationId: 'room-004',
    requiredCertifications: ['Lifeguard', 'Boat Driver'],
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 8,
    colorId: generateId('color', 1), // Ocean Blue
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 2),
    name: 'Swimming Lessons',
    description: 'Structured swimming instruction for all skill levels',
    programIds: [generateId('program', 1)],
    durationMinutes: 60,
    defaultLocationId: 'room-004',
    requiredCertifications: ['Lifeguard', 'Swimming Instructor'],
    minStaff: 2,
    maxStaff: 2,
    defaultCapacity: 12,
    colorId: generateId('color', 1), // Ocean Blue
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 3),
    name: 'Kayaking',
    description: 'Explore the lake in kayaks with guided instruction',
    programIds: [generateId('program', 1)],
    durationMinutes: 90,
    defaultLocationId: 'room-004',
    requiredCertifications: ['Lifeguard'],
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 10,
    colorId: generateId('color', 1), // Ocean Blue
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 4),
    name: 'Stand-Up Paddleboarding',
    description: 'Balance and paddle on stand-up paddleboards',
    programIds: [generateId('program', 1)],
    durationMinutes: 75,
    defaultLocationId: 'room-004',
    requiredCertifications: ['Lifeguard'],
    minStaff: 2,
    maxStaff: 2,
    defaultCapacity: 10,
    colorId: generateId('color', 1), // Ocean Blue
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
    defaultLocationId: 'room-002',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 10,
    colorId: generateId('color', 5), // Flamingo Pink
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 6),
    name: 'Painting Workshop',
    description: 'Express yourself through various painting techniques',
    programIds: [generateId('program', 2)],
    durationMinutes: 75,
    defaultLocationId: 'room-002',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 15,
    colorId: generateId('color', 5), // Flamingo Pink
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 7),
    name: 'Jewelry Making',
    description: 'Design and create your own jewelry pieces',
    programIds: [generateId('program', 2)],
    durationMinutes: 60,
    defaultLocationId: 'room-002',
    minStaff: 1,
    maxStaff: 1,
    defaultCapacity: 12,
    colorId: generateId('color', 5), // Flamingo Pink
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 8),
    name: 'Tie-Dye',
    description: 'Create colorful tie-dye shirts and accessories',
    programIds: [generateId('program', 2)],
    durationMinutes: 90,
    defaultLocationId: 'room-002',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 20,
    colorId: generateId('color', 5), // Flamingo Pink
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
    defaultLocationId: 'room-003',
    requiredCertifications: ['Climbing Instructor', 'First Aid'],
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 10,
    colorId: generateId('color', 2), // Forest Green
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 10),
    name: 'Archery',
    description: 'Learn archery basics and target practice',
    programIds: [generateId('program', 3)],
    durationMinutes: 60,
    defaultLocationId: 'room-007',
    requiredCertifications: ['Archery Instructor'],
    minStaff: 2,
    maxStaff: 2,
    defaultCapacity: 12,
    colorId: generateId('color', 2), // Forest Green
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 11),
    name: 'Ropes Course',
    description: 'Challenge yourself on our high ropes course',
    programIds: [generateId('program', 3)],
    durationMinutes: 120,
    defaultLocationId: 'room-007',
    requiredCertifications: ['Ropes Course Instructor', 'First Aid'],
    minStaff: 3,
    maxStaff: 4,
    defaultCapacity: 8,
    colorId: generateId('color', 2), // Forest Green
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 12),
    name: 'Orienteering',
    description: 'Navigation and map reading in the wilderness',
    programIds: [generateId('program', 3)],
    durationMinutes: 120,
    defaultLocationId: 'room-007',
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 15,
    colorId: generateId('color', 2), // Forest Green
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
    defaultLocationId: 'room-010',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 20,
    colorId: generateId('color', 4), // Royal Purple
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 14),
    name: 'Music Jam Session',
    description: 'Play instruments and create music together',
    programIds: [generateId('program', 4)],
    durationMinutes: 60,
    defaultLocationId: 'room-008',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 15,
    colorId: generateId('color', 4), // Royal Purple
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 15),
    name: 'Dance Class',
    description: 'Learn various dance styles and choreography',
    programIds: [generateId('program', 4)],
    durationMinutes: 75,
    defaultLocationId: 'room-001',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 25,
    colorId: generateId('color', 4), // Royal Purple
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 16),
    name: 'Improv Comedy',
    description: 'Quick thinking and comedy improvisation',
    programIds: [generateId('program', 4)],
    durationMinutes: 60,
    defaultLocationId: 'room-010',
    minStaff: 1,
    maxStaff: 1,
    defaultCapacity: 18,
    colorId: generateId('color', 4), // Royal Purple
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
    defaultLocationId: 'room-007',
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 20,
    colorId: generateId('color', 7), // Teal Wave
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 18),
    name: 'Stargazing',
    description: 'Learn about constellations and astronomy',
    programIds: [generateId('program', 5)],
    durationMinutes: 90,
    defaultLocationId: 'room-007',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 30,
    colorId: generateId('color', 7), // Teal Wave
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 19),
    name: 'Biology Lab',
    description: 'Hands-on experiments and microscope work',
    programIds: [generateId('program', 5)],
    durationMinutes: 75,
    defaultLocationId: 'room-005',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 15,
    colorId: generateId('color', 7), // Teal Wave
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 20),
    name: 'Gardening',
    description: 'Learn about plants and sustainable gardening',
    programIds: [generateId('program', 5)],
    durationMinutes: 60,
    defaultLocationId: 'room-007',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 12,
    colorId: generateId('color', 7), // Teal Wave
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
    defaultLocationId: 'room-003',
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 22,
    colorId: generateId('color', 3), // Sunset Orange
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 22),
    name: 'Basketball',
    description: 'Basketball drills and games',
    programIds: [generateId('program', 6)],
    durationMinutes: 90,
    defaultLocationId: 'room-009',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 20,
    colorId: generateId('color', 3), // Sunset Orange
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 23),
    name: 'Volleyball',
    description: 'Volleyball techniques and matches',
    programIds: [generateId('program', 6)],
    durationMinutes: 75,
    defaultLocationId: 'room-003',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 16,
    colorId: generateId('color', 3), // Sunset Orange
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 24),
    name: 'Ultimate Frisbee',
    description: 'Fast-paced team frisbee games',
    programIds: [generateId('program', 6)],
    durationMinutes: 60,
    defaultLocationId: 'room-003',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 20,
    colorId: generateId('color', 3), // Sunset Orange
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
    defaultLocationId: 'room-007',
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 25,
    colorId: generateId('color', 8), // Indigo Night
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 26),
    name: 'Public Speaking',
    description: 'Develop confidence and presentation skills',
    programIds: [generateId('program', 7)],
    durationMinutes: 60,
    defaultLocationId: 'room-005',
    minStaff: 1,
    maxStaff: 1,
    defaultCapacity: 15,
    colorId: generateId('color', 8), // Indigo Night
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 27),
    name: 'Conflict Resolution',
    description: 'Learn mediation and problem-solving skills',
    programIds: [generateId('program', 7)],
    durationMinutes: 75,
    defaultLocationId: 'room-005',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 20,
    colorId: generateId('color', 8), // Indigo Night
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
    defaultLocationId: 'room-006',
    minStaff: 2,
    maxStaff: 2,
    defaultCapacity: 12,
    colorId: generateId('color', 6), // Fire Red
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 29),
    name: 'Cooking Workshop',
    description: 'Prepare healthy meals and learn kitchen safety',
    programIds: [generateId('program', 8)],
    durationMinutes: 120,
    defaultLocationId: 'room-006',
    minStaff: 2,
    maxStaff: 3,
    defaultCapacity: 15,
    colorId: generateId('color', 6), // Fire Red
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 30),
    name: 'Food Science',
    description: 'Explore the chemistry of cooking',
    programIds: [generateId('program', 8)],
    durationMinutes: 75,
    defaultLocationId: 'room-006',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 12,
    colorId: generateId('color', 6), // Fire Red
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
    defaultLocationId: 'room-005',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 15,
    colorId: generateId('color', 7), // Teal Wave
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 32),
    name: 'Robotics',
    description: 'Build and program simple robots',
    programIds: [generateId('program', 9)],
    durationMinutes: 120,
    defaultLocationId: 'room-005',
    minStaff: 2,
    maxStaff: 2,
    defaultCapacity: 12,
    colorId: generateId('color', 7), // Teal Wave
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 33),
    name: 'Board Game Tournament',
    description: 'Strategic board games and tournaments',
    programIds: [generateId('program', 9)],
    durationMinutes: 90,
    defaultLocationId: 'room-001',
    minStaff: 1,
    maxStaff: 2,
    defaultCapacity: 20,
    colorId: generateId('color', 7), // Teal Wave
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
    defaultLocationId: 'room-001',
    minStaff: 1,
    maxStaff: 1,
    defaultCapacity: 25,
    colorId: generateId('color', 4), // Royal Purple
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
  {
    id: generateId('activity', 35),
    name: 'Meditation & Mindfulness',
    description: 'Breathing exercises and guided meditation',
    programIds: [generateId('program', 10)],
    durationMinutes: 45,
    defaultLocationId: 'room-007',
    minStaff: 1,
    maxStaff: 1,
    defaultCapacity: 30,
    colorId: generateId('color', 4), // Royal Purple
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 1).toISOString(),
  },
];

// Labels - Define tags for categorizing entities
export const mockLabels: Label[] = [
  {
    id: generateId('label', 1),
    name: 'VIP',
    description: 'VIP campers requiring special attention',
    colorId: generateId('color', 4), // Royal Purple
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('label', 2),
    name: 'First Timer',
    description: 'New campers attending for the first time',
    colorId: generateId('color', 1), // Ocean Blue
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('label', 3),
    name: 'Advanced',
    description: 'Advanced skill level participants',
    colorId: generateId('color', 2), // Forest Green
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('label', 4),
    name: 'Beginner',
    description: 'Beginner skill level participants',
    colorId: generateId('color', 3), // Sunset Orange
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('label', 5),
    name: 'Leadership',
    description: 'Leadership program participants',
    colorId: generateId('color', 6), // Fire Red
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('label', 6),
    name: 'Special Needs',
    description: 'Participants requiring special accommodations',
    colorId: generateId('color', 5), // Flamingo Pink
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('label', 7),
    name: 'Outdoor Focus',
    description: 'Programs and activities focused on outdoor experiences',
    colorId: generateId('color', 2), // Forest Green
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('label', 8),
    name: 'Indoor Focus',
    description: 'Programs and activities focused on indoor experiences',
    colorId: generateId('color', 8), // Indigo Night
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('label', 9),
    name: 'High Energy',
    description: 'Activities with high physical activity levels',
    colorId: generateId('color', 3), // Sunset Orange
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
  },
  {
    id: generateId('label', 10),
    name: 'Creative',
    description: 'Creative arts and crafts focused',
    colorId: generateId('color', 5), // Flamingo Pink
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2024, 0, 1).toISOString(),
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
  colors: mockColors,
  sessions: mockSessions,
  labels: mockLabels,
};
