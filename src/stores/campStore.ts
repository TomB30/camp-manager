import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Child, TeamMember, Room, SleepingRoom, Event, Conflict } from '@/types/api';
import { storageService } from '@/services/storage';
import { conflictDetector } from '@/services/conflicts';
import { filterEventsByDate } from '@/utils/dateUtils';

export const useCampStore = defineStore('camp', () => {
  // State
  const children = ref<Child[]>([]);
  const teamMembers = ref<TeamMember[]>([]);
  const rooms = ref<Room[]>([]);
  const sleepingRooms = ref<SleepingRoom[]>([]);
  const events = ref<Event[]>([]);
  const conflicts = ref<Conflict[]>([]);
  const loading = ref(false);
  const selectedDate = ref(new Date());

  // Computed
  const getChildById = computed(() => {
    return (id: string) => children.value.find(c => c.id === id);
  });

  const getTeamMemberById = computed(() => {
    return (id: string) => teamMembers.value.find(m => m.id === id);
  });

  const getRoomById = computed(() => {
    return (id: string) => rooms.value.find(r => r.id === id);
  });

  const getSleepingRoomById = computed(() => {
    return (id: string) => sleepingRooms.value.find(r => r.id === id);
  });

  const getEventById = computed(() => {
    return (id: string) => events.value.find(e => e.id === id);
  });

  const eventsForDate = computed(() => {
    return (date: Date) => {
      return filterEventsByDate(events.value, date);
    };
  });

  const childEvents = computed(() => {
    return (childId: string) => {
      return events.value.filter(event => 
        event.enrolledChildrenIds?.includes(childId)
      );
    };
  });

  const staffEvents = computed(() => {
    return (staffId: string) => {
      return events.value.filter(event => 
        event.assignedStaffIds?.includes(staffId)
      );
    };
  });

  const roomEvents = computed(() => {
    return (roomId: string) => {
      return events.value.filter(event => event.roomId === roomId);
    };
  });

  // Actions
  async function loadAll() {
    loading.value = true;
    try {
      const [childrenData, membersData, roomsData, sleepingRoomsData, eventsData] = await Promise.all([
        storageService.getChildren(),
        storageService.getTeamMembers(),
        storageService.getRooms(),
        storageService.getSleepingRooms(),
        storageService.getEvents(),
      ]);

      children.value = childrenData;
      teamMembers.value = membersData;
      rooms.value = roomsData;
      sleepingRooms.value = sleepingRoomsData;
      events.value = eventsData;

      updateConflicts();
    } finally {
      loading.value = false;
    }
  }

  function updateConflicts() {
    conflicts.value = conflictDetector.detectConflicts(
      events.value,
      children.value,
      teamMembers.value,
      rooms.value
    );
  }

  // Children actions
  async function addChild(child: Child) {
    await storageService.saveChild(child);
    children.value.push(child);
    updateConflicts();
  }

  async function updateChild(child: Child) {
    await storageService.saveChild(child);
    const index = children.value.findIndex(c => c.id === child.id);
    if (index >= 0) {
      children.value[index] = child;
    }
    updateConflicts();
  }

  async function deleteChild(id: string) {
    await storageService.deleteChild(id);
    children.value = children.value.filter(c => c.id !== id);
    
    // Remove from events
    events.value.forEach(event => {
      if (event.enrolledChildrenIds?.includes(id)) {
        event.enrolledChildrenIds = event.enrolledChildrenIds.filter(childId => childId !== id);
      }
    });
    
    updateConflicts();
  }

  // Team member actions
  async function addTeamMember(member: TeamMember) {
    await storageService.saveTeamMember(member);
    teamMembers.value.push(member);
    updateConflicts();
  }

  async function updateTeamMember(member: TeamMember) {
    await storageService.saveTeamMember(member);
    const index = teamMembers.value.findIndex(m => m.id === member.id);
    if (index >= 0) {
      teamMembers.value[index] = member;
    }
    updateConflicts();
  }

  async function deleteTeamMember(id: string) {
    await storageService.deleteTeamMember(id);
    teamMembers.value = teamMembers.value.filter(m => m.id !== id);
    
    // Remove from events
    events.value.forEach(event => {
      if (event.assignedStaffIds?.includes(id)) {
        event.assignedStaffIds = event.assignedStaffIds.filter(staffId => staffId !== id);
      }
    });
    
    updateConflicts();
  }

  // Room actions
  async function addRoom(room: Room) {
    await storageService.saveRoom(room);
    rooms.value.push(room);
    updateConflicts();
  }

  async function updateRoom(room: Room) {
    await storageService.saveRoom(room);
    const index = rooms.value.findIndex(r => r.id === room.id);
    if (index >= 0) {
      rooms.value[index] = room;
    }
    updateConflicts();
  }

  async function deleteRoom(id: string) {
    await storageService.deleteRoom(id);
    rooms.value = rooms.value.filter(r => r.id !== id);
    updateConflicts();
  }

  // Sleeping room actions
  async function addSleepingRoom(room: SleepingRoom) {
    await storageService.saveSleepingRoom(room);
    sleepingRooms.value.push(room);
  }

  async function updateSleepingRoom(room: SleepingRoom) {
    await storageService.saveSleepingRoom(room);
    const index = sleepingRooms.value.findIndex(r => r.id === room.id);
    if (index >= 0) {
      sleepingRooms.value[index] = room;
    }
  }

  async function deleteSleepingRoom(id: string) {
    await storageService.deleteSleepingRoom(id);
    sleepingRooms.value = sleepingRooms.value.filter(r => r.id !== id);
    
    // Update children who were assigned to this room
    children.value.forEach(child => {
      if (child.sleepingRoomId === id) {
        child.sleepingRoomId = undefined;
      }
    });
  }

  // Event actions
  async function addEvent(event: Event) {
    await storageService.saveEvent(event);
    events.value.push(event);
    updateConflicts();
  }

  async function updateEvent(event: Event) {
    await storageService.saveEvent(event);
    const index = events.value.findIndex(e => e.id === event.id);
    if (index >= 0) {
      events.value[index] = event;
    }
    updateConflicts();
  }

  async function deleteEvent(id: string) {
    await storageService.deleteEvent(id);
    events.value = events.value.filter(e => e.id !== id);
    updateConflicts();
  }

  async function enrollChild(eventId: string, childId: string) {
    const event = events.value.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const validation = conflictDetector.canEnrollChild(event, childId, events.value);
    if (!validation.canEnroll) {
      throw new Error(validation.reason);
    }

    await storageService.enrollChild(eventId, childId);
    
    if (!event.enrolledChildrenIds) {
      event.enrolledChildrenIds = [];
    }
    event.enrolledChildrenIds.push(childId);
    
    updateConflicts();
  }

  async function unenrollChild(eventId: string, childId: string) {
    const event = events.value.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');

    await storageService.unenrollChild(eventId, childId);
    event.enrolledChildrenIds = event.enrolledChildrenIds?.filter(id => id !== childId) || [];
    
    updateConflicts();
  }

  async function moveChild(fromEventId: string, toEventId: string, childId: string) {
    await unenrollChild(fromEventId, childId);
    await enrollChild(toEventId, childId);
  }

  return {
    // State
    children,
    teamMembers,
    rooms,
    sleepingRooms,
    events,
    conflicts,
    loading,
    selectedDate,
    
    // Computed
    getChildById,
    getTeamMemberById,
    getRoomById,
    getSleepingRoomById,
    getEventById,
    eventsForDate,
    childEvents,
    staffEvents,
    roomEvents,
    
    // Actions
    loadAll,
    updateConflicts,
    addChild,
    updateChild,
    deleteChild,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addRoom,
    updateRoom,
    deleteRoom,
    addSleepingRoom,
    updateSleepingRoom,
    deleteSleepingRoom,
    addEvent,
    updateEvent,
    deleteEvent,
    enrollChild,
    unenrollChild,
    moveChild,
  };
});

