import type { Camper, StaffMember, Room, SleepingRoom, Event, CamperGroup, FamilyGroup, Program, Activity, Location, Certification, CampColor, CampSession } from '@/types/api';

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
  LOCATIONS: 'camp_locations',
  CERTIFICATIONS: 'camp_certifications',
  COLORS: 'camp_colors',
  SESSIONS: 'camp_sessions',
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
    
    // Remove program ID from all activities' programIds arrays
    // The store handles deleting activities that have no remaining programs
    const activities = await this.getActivities();
    const updatedActivities = activities.map(activity => {
      if (activity.programIds.includes(id)) {
        return {
          ...activity,
          programIds: activity.programIds.filter(pid => pid !== id)
        };
      }
      return activity;
    }).filter(activity => activity.programIds.length > 0); // Remove activities with no programs
    
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities));
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

  // Locations operations
  async getLocations(): Promise<Location[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    return data ? JSON.parse(data) : [];
  }

  async getLocation(id: string): Promise<Location | null> {
    await delay();
    const locations = await this.getLocations();
    return locations.find(l => l.id === id) || null;
  }

  async saveLocation(location: Location): Promise<Location> {
    await delay();
    const locations = await this.getLocations();
    const index = locations.findIndex(l => l.id === location.id);
    
    if (index >= 0) {
      locations[index] = { ...location, updatedAt: new Date().toISOString() };
    } else {
      locations.push(location);
    }
    
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    return locations[index >= 0 ? index : locations.length - 1];
  }

  async deleteLocation(id: string): Promise<void> {
    await delay();
    const locations = await this.getLocations();
    const filtered = locations.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(filtered));
  }

  // Certifications operations
  async getCertifications(): Promise<Certification[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATIONS);
    return data ? JSON.parse(data) : [];
  }

  async getCertification(id: string): Promise<Certification | null> {
    await delay();
    const certifications = await this.getCertifications();
    return certifications.find(c => c.id === id) || null;
  }

  async saveCertification(certification: Certification): Promise<Certification> {
    await delay();
    const certifications = await this.getCertifications();
    const index = certifications.findIndex(c => c.id === certification.id);
    
    if (index >= 0) {
      certifications[index] = { ...certification, updatedAt: new Date().toISOString() };
    } else {
      certifications.push(certification);
    }
    
    localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(certifications));
    return certifications[index >= 0 ? index : certifications.length - 1];
  }

  async deleteCertification(id: string): Promise<void> {
    await delay();
    const certifications = await this.getCertifications();
    const filtered = certifications.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(filtered));
  }

  // Colors operations
  async getColors(): Promise<CampColor[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.COLORS);
    return data ? JSON.parse(data) : [];
  }

  async getColor(id: string): Promise<CampColor | null> {
    await delay();
    const colors = await this.getColors();
    return colors.find(c => c.id === id) || null;
  }

  async saveColor(color: CampColor): Promise<CampColor> {
    await delay();
    const colors = await this.getColors();
    const index = colors.findIndex(c => c.id === color.id);
    
    if (index >= 0) {
      colors[index] = { ...color, updatedAt: new Date().toISOString() };
    } else {
      colors.push(color);
    }
    
    localStorage.setItem(STORAGE_KEYS.COLORS, JSON.stringify(colors));
    return colors[index >= 0 ? index : colors.length - 1];
  }

  async deleteColor(id: string): Promise<void> {
    await delay();
    const colors = await this.getColors();
    const filtered = colors.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COLORS, JSON.stringify(filtered));
  }

  // Sessions operations
  async getSessions(): Promise<CampSession[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  }

  async getSession(id: string): Promise<CampSession | null> {
    await delay();
    const sessions = await this.getSessions();
    return sessions.find(s => s.id === id) || null;
  }

  async saveSession(session: CampSession): Promise<CampSession> {
    await delay();
    const sessions = await this.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = { ...session, updatedAt: new Date().toISOString() };
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return sessions[index >= 0 ? index : sessions.length - 1];
  }

  async deleteSession(id: string): Promise<void> {
    await delay();
    const sessions = await this.getSessions();
    const filtered = sessions.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
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
    locations?: Location[];
    certifications?: Certification[];
    colors?: CampColor[];
    sessions?: CampSession[];
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
    if (data.locations) {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(data.locations));
    }
    if (data.certifications) {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(data.certifications));
    }
    if (data.colors) {
      localStorage.setItem(STORAGE_KEYS.COLORS, JSON.stringify(data.colors));
    }
    if (data.sessions) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
    }
  }
}

export const storageService = new StorageService();

