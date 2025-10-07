import type { Child, TeamMember, Room, SleepingRoom, Event } from '@/types/api';

const STORAGE_KEYS = {
  CHILDREN: 'camp_children',
  TEAM_MEMBERS: 'camp_team_members',
  ROOMS: 'camp_rooms',
  SLEEPING_ROOMS: 'camp_sleeping_rooms',
  EVENTS: 'camp_events',
} as const;

// Simulate async operations to match future API
const delay = (ms: number = 50) => new Promise(resolve => setTimeout(resolve, ms));

class StorageService {
  // Children operations
  async getChildren(): Promise<Child[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    return data ? JSON.parse(data) : [];
  }

  async getChild(id: string): Promise<Child | null> {
    await delay();
    const children = await this.getChildren();
    return children.find(c => c.id === id) || null;
  }

  async saveChild(child: Child): Promise<Child> {
    await delay();
    const children = await this.getChildren();
    const index = children.findIndex(c => c.id === child.id);
    
    if (index >= 0) {
      children[index] = child;
    } else {
      children.push(child);
    }
    
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
    return child;
  }

  async deleteChild(id: string): Promise<void> {
    await delay();
    const children = await this.getChildren();
    const filtered = children.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(filtered));
    
    // Also remove from all events
    const events = await this.getEvents();
    const updatedEvents = events.map(event => ({
      ...event,
      enrolledChildrenIds: event.enrolledChildrenIds?.filter(childId => childId !== id) || [],
    }));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
  }

  // Team Members operations
  async getTeamMembers(): Promise<TeamMember[]> {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
    return data ? JSON.parse(data) : [];
  }

  async getTeamMember(id: string): Promise<TeamMember | null> {
    await delay();
    const members = await this.getTeamMembers();
    return members.find(m => m.id === id) || null;
  }

  async saveTeamMember(member: TeamMember): Promise<TeamMember> {
    await delay();
    const members = await this.getTeamMembers();
    const index = members.findIndex(m => m.id === member.id);
    
    if (index >= 0) {
      members[index] = member;
    } else {
      members.push(member);
    }
    
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));
    return member;
  }

  async deleteTeamMember(id: string): Promise<void> {
    await delay();
    const members = await this.getTeamMembers();
    const filtered = members.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(filtered));
    
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
    
    // Also remove from children assignments
    const children = await this.getChildren();
    const updatedChildren = children.map(child => ({
      ...child,
      sleepingRoomId: child.sleepingRoomId === id ? undefined : child.sleepingRoomId,
    }));
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(updatedChildren));
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

  async enrollChild(eventId: string, childId: string): Promise<void> {
    await delay();
    const event = await this.getEvent(eventId);
    if (!event) throw new Error('Event not found');
    
    if (!event.enrolledChildrenIds) {
      event.enrolledChildrenIds = [];
    }
    
    if (!event.enrolledChildrenIds.includes(childId)) {
      event.enrolledChildrenIds.push(childId);
      await this.saveEvent(event);
    }
  }

  async unenrollChild(eventId: string, childId: string): Promise<void> {
    await delay();
    const event = await this.getEvent(eventId);
    if (!event) throw new Error('Event not found');
    
    event.enrolledChildrenIds = event.enrolledChildrenIds?.filter(id => id !== childId) || [];
    await this.saveEvent(event);
  }

  // Utility methods
  async clearAll(): Promise<void> {
    await delay();
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  async seedData(data: {
    children?: Child[];
    teamMembers?: TeamMember[];
    rooms?: Room[];
    sleepingRooms?: SleepingRoom[];
    events?: Event[];
  }): Promise<void> {
    await delay();
    if (data.children) {
      localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(data.children));
    }
    if (data.teamMembers) {
      localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(data.teamMembers));
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
  }
}

export const storageService = new StorageService();

