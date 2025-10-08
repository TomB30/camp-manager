import type { Child, TeamMember, Room, SleepingRoom, Event } from '@/types/api';

// Generate consistent IDs
const generateId = (prefix: string, index: number) => `${prefix}-${String(index).padStart(3, '0')}`;

// Extended sleeping rooms for more children
export const mockSleepingRooms: SleepingRoom[] = [
  {
    id: generateId('sleeping', 1),
    name: 'Cabin 1 - Eagles',
    capacity: 8,
    gender: 'boys',
    building: 'North Wing',
    floor: 1,
    amenities: ['Bathroom', 'Closet', 'Window'],
    supervisorId: generateId('staff', 2),
  },
  {
    id: generateId('sleeping', 2),
    name: 'Cabin 2 - Hawks',
    capacity: 8,
    gender: 'boys',
    building: 'North Wing',
    floor: 1,
    amenities: ['Bathroom', 'Closet', 'Window'],
    supervisorId: generateId('staff', 6),
  },
  {
    id: generateId('sleeping', 3),
    name: 'Cabin 3 - Wolves',
    capacity: 8,
    gender: 'boys',
    building: 'North Wing',
    floor: 2,
    amenities: ['Bathroom', 'Closet', 'Window', 'Balcony'],
    supervisorId: generateId('staff', 8),
  },
  {
    id: generateId('sleeping', 4),
    name: 'Cabin 4 - Butterflies',
    capacity: 8,
    gender: 'girls',
    building: 'South Wing',
    floor: 1,
    amenities: ['Bathroom', 'Closet', 'Window', 'Mirror'],
    supervisorId: generateId('staff', 3),
  },
  {
    id: generateId('sleeping', 5),
    name: 'Cabin 5 - Fireflies',
    capacity: 8,
    gender: 'girls',
    building: 'South Wing',
    floor: 1,
    amenities: ['Bathroom', 'Closet', 'Window', 'Mirror'],
    supervisorId: generateId('staff', 4),
  },
  {
    id: generateId('sleeping', 6),
    name: 'Cabin 6 - Dolphins',
    capacity: 8,
    gender: 'girls',
    building: 'South Wing',
    floor: 2,
    amenities: ['Bathroom', 'Closet', 'Window', 'Mirror', 'Balcony'],
    supervisorId: generateId('staff', 7),
  },
];

// Generate many children
const firstNames = {
  male: ['Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan', 'Jackson', 'Levi', 'Sebastian', 'Mateo', 'Jack', 'Owen', 'Theodore', 'Aiden', 'Samuel', 'Joseph', 'John', 'David', 'Wyatt', 'Matthew'],
  female: ['Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Emily', 'Elizabeth', 'Mila', 'Ella', 'Avery', 'Sofia', 'Camila', 'Aria', 'Scarlett', 'Victoria', 'Madison', 'Luna', 'Grace', 'Chloe', 'Penelope', 'Layla', 'Riley', 'Zoey', 'Nora']
};

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

const allergies = ['Peanuts', 'Tree nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'];

const generateChildren = (count: number): Child[] => {
  const children: Child[] = [];
  let maleCount = 0;
  let femaleCount = 0;
  
  for (let i = 1; i <= count; i++) {
    const gender: 'male' | 'female' = i % 2 === 0 ? 'male' : 'female';
    const genderNames = firstNames[gender];
    const nameIndex = gender === 'male' ? maleCount++ : femaleCount++;
    const firstName = genderNames[nameIndex % genderNames.length];
    const lastName = lastNames[(i - 1) % lastNames.length];
    const age = 6 + (i % 10); // Ages 6-15
    
    // Assign to sleeping rooms (8 per room, 3 boys rooms, 3 girls rooms)
    const roomsForGender = 3;
    const roomOffset = gender === 'male' ? 1 : 4;
    const roomNumber = roomOffset + Math.floor((nameIndex) / 8) % roomsForGender;
    
    // 25% chance of having an allergy
    const hasAllergy = Math.random() < 0.25;
    const childAllergies = hasAllergy ? [allergies[i % allergies.length]] : [];
    
    children.push({
      id: generateId('child', i),
      firstName,
      lastName,
      age,
      gender,
      parentContact: `parent${i}@example.com`,
      allergies: childAllergies,
      medicalNotes: hasAllergy ? `Please avoid ${childAllergies[0]}` : undefined,
      sleepingRoomId: generateId('sleeping', roomNumber),
      registrationDate: new Date(2025, 5, 1 + (i % 7)).toISOString(),
    });
  }
  
  return children;
};

export const mockChildren: Child[] = generateChildren(48);

