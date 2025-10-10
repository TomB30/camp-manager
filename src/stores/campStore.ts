import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Camper, TeamMember, Room, SleepingRoom, Event, Conflict } from '@/types/api';
import { storageService } from '@/services/storage';
import { conflictDetector } from '@/services/conflicts';
import { filterEventsByDate } from '@/utils/dateUtils';

export const useCampStore = defineStore('camp', () => {
  // State
  const campers = ref<Camper[]>([]);
  const teamMembers = ref<TeamMember[]>([]);
  const rooms = ref<Room[]>([]);
  const sleepingRooms = ref<SleepingRoom[]>([]);
  const events = ref<Event[]>([]);
  const conflicts = ref<Conflict[]>([]);
  const loading = ref(false);
  const selectedDate = ref(new Date());

  // Computed
  const getCamperById = computed(() => {
    return (id: string) => campers.value.find(c => c.id === id);
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

  const camperEvents = computed(() => {
    return (camperId: string) => {
      return events.value.filter(event => 
        event.enrolledCamperIds?.includes(camperId)
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
      const [campersData, membersData, roomsData, sleepingRoomsData, eventsData] = await Promise.all([
        storageService.getCampers(),
        storageService.getTeamMembers(),
        storageService.getRooms(),
        storageService.getSleepingRooms(),
        storageService.getEvents(),
      ]);

      campers.value = campersData;
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
      campers.value,
      teamMembers.value,
      rooms.value
    );
  }

  // Campers actions
  async function addCamper(camper: Camper) {
    await storageService.saveCamper(camper);
    campers.value.push(camper);
    updateConflicts();
  }

  async function updateCamper(camper: Camper) {
    await storageService.saveCamper(camper);
    const index = campers.value.findIndex(c => c.id === camper.id);
    if (index >= 0) {
      campers.value[index] = camper;
    }
    updateConflicts();
  }

  async function deleteCamper(id: string) {
    await storageService.deleteCamper(id);
    campers.value = campers.value.filter(c => c.id !== id);
    
    // Remove from events
    events.value.forEach(event => {
      if (event.enrolledCamperIds?.includes(id)) {
        event.enrolledCamperIds = event.enrolledCamperIds.filter(camperId => camperId !== id);
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
    
    // Update campers who were assigned to this room
    campers.value.forEach(camper => {
      if (camper.sleepingRoomId === id) {
        camper.sleepingRoomId = undefined;
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

  async function enrollCamper(eventId: string, camperId: string) {
    const event = events.value.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const validation = conflictDetector.canEnrollCamper(event, camperId, events.value);
    if (!validation.canEnroll) {
      throw new Error(validation.reason);
    }

    await storageService.enrollCamper(eventId, camperId);
    
    if (!event.enrolledCamperIds) {
      event.enrolledCamperIds = [];
    }
    event.enrolledCamperIds.push(camperId);
    
    updateConflicts();
  }

  async function unenrollCamper(eventId: string, camperId: string) {
    const event = events.value.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');

    await storageService.unenrollCamper(eventId, camperId);
    event.enrolledCamperIds = event.enrolledCamperIds?.filter(id => id !== camperId) || [];
    
    updateConflicts();
  }

  async function moveCamper(fromEventId: string, toEventId: string, camperId: string) {
    await unenrollCamper(fromEventId, camperId);
    await enrollCamper(toEventId, camperId);
  }

  return {
    // State
    campers,
    teamMembers,
    rooms,
    sleepingRooms,
    events,
    conflicts,
    loading,
    selectedDate,
    
    // Computed
    getCamperById,
    getTeamMemberById,
    getRoomById,
    getSleepingRoomById,
    getEventById,
    eventsForDate,
    camperEvents,
    staffEvents,
    roomEvents,
    
    // Actions
    loadAll,
    updateConflicts,
    addCamper,
    updateCamper,
    deleteCamper,
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
    enrollCamper,
    unenrollCamper,
    moveCamper,
  };
});

