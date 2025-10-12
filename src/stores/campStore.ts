import { defineStore } from 'pinia';
import type { Camper, StaffMember, Room, SleepingRoom, Event, Conflict, CamperGroup, FamilyGroup, Program, Activity } from '@/types/api';
import { storageService } from '@/services/storage';
import { conflictDetector } from '@/services/conflicts';
import { filterEventsByDate } from '@/utils/dateUtils';

export const useCampStore = defineStore('camp', {
  state: () => ({
    campers: [] as Camper[],
    staffMembers: [] as StaffMember[],
    rooms: [] as Room[],
    sleepingRooms: [] as SleepingRoom[],
    events: [] as Event[],
    conflicts: [] as Conflict[],
    camperGroups: [] as CamperGroup[],
    familyGroups: [] as FamilyGroup[],
    programs: [] as Program[],
    activities: [] as Activity[],
    loading: false,
    selectedDate: new Date(),
  }),

  getters: {
    getCamperById(state): (id: string) => Camper | undefined {
      return (id: string): Camper | undefined => {
        return state.campers.find(c => c.id === id);
      };
    },

    getStaffMemberById(state): (id: string) => StaffMember | undefined {
      return (id: string): StaffMember | undefined => {
        return state.staffMembers.find(m => m.id === id);
      };
    },

    getRoomById(state): (id: string) => Room | undefined {
      return (id: string): Room | undefined => {
        return state.rooms.find(r => r.id === id);
      };
    },

    getSleepingRoomById(state): (id: string) => SleepingRoom | undefined {
      return (id: string): SleepingRoom | undefined => {
        return state.sleepingRooms.find(r => r.id === id);
      };
    },

    getEventById(state): (id: string) => Event | undefined {
      return (id: string): Event | undefined => {
        return state.events.find(e => e.id === id);
      };
    },

    eventsForDate(state): (date: Date) => Event[] {
      return (date: Date): Event[] => {
        return filterEventsByDate(state.events, date);
      };
    },

    camperEvents(state): (camperId: string) => Event[] {
      return (camperId: string): Event[] => {
        return state.events.filter(event => 
          event.enrolledCamperIds?.includes(camperId)
        );
      };
    },

    staffEvents(state): (staffId: string) => Event[] {
      return (staffId: string): Event[] => {
        return state.events.filter(event => 
          event.assignedStaffIds?.includes(staffId)
        );
      };
    },

    roomEvents(state): (roomId: string) => Event[] {
      return (roomId: string): Event[] => {
        return state.events.filter(event => event.roomId === roomId);
      };
    },

    getCamperGroupById(state): (id: string) => CamperGroup | undefined {
      return (id: string): CamperGroup | undefined => {
        return state.camperGroups.find(g => g.id === id);
      };
    },

    getFamilyGroupById(state): (id: string) => FamilyGroup | undefined {
      return (id: string): FamilyGroup | undefined => {
        return state.familyGroups.find(g => g.id === id);
      };
    },

    getCampersInFamilyGroup(state): (familyGroupId: string) => Camper[] {
      return (familyGroupId: string): Camper[] => {
        return state.campers.filter(c => c.familyGroupId === familyGroupId);
      };
    },

    getFamilyGroupsInRoom(state): (sleepingRoomId: string) => FamilyGroup[] {
      return (sleepingRoomId: string): FamilyGroup[] => {
        return state.familyGroups.filter(g => g.sleepingRoomId === sleepingRoomId);
      };
    },

    getCampersInGroup(state): (groupId: string) => Camper[] {
      return (groupId: string): Camper[] => {
        const group = state.camperGroups.find(g => g.id === groupId);
        if (!group) return [];
        
        // Determine base set of campers to filter
        let baseCampers: Camper[];
        
        if (group.familyGroupIds && group.familyGroupIds.length > 0) {
          // If family groups are selected, only consider campers from those family groups
          baseCampers = state.campers.filter(c => 
            c.familyGroupId && group.familyGroupIds!.includes(c.familyGroupId)
          );
        } else {
          // If no family groups selected, consider all campers
          baseCampers = state.campers;
        }
        
        // Apply filters to the base set of campers
        return baseCampers.filter(camper => {
          // Age filter
          if (group.filters.ageMin !== undefined && camper.age < group.filters.ageMin) return false;
          if (group.filters.ageMax !== undefined && camper.age > group.filters.ageMax) return false;
          
          // Gender filter
          if (group.filters.gender && camper.gender !== group.filters.gender) return false;
          
          // Allergies filter
          if (group.filters.hasAllergies !== undefined) {
            const hasAllergies = camper.allergies && camper.allergies.length > 0;
            if (group.filters.hasAllergies !== hasAllergies) return false;
          }
          
          return true;
        });
      };
    },

    getProgramById(state): (id: string) => Program | undefined {
      return (id: string): Program | undefined => {
        return state.programs.find(p => p.id === id);
      };
    },

    getActivityById(state): (id: string) => Activity | undefined {
      return (id: string): Activity | undefined => {
        return state.activities.find(a => a.id === id);
      };
    },

    getActivitiesInProgram(state): (programId: string) => Activity[] {
      return (programId: string): Activity[] => {
        return state.activities.filter(a => a.programId === programId);
      };
    },

    getEventsForProgram(state): (programId: string) => Event[] {
      return (programId: string): Event[] => {
        return state.events.filter(e => e.programId === programId);
      };
    },
  },

  actions: {
    async loadAll(): Promise<void> {
      this.loading = true;
      try {
        const [campersData, membersData, roomsData, sleepingRoomsData, eventsData, groupsData, familyGroupsData, programsData, activitiesData] = await Promise.all([
          storageService.getCampers(),
          storageService.getStaffMembers(),
          storageService.getRooms(),
          storageService.getSleepingRooms(),
          storageService.getEvents(),
          storageService.getCamperGroups(),
          storageService.getFamilyGroups(),
          storageService.getPrograms(),
          storageService.getActivities(),
        ]);

        this.campers = campersData;
        this.staffMembers = membersData;
        this.rooms = roomsData;
        this.sleepingRooms = sleepingRoomsData;
        this.events = eventsData;
        this.camperGroups = groupsData;
        this.familyGroups = familyGroupsData;
        this.programs = programsData;
        this.activities = activitiesData;

        this.updateConflicts();
      } finally {
        this.loading = false;
      }
    },

    updateConflicts(): void {
      this.conflicts = conflictDetector.detectConflicts(
        this.events,
        this.campers,
        this.staffMembers,
        this.rooms
      );
    },

    // Campers actions
    async addCamper(camper: Camper): Promise<void> {
      await storageService.saveCamper(camper);
      this.campers.push(camper);
      this.updateConflicts();
    },

    async updateCamper(camper: Camper): Promise<void> {
      await storageService.saveCamper(camper);
      const index = this.campers.findIndex(c => c.id === camper.id);
      if (index >= 0) {
        this.campers[index] = camper;
      }
      this.updateConflicts();
    },

    async deleteCamper(id: string): Promise<void> {
      await storageService.deleteCamper(id);
      this.campers = this.campers.filter(c => c.id !== id);
      
      // Remove from events
      this.events.forEach(event => {
        if (event.enrolledCamperIds?.includes(id)) {
          event.enrolledCamperIds = event.enrolledCamperIds.filter(camperId => camperId !== id);
        }
      });
      
      this.updateConflicts();
    },

    // Staff member actions
    async addStaffMember(member: StaffMember): Promise<void> {
      await storageService.saveStaffMember(member);
      this.staffMembers.push(member);
      this.updateConflicts();
    },

    async updateStaffMember(member: StaffMember): Promise<void> {
      await storageService.saveStaffMember(member);
      const index = this.staffMembers.findIndex(m => m.id === member.id);
      if (index >= 0) {
        this.staffMembers[index] = member;
      }
      this.updateConflicts();
    },

    async deleteStaffMember(id: string): Promise<void> {
      await storageService.deleteStaffMember(id);
      this.staffMembers = this.staffMembers.filter(m => m.id !== id);
      
      // Remove from events
      this.events.forEach(event => {
        if (event.assignedStaffIds?.includes(id)) {
          event.assignedStaffIds = event.assignedStaffIds.filter(staffId => staffId !== id);
        }
      });
      
      this.updateConflicts();
    },

    // Room actions
    async addRoom(room: Room): Promise<void> {
      await storageService.saveRoom(room);
      this.rooms.push(room);
      this.updateConflicts();
    },

    async updateRoom(room: Room): Promise<void> {
      await storageService.saveRoom(room);
      const index = this.rooms.findIndex(r => r.id === room.id);
      if (index >= 0) {
        this.rooms[index] = room;
      }
      this.updateConflicts();
    },

    async deleteRoom(id: string): Promise<void> {
      await storageService.deleteRoom(id);
      this.rooms = this.rooms.filter(r => r.id !== id);
      this.updateConflicts();
    },

    // Sleeping room actions
    async addSleepingRoom(room: SleepingRoom): Promise<void> {
      await storageService.saveSleepingRoom(room);
      this.sleepingRooms.push(room);
    },

    async updateSleepingRoom(room: SleepingRoom): Promise<void> {
      await storageService.saveSleepingRoom(room);
      const index = this.sleepingRooms.findIndex(r => r.id === room.id);
      if (index >= 0) {
        this.sleepingRooms[index] = room;
      }
    },

    async deleteSleepingRoom(id: string): Promise<void> {
      await storageService.deleteSleepingRoom(id);
      this.sleepingRooms = this.sleepingRooms.filter(r => r.id !== id);
    },

    // Event actions
    async addEvent(event: Event): Promise<void> {
      await storageService.saveEvent(event);
      this.events.push(event);
      this.updateConflicts();
    },

    async updateEvent(event: Event): Promise<void> {
      await storageService.saveEvent(event);
      const index = this.events.findIndex(e => e.id === event.id);
      if (index >= 0) {
        this.events[index] = event;
      }
      this.updateConflicts();
    },

    async deleteEvent(id: string): Promise<void> {
      await storageService.deleteEvent(id);
      this.events = this.events.filter(e => e.id !== id);
      this.updateConflicts();
    },

    async enrollCamper(eventId: string, camperId: string): Promise<void> {
      const event = this.events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      const validation = conflictDetector.canEnrollCamper(event, camperId, this.events);
      if (!validation.canEnroll) {
        throw new Error(validation.reason);
      }

      await storageService.enrollCamper(eventId, camperId);
      
      if (!event.enrolledCamperIds) {
        event.enrolledCamperIds = [];
      }
      event.enrolledCamperIds.push(camperId);
      
      this.updateConflicts();
    },

    async unenrollCamper(eventId: string, camperId: string): Promise<void> {
      const event = this.events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      await storageService.unenrollCamper(eventId, camperId);
      event.enrolledCamperIds = event.enrolledCamperIds?.filter(id => id !== camperId) || [];
      
      this.updateConflicts();
    },

    async moveCamper(fromEventId: string, toEventId: string, camperId: string): Promise<void> {
      await this.unenrollCamper(fromEventId, camperId);
      await this.enrollCamper(toEventId, camperId);
    },

    // Camper Group actions
    async addCamperGroup(group: CamperGroup): Promise<void> {
      await storageService.saveCamperGroup(group);
      this.camperGroups.push(group);
    },

    async updateCamperGroup(group: CamperGroup): Promise<void> {
      await storageService.saveCamperGroup(group);
      const index = this.camperGroups.findIndex(g => g.id === group.id);
      if (index >= 0) {
        this.camperGroups[index] = group;
      }
    },

    async deleteCamperGroup(id: string): Promise<void> {
      await storageService.deleteCamperGroup(id);
      this.camperGroups = this.camperGroups.filter(g => g.id !== id);
    },

    // Family Group actions
    async addFamilyGroup(group: FamilyGroup): Promise<void> {
      await storageService.saveFamilyGroup(group);
      this.familyGroups.push(group);
    },

    async updateFamilyGroup(group: FamilyGroup): Promise<void> {
      await storageService.saveFamilyGroup(group);
      const index = this.familyGroups.findIndex(g => g.id === group.id);
      if (index >= 0) {
        this.familyGroups[index] = group;
      }
    },

    async deleteFamilyGroup(id: string): Promise<void> {
      await storageService.deleteFamilyGroup(id);
      this.familyGroups = this.familyGroups.filter(g => g.id !== id);
    },

    async enrollCamperGroup(eventId: string, groupId: string): Promise<{ enrolled: number; errors: string[]; total: number; message: string }> {
      const event = this.events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      const group = this.camperGroups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');

      // Use the getter to get all campers in the group (includes family groups and filters)
      const groupCampers = this.getCampersInGroup(groupId);
      
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
        const validation = conflictDetector.canEnrollCamper(event, camper.id, this.events);
        
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

      this.updateConflicts();

      // Return summary of the operation
      return {
        enrolled: enrolled.length,
        errors,
        total: groupCampers.length,
        message: errors.length > 0 
          ? `Enrolled ${enrolled.length} of ${groupCampers.length} campers. ${errors.length} conflicts occurred.`
          : `Successfully enrolled all ${enrolled.length} campers from group "${group.name}".`
      };
    },

    // Program actions
    async addProgram(program: Program): Promise<void> {
      await storageService.saveProgram(program);
      this.programs.push(program);
    },

    async updateProgram(program: Program): Promise<void> {
      await storageService.saveProgram(program);
      const index = this.programs.findIndex(p => p.id === program.id);
      if (index >= 0) {
        this.programs[index] = program;
      }
    },

    async deleteProgram(id: string): Promise<void> {
      await storageService.deleteProgram(id);
      this.programs = this.programs.filter(p => p.id !== id);
      // Activities will be deleted by storage service
      this.activities = this.activities.filter(a => a.programId !== id);
    },

    // Activity actions
    async addActivity(activity: Activity): Promise<void> {
      await storageService.saveActivity(activity);
      this.activities.push(activity);
      
      // Add activity ID to parent program
      const program = this.programs.find(p => p.id === activity.programId);
      if (program && !program.activityIds.includes(activity.id)) {
        program.activityIds.push(activity.id);
        await this.updateProgram(program);
      }
    },

    async updateActivity(activity: Activity): Promise<void> {
      await storageService.saveActivity(activity);
      const index = this.activities.findIndex(a => a.id === activity.id);
      if (index >= 0) {
        this.activities[index] = activity;
      }
    },

    async deleteActivity(id: string): Promise<void> {
      const activity = this.activities.find(a => a.id === id);
      if (activity) {
        // Remove from program's activityIds
        const program = this.programs.find(p => p.id === activity.programId);
        if (program) {
          program.activityIds = program.activityIds.filter(aid => aid !== id);
          await this.updateProgram(program);
        }
      }
      
      await storageService.deleteActivity(id);
      this.activities = this.activities.filter(a => a.id !== id);
    },
  }
});