export const mockTeamMembers: TeamMember[] = [
  {
    id: generateId('staff', 1),
    firstName: 'Sarah',
    lastName: 'Connor',
    role: 'director',
    email: 'sarah.connor@camp.com',
    phone: '555-0101',
    certifications: ['First Aid', 'CPR', 'Wilderness First Aid'],
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
    equipment: ['Projector', 'Sound System', 'Tables', 'Chairs'],
  },
  {
    id: generateId('room', 2),
    name: 'Art Studio',
    capacity: 15,
    type: 'arts',
    location: 'Building B',
    equipment: ['Easels', 'Paint Supplies', 'Clay', 'Kiln'],
  },
  {
    id: generateId('room', 3),
    name: 'Sports Field',
    capacity: 30,
    type: 'sports',
    location: 'Outdoor Area 1',
    equipment: ['Soccer Goals', 'Cones', 'Balls'],
  },
  {
    id: generateId('room', 4),
    name: 'Swimming Pool',
    capacity: 20,
    type: 'sports',
    location: 'Recreation Center',
    equipment: ['Pool Noodles', 'Kickboards', 'Life Vests'],
  },
  {
    id: generateId('room', 5),
    name: 'Classroom A',
    capacity: 20,
    type: 'classroom',
    location: 'Building C',
    equipment: ['Whiteboard', 'Desks', 'Books', 'Computers'],
  },
  {
    id: generateId('room', 6),
    name: 'Dining Hall',
    capacity: 60,
    type: 'dining',
    location: 'Building C',
    equipment: ['Tables', 'Benches', 'Kitchen Access'],
  },
  {
    id: generateId('room', 7),
    name: 'Outdoor Plaza',
    capacity: 40,
    type: 'outdoor',
    location: 'Central Campus',
    equipment: ['Picnic Tables', 'Shade Structures', 'Water Fountain'],
  },
  {
    id: generateId('room', 8),
    name: 'Music Room',
    capacity: 15,
    type: 'arts',
    location: 'Building B',
    equipment: ['Piano', 'Guitars', 'Drums', 'Microphones'],
  },
  {
    id: generateId('room', 9),
    name: 'Basketball Court',
    capacity: 20,
    type: 'sports',
    location: 'Outdoor Area 2',
    equipment: ['Basketballs', 'Scoreboard', 'Benches'],
  },
  {
    id: generateId('room', 10),
    name: 'Theater Stage',
    capacity: 25,
    type: 'arts',
    location: 'Building A',
    equipment: ['Stage', 'Costumes', 'Props', 'Lighting'],
  },
];

// Helper to create events for the week
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
  childrenIds: string[],
  color: string,
  requiredCerts?: string[]
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
    enrolledChildrenIds: childrenIds,
    color,
    requiredCertifications: requiredCerts,
  };
};

// Generate a full week of varied events
const generateWeekEvents = (): Event[] => {
  const events: Event[] = [];
  let eventId = 1;
  
  // Helper to get random children
  const getRandomChildren = (count: number, startIdx: number = 0) => {
    const children = [];
    for (let i = 0; i < count; i++) {
      children.push(generateId('child', startIdx + i + 1));
    }
    return children;
  };
  
  // Days of the week (0 = today through 6 = next week)
  for (let day = 0; day < 7; day++) {
    const childOffset = (day * 8) % 40;
    
    // Morning Assembly (9:00-9:30) - Everyone
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
      getRandomChildren(30, childOffset),
      '#6366F1',
    ));
    
    // Morning Activities Block 1 (10:00-12:00)
    events.push(createEvent(
      eventId++,
      'Arts & Crafts',
      day,
      10,
      2,
      generateId('room', 2),
      15,
      'activity',
      [generateId('staff', 3)],
      getRandomChildren(12, childOffset),
      '#A855F7',
    ));
    
    events.push(createEvent(
      eventId++,
      'Soccer Practice',
      day,
      10,
      2,
      generateId('room', 3),
      20,
      'sports',
      [generateId('staff', 6), generateId('staff', 8)],
      getRandomChildren(18, childOffset + 12),
      '#10B981',
    ));
    
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
      getRandomChildren(40, childOffset),
      '#64748B',
    ));
    
    // Afternoon Activities Block 1 (2:00-3:30)
    events.push(createEvent(
      eventId++,
      'Swimming',
      day,
      14,
      1.5,
      generateId('room', 4),
      20,
      'sports',
      [generateId('staff', 4)],
      getRandomChildren(18, childOffset),
      '#06B6D4',
      ['Lifeguard']
    ));
    
    events.push(createEvent(
      eventId++,
      'Music Class',
      day,
      14,
      1.5,
      generateId('room', 8),
      15,
      'activity',
      [generateId('staff', 3)],
      getRandomChildren(12, childOffset + 18),
      '#F59E0B',
    ));
    
    // Afternoon Activities Block 2 (4:00-5:30)
    if (day % 2 === 0) {
      events.push(createEvent(
        eventId++,
        'Basketball',
        day,
        16,
        1.5,
        generateId('room', 9),
        20,
        'sports',
        [generateId('staff', 6)],
        getRandomChildren(16, childOffset),
        '#EF4444',
      ));
      
      events.push(createEvent(
        eventId++,
        'Drama Club',
        day,
        16,
        1.5,
        generateId('room', 10),
        20,
        'activity',
        [generateId('staff', 7)],
        getRandomChildren(14, childOffset + 16),
        '#EC4899',
      ));
    } else {
      events.push(createEvent(
        eventId++,
        'Nature Hike',
        day,
        16,
        1.5,
        generateId('room', 7),
        30,
        'activity',
        [generateId('staff', 8), generateId('staff', 2)],
        getRandomChildren(25, childOffset),
        '#84CC16',
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
      getRandomChildren(40, childOffset),
      '#64748B',
    ));
    
    // Evening Activity (7:30-8:30)
    if (day === 2 || day === 5) {
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
        getRandomChildren(35, childOffset),
        '#F97316',
      ));
    } else if (day === 6) {
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
        getRandomChildren(20, childOffset),
        '#8B5CF6',
      ));
    }
  }
  
  return events;
};

export const mockEvents: Event[] = generateWeekEvents();

// Export all mock data together for easy import
export const mockData = {
  children: mockChildren,
  teamMembers: mockTeamMembers,
  rooms: mockRooms,
  sleepingRooms: mockSleepingRooms,
  events: mockEvents,
};
