import type { Camper, StaffMember, Room, SleepingRoom, Event, CamperGroup, FamilyGroup, Program, Activity } from '@/types/api';

const STORAGE_KEYS = {
  CAMPERS: 'camp_campers',
  STAFF_MEMBERS: 'camp_staff_members',
  ROOMS: 'camp_rooms',
  SLEEPING_ROOMS: 'camp_sleeping_rooms',
  EVENTS: 'camp_events',
  CAMPER_GROUPS: 'camp_camper_groups',
  FAMILY_GROUPS: 'camp_family_groups',
  PROGRAMS: 'camp_programs',
  ACTIVITIES: 'camp_activities',
} as const;

// Simulate async operations to match future API
const delay = (ms: number = 50) => new Promise(resolve => setTimeout(resolve, ms));

class StorageService {
  // Campers operations
  async getCampers(): Promise<Camper[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.CAMPERS);
    return data ? JSON.parse(data) : [];
  }

  async getCamper(id: string): Promise<Camper | null> {
    await delay();
    const campers = await this.getCampers();
    return campers.find(c => c.id === id) || null;
  }

  async saveCamper(camper: Camper): Promise<Camper> {
    await delay();
    const campers = await this.getCampers();
    const index = campers.findIndex(c => c.id === camper.id);
    
    if (index >= 0) {
      campers[index] = camper;
    } else {
      campers.push(camper);
    }
    
    localStorage.setItem(STORAGE_KEYS.CAMPERS, JSON.stringify(campers));
    return camper;
  }

  async deleteCamper(id: string): Promise<void> {
    await delay();
    const campers = await this.getCampers();
    const filtered = campers.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CAMPERS, JSON.stringify(filtered));
    
    // Also remove from all events
    const events = await this.getEvents();
    const updatedEvents = events.map(event => ({
      ...event,
      enrolledCamperIds: event.enrolledCamperIds?.filter(camperId => camperId !== id) || [],
    }));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
  }

  // Staff Members operations
  async getStaffMembers(): Promise<StaffMember[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.STAFF_MEMBERS);
    return data ? JSON.parse(data) : [];
  }

  async getStaffMember(id: string): Promise<StaffMember | null> {
    await delay();
    const members = await this.getStaffMembers();
    return members.find(m => m.id === id) || null;
  }

  async saveStaffMember(member: StaffMember): Promise<StaffMember> {
    await delay();
    const members = await this.getStaffMembers();
    const index = members.findIndex(m => m.id === member.id);
    
    if (index >= 0) {
      members[index] = member;
    } else {
      members.push(member);
    }
    
    localStorage.setItem(STORAGE_KEYS.STAFF_MEMBERS, JSON.stringify(members));
    return member;
  }

  async deleteStaffMember(id: string): Promise<void> {
    await delay();
    const members = await this.getStaffMembers();
    const filtered = members.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.STAFF_MEMBERS, JSON.stringify(filtered));
    
    // Also remove from all events
    const events = await this.getEvents();
    const updatedEvents = events.map(event => ({
      ...event,
      assignedStaffIds: event.assignedStaffIds?.filter(staffId => staffId !== id) || [],
    }));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
  }

  // Rooms operations
  async getRooms(): Promise<Room[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return data ? JSON.parse(data) : [];
  }

  async getRoom(id: string): Promise<Room | null> {
    await delay();
    const rooms = await this.getRooms();
    return rooms.find(r => r.id === id) || null;
  }

  async saveRoom(room: Room): Promise<Room> {
    await delay();
    const rooms = await this.getRooms();
    const index = rooms.findIndex(r => r.id === room.id);
    
    if (index >= 0) {
      rooms[index] = room;
    } else {
      rooms.push(room);
    }
    
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    return room;
  }

  async deleteRoom(id: string): Promise<void> {
    await delay();
    const rooms = await this.getRooms();
    const filtered = rooms.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(filtered));
  }

  // Sleeping Rooms operations
  async getSleepingRooms(): Promise<SleepingRoom[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.SLEEPING_ROOMS);
    return data ? JSON.parse(data) : [];
  }

  async getSleepingRoom(id: string): Promise<SleepingRoom | null> {
    await delay();
    const rooms = await this.getSleepingRooms();
    return rooms.find(r => r.id === id) || null;
  }

  async saveSleepingRoom(room: SleepingRoom): Promise<SleepingRoom> {
    await delay();
    const rooms = await this.getSleepingRooms();
    const index = rooms.findIndex(r => r.id === room.id);
    
    if (index >= 0) {
      rooms[index] = room;
    } else {
      rooms.push(room);
    }
    
    localStorage.setItem(STORAGE_KEYS.SLEEPING_ROOMS, JSON.stringify(rooms));
    return room;
  }

  async deleteSleepingRoom(id: string): Promise<void> {
    await delay();
    const rooms = await this.getSleepingRooms();
    const filtered = rooms.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.SLEEPING_ROOMS, JSON.stringify(filtered));
  }

  // Events operations
  async getEvents(startDate?: Date, endDate?: Date): Promise<Event[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    let events: Event[] = data ? JSON.parse(data) : [];
    
    if (startDate || endDate) {
      events = events.filter(event => {
        const eventStart = new Date(event.startTime);
        if (startDate && eventStart < startDate) return false;
        if (endDate && eventStart > endDate) return false;
        return true;
      });
    }
    
    return events;
  }

  async getEvent(id: string): Promise<Event | null> {
    await delay();
    const events = await this.getEvents();
    return events.find(e => e.id === id) || null;
  }

  async saveEvent(event: Event): Promise<Event> {
    await delay();
    const events = await this.getEvents();
    const index = events.findIndex(e => e.id === event.id);
    
    if (index >= 0) {
      events[index] = event;
    } else {
      events.push(event);
    }
    
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    return event;
  }

  async deleteEvent(id: string): Promise<void> {
    await delay();
    const events = await this.getEvents();
    const filtered = events.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(filtered));
  }

  async enrollCamper(eventId: string, camperId: string): Promise<void> {
    await delay();
    const event = await this.getEvent(eventId);
    if (!event) throw new Error('Event not found');
    
    if (!event.enrolledCamperIds) {
      event.enrolledCamperIds = [];
    }
    
    if (!event.enrolledCamperIds.includes(camperId)) {
      event.enrolledCamperIds.push(camperId);
      await this.saveEvent(event);
    }
  }

  async unenrollCamper(eventId: string, camperId: string): Promise<void> {
    await delay();
    const event = await this.getEvent(eventId);
    if (!event) throw new Error('Event not found');
    
    event.enrolledCamperIds = event.enrolledCamperIds?.filter(id => id !== camperId) || [];
    await this.saveEvent(event);
  }

  // Camper Groups operations
  async getCamperGroups(): Promise<CamperGroup[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.CAMPER_GROUPS);
    return data ? JSON.parse(data) : [];
  }

  async getCamperGroup(id: string): Promise<CamperGroup | null> {
    await delay();
    const groups = await this.getCamperGroups();
    return groups.find(g => g.id === id) || null;
  }

  async saveCamperGroup(group: CamperGroup): Promise<CamperGroup> {
    await delay();
    const groups = await this.getCamperGroups();
    const index = groups.findIndex(g => g.id === group.id);
    
    if (index >= 0) {
      groups[index] = { ...group, updatedAt: new Date().toISOString() };
    } else {
      groups.push(group);
    }
    
    localStorage.setItem(STORAGE_KEYS.CAMPER_GROUPS, JSON.stringify(groups));
    return groups[index >= 0 ? index : groups.length - 1];
  }

  async deleteCamperGroup(id: string): Promise<void> {
    await delay();
    const groups = await this.getCamperGroups();
    const filtered = groups.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.CAMPER_GROUPS, JSON.stringify(filtered));
  }

  // Family Groups operations
  async getFamilyGroups(): Promise<FamilyGroup[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.FAMILY_GROUPS);
    return data ? JSON.parse(data) : [];
  }

  async getFamilyGroup(id: string): Promise<FamilyGroup | null> {
    await delay();
    const groups = await this.getFamilyGroups();
    return groups.find(g => g.id === id) || null;
  }

  async saveFamilyGroup(group: FamilyGroup): Promise<FamilyGroup> {
    await delay();
    const groups = await this.getFamilyGroups();
    const index = groups.findIndex(g => g.id === group.id);
    
    if (index >= 0) {
      groups[index] = { ...group, updatedAt: new Date().toISOString() };
    } else {
      groups.push(group);
    }
    
    localStorage.setItem(STORAGE_KEYS.FAMILY_GROUPS, JSON.stringify(groups));
    return groups[index >= 0 ? index : groups.length - 1];
  }

  async deleteFamilyGroup(id: string): Promise<void> {
    await delay();
    const groups = await this.getFamilyGroups();
    const filtered = groups.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.FAMILY_GROUPS, JSON.stringify(filtered));
  }

  // Programs operations
  async getPrograms(): Promise<Program[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
    return data ? JSON.parse(data) : [];
  }

  async getProgram(id: string): Promise<Program | null> {
    await delay();
    const programs = await this.getPrograms();
    return programs.find(p => p.id === id) || null;
  }

  async saveProgram(program: Program): Promise<Program> {
    await delay();
    const programs = await this.getPrograms();
    const index = programs.findIndex(p => p.id === program.id);
    
    if (index >= 0) {
      programs[index] = { ...program, updatedAt: new Date().toISOString() };
    } else {
      programs.push(program);
    }
    
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    return programs[index >= 0 ? index : programs.length - 1];
  }

  async deleteProgram(id: string): Promise<void> {
    await delay();
    const programs = await this.getPrograms();
    const filtered = programs.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(filtered));
    
    // Also delete all activities belonging to this program
    const activities = await this.getActivities();
    const filteredActivities = activities.filter(a => a.programId !== id);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(filteredActivities));
  }

  // Activities operations
  async getActivities(): Promise<Activity[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : [];
  }

  async getActivity(id: string): Promise<Activity | null> {
    await delay();
    const activities = await this.getActivities();
    return activities.find(a => a.id === id) || null;
  }

  async saveActivity(activity: Activity): Promise<Activity> {
    await delay();
    const activities = await this.getActivities();
    const index = activities.findIndex(a => a.id === activity.id);
    
    if (index >= 0) {
      activities[index] = { ...activity, updatedAt: new Date().toISOString() };
    } else {
      activities.push(activity);
    }
    
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    return activities[index >= 0 ? index : activities.length - 1];
  }

  async deleteActivity(id: string): Promise<void> {
    await delay();
    const activities = await this.getActivities();
    const filtered = activities.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(filtered));
  }

  // Utility methods
  async clearAll(): Promise<void> {
    await delay();
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  async seedData(data: {
    campers?: Camper[];
    staffMembers?: StaffMember[];
    rooms?: Room[];
    sleepingRooms?: SleepingRoom[];
    events?: Event[];
    camperGroups?: CamperGroup[];
    familyGroups?: FamilyGroup[];
    programs?: Program[];
    activities?: Activity[];
  }): Promise<void> {
    await delay();
    if (data.campers) {
      localStorage.setItem(STORAGE_KEYS.CAMPERS, JSON.stringify(data.campers));
    }
    if (data.staffMembers) {
      localStorage.setItem(STORAGE_KEYS.STAFF_MEMBERS, JSON.stringify(data.staffMembers));
    }
    if (data.rooms) {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(data.rooms));
    }
    if (data.sleepingRooms) {
      localStorage.setItem(STORAGE_KEYS.SLEEPING_ROOMS, JSON.stringify(data.sleepingRooms));
    }
    if (data.events) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events));
    }
    if (data.camperGroups) {
      localStorage.setItem(STORAGE_KEYS.CAMPER_GROUPS, JSON.stringify(data.camperGroups));
    }
    if (data.familyGroups) {
      localStorage.setItem(STORAGE_KEYS.FAMILY_GROUPS, JSON.stringify(data.familyGroups));
    }
    if (data.programs) {
      localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(data.programs));
    }
    if (data.activities) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(data.activities));
    }
  }
}

export const storageService = new StorageService();

