import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Camper, StaffMember, Room, SleepingRoom, Event, Conflict, CamperGroup, CamperGroupFilter, FamilyGroup } from '@/types/api';
import { storageService } from '@/services/storage';
import { conflictDetector } from '@/services/conflicts';
import { filterEventsByDate } from '@/utils/dateUtils';

export const useCampStore = defineStore('camp', () => {
  // State
  const campers = ref<Camper[]>([]);
  const staffMembers = ref<StaffMember[]>([]);
  const rooms = ref<Room[]>([]);
  const sleepingRooms = ref<SleepingRoom[]>([]);
  const events = ref<Event[]>([]);
  const conflicts = ref<Conflict[]>([]);
  const camperGroups = ref<CamperGroup[]>([]);
  const familyGroups = ref<FamilyGroup[]>([]);
  const loading = ref(false);
  const selectedDate = ref(new Date());

  // Computed
  const getCamperById = computed(() => {
    return (id: string) => campers.value.find(c => c.id === id);
  });

  const getStaffMemberById = computed(() => {
    return (id: string) => staffMembers.value.find(m => m.id === id);
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

  const getCamperGroupById = computed(() => {
    return (id: string) => camperGroups.value.find(g => g.id === id);
  });

  const getFamilyGroupById = computed(() => {
    return (id: string) => familyGroups.value.find(g => g.id === id);
  });

  const getCampersInFamilyGroup = computed(() => {
    return (familyGroupId: string): Camper[] => {
      return campers.value.filter(c => c.familyGroupId === familyGroupId);
    };
  });

  const getFamilyGroupsInRoom = computed(() => {
    return (sleepingRoomId: string): FamilyGroup[] => {
      return familyGroups.value.filter(g => g.sleepingRoomId === sleepingRoomId);
    };
  });

  // Helper function to filter campers by group criteria
  const filterCampersByGroup = (filters: CamperGroupFilter): Camper[] => {
    return campers.value.filter(camper => {
      // Age filter
      if (filters.ageMin !== undefined && camper.age < filters.ageMin) return false;
      if (filters.ageMax !== undefined && camper.age > filters.ageMax) return false;
      
      // Gender filter
      if (filters.gender && camper.gender !== filters.gender) return false;
      
      // Allergies filter
      if (filters.hasAllergies !== undefined) {
        const hasAllergies = camper.allergies && camper.allergies.length > 0;
        if (filters.hasAllergies !== hasAllergies) return false;
      }
      
      return true;
    });
  };

  const getCampersInGroup = computed(() => {
    return (groupId: string): Camper[] => {
      const group = camperGroups.value.find(g => g.id === groupId);
      if (!group) return [];
      return filterCampersByGroup(group.filters);
    };
  });

  // Actions
  async function loadAll() {
    loading.value = true;
    try {
      const [campersData, membersData, roomsData, sleepingRoomsData, eventsData, groupsData, familyGroupsData] = await Promise.all([
        storageService.getCampers(),
        storageService.getStaffMembers(),
        storageService.getRooms(),
        storageService.getSleepingRooms(),
        storageService.getEvents(),
        storageService.getCamperGroups(),
        storageService.getFamilyGroups(),
      ]);

      campers.value = campersData;
      staffMembers.value = membersData;
      rooms.value = roomsData;
      sleepingRooms.value = sleepingRoomsData;
      events.value = eventsData;
      camperGroups.value = groupsData;
      familyGroups.value = familyGroupsData;

      updateConflicts();
    } finally {
      loading.value = false;
    }
  }

  function updateConflicts() {
    conflicts.value = conflictDetector.detectConflicts(
      events.value,
      campers.value,
      staffMembers.value,
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

  // Staff member actions
  async function addStaffMember(member: StaffMember) {
    await storageService.saveStaffMember(member);
    staffMembers.value.push(member);
    updateConflicts();
  }

  async function updateStaffMember(member: StaffMember) {
    await storageService.saveStaffMember(member);
    const index = staffMembers.value.findIndex(m => m.id === member.id);
    if (index >= 0) {
      staffMembers.value[index] = member;
    }
    updateConflicts();
  }

  async function deleteStaffMember(id: string) {
    await storageService.deleteStaffMember(id);
    staffMembers.value = staffMembers.value.filter(m => m.id !== id);
    
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

  // Camper Group actions
  async function addCamperGroup(group: CamperGroup) {
    await storageService.saveCamperGroup(group);
    camperGroups.value.push(group);
  }

  async function updateCamperGroup(group: CamperGroup) {
    await storageService.saveCamperGroup(group);
    const index = camperGroups.value.findIndex(g => g.id === group.id);
    if (index >= 0) {
      camperGroups.value[index] = group;
    }
  }

  async function deleteCamperGroup(id: string) {
    await storageService.deleteCamperGroup(id);
    camperGroups.value = camperGroups.value.filter(g => g.id !== id);
  }

  // Family Group actions
  async function addFamilyGroup(group: FamilyGroup) {
    await storageService.saveFamilyGroup(group);
    familyGroups.value.push(group);
  }

  async function updateFamilyGroup(group: FamilyGroup) {
    await storageService.saveFamilyGroup(group);
    const index = familyGroups.value.findIndex(g => g.id === group.id);
    if (index >= 0) {
      familyGroups.value[index] = group;
    }
  }

  async function deleteFamilyGroup(id: string) {
    await storageService.deleteFamilyGroup(id);
    familyGroups.value = familyGroups.value.filter(g => g.id !== id);
  }

  async function enrollCamperGroup(eventId: string, groupId: string) {
    const event = events.value.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const group = camperGroups.value.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');

    // Get all campers matching the group criteria
    const groupCampers = filterCampersByGroup(group.filters);
    
    if (groupCampers.length === 0) {
      throw new Error('No campers match this group criteria');
    }

    // Initialize enrolledCamperIds if needed
    if (!event.enrolledCamperIds) {
      event.enrolledCamperIds = [];
    }

    // Filter out already enrolled campers
    const campersToEnroll = groupCampers.filter(
      camper => !event.enrolledCamperIds?.includes(camper.id)
    );

    if (campersToEnroll.length === 0) {
      return {
        enrolled: 0,
        errors: [],
        total: groupCampers.length,
        message: 'All campers from this group are already enrolled in this event.'
      };
    }

    // Process all campers in parallel using Promise.allSettled
    const enrollmentPromises = campersToEnroll.map(async (camper) => {
      const validation = conflictDetector.canEnrollCamper(event, camper.id, events.value);
      
      if (!validation.canEnroll) {
        return {
          status: 'rejected' as const,
          camper,
          reason: validation.reason
        };
      }

      try {
        await storageService.enrollCamper(eventId, camper.id);
        return {
          status: 'fulfilled' as const,
          camper
        };
      } catch (error: any) {
        return {
          status: 'rejected' as const,
          camper,
          reason: error.message
        };
      }
    });

    // Wait for all enrollments to complete
    const results = await Promise.all(enrollmentPromises);

    // Process results
    const errors: string[] = [];
    const enrolled: string[] = [];
    const enrolledIds: string[] = [];

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        enrolled.push(`${result.camper.firstName} ${result.camper.lastName}`);
        enrolledIds.push(result.camper.id);
      } else {
        errors.push(`${result.camper.firstName} ${result.camper.lastName}: ${result.reason}`);
      }
    });

    // Update event with all successfully enrolled campers at once
    event.enrolledCamperIds.push(...enrolledIds);

    updateConflicts();

    // Return summary of the operation
    return {
      enrolled: enrolled.length,
      errors,
      total: groupCampers.length,
      message: errors.length > 0 
        ? `Enrolled ${enrolled.length} of ${groupCampers.length} campers. ${errors.length} conflicts occurred.`
        : `Successfully enrolled all ${enrolled.length} campers from group "${group.name}".`
    };
  }

  return {
    // State
    campers,
    staffMembers,
    rooms,
    sleepingRooms,
    events,
    conflicts,
    camperGroups,
    familyGroups,
    loading,
    selectedDate,
    
    // Computed
    getCamperById,
    getStaffMemberById,
    getRoomById,
    getSleepingRoomById,
    getEventById,
    eventsForDate,
    camperEvents,
    staffEvents,
    roomEvents,
    getCamperGroupById,
    getCampersInGroup,
    getFamilyGroupById,
    getCampersInFamilyGroup,
    getFamilyGroupsInRoom,
    
    // Actions
    loadAll,
    updateConflicts,
    addCamper,
    updateCamper,
    deleteCamper,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
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
    addCamperGroup,
    updateCamperGroup,
    deleteCamperGroup,
    enrollCamperGroup,
    addFamilyGroup,
    updateFamilyGroup,
    deleteFamilyGroup,
  };
});

