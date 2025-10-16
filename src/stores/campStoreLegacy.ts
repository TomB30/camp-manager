import { defineStore } from 'pinia';
import type { Camper, StaffMember, Location, HousingRoom, Event, Conflict, Area, Label, CamperGroup, FamilyGroup, Program, Activity, Certification, CampColor, CampSession } from '@/types';
import { 
  campersService,
  staffMembersService,
  eventsService,
  locationsService,
  housingRoomsService,
  groupsService,
  familyGroupsService,
  programsService,
  activitiesService,
  areasService,
  certificationsService,
  colorsService,
  sessionsService,
  labelsService,
  conflictDetector
} from '@/services';
import { filterEventsByDate } from '@/utils/dateUtils';

export const useCampStore = defineStore('camp', {
  state: () => ({
    campers: [] as Camper[],
    staffMembers: [] as StaffMember[],
    locations: [] as Location[],
    housingRooms: [] as HousingRoom[],
    events: [] as Event[],
    conflicts: [] as Conflict[],
    camperGroups: [] as CamperGroup[],
    familyGroups: [] as FamilyGroup[],
    programs: [] as Program[],
    activities: [] as Activity[],
    areas: [] as Area[],
    certifications: [] as Certification[],
    colors: [] as CampColor[],
    sessions: [] as CampSession[],
    labels: [] as Label[],
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

    getLocationById(state): (id: string) => Location | undefined {
      return (id: string): Location | undefined => {
        return state.locations.find(l => l.id === id);
      };
    },

    getHousingRoomById(state): (id: string) => HousingRoom | undefined {
      return (id: string): HousingRoom | undefined => {
        return state.housingRooms.find(h => h.id === id);
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

    locationEvents(state): (locationId: string) => Event[] {
      return (locationId: string): Event[] => {
        return state.events.filter(event => event.locationId === locationId);
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

    getFamilyGroupsInRoom(state): (housingRoomId: string) => FamilyGroup[] {
      return (housingRoomId: string): FamilyGroup[] => {
        return state.familyGroups.filter(g => g.housingRoomId === housingRoomId);
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
        return state.activities.filter(a => a.programIds.includes(programId));
      };
    },

    getEventsForProgram(state): (programId: string) => Event[] {
      return (programId: string): Event[] => {
        return state.events.filter(e => e.programId === programId);
      };
    },

    getAreaById(state): (id: string) => Area | undefined {
      return (id: string): Area | undefined => {
        return state.areas.find(a => a.id === id);
      };
    },

    getCertificationById(state): (id: string) => Certification | undefined {
      return (id: string): Certification | undefined => {
        return state.certifications.find(c => c.id === id);
      };
    },

    getProgramsForStaffMember(state): (staffId: string) => Program[] {
      return (staffId: string): Program[] => {
        return state.programs.filter(p => p.staffMemberIds.includes(staffId));
      };
    },

    getStaffMembersInProgram(state): (programId: string) => StaffMember[] {
      return (programId: string): StaffMember[] => {
        const program = state.programs.find(p => p.id === programId);
        if (!program) return [];
        return state.staffMembers.filter(s => program.staffMemberIds.includes(s.id));
      };
    },

    getColorById(state): (id: string) => CampColor | undefined {
      return (id: string): CampColor | undefined => {
        return state.colors.find(c => c.id === id);
      };
    },

    getSessionById(state): (id: string) => CampSession | undefined {
      return (id: string): CampSession | undefined => {
        return state.sessions.find(s => s.id === id);
      };
    },

    getLabelById(state): (id: string) => Label | undefined {
      return (id: string): Label | undefined => {
        return state.labels.find(l => l.id === id);
      };
    },
  },

  actions: {
    async loadAll(): Promise<void> {
      this.loading = true;
      try {
        const [campersData, membersData, locationsData, housingRoomsData, eventsData, groupsData, familyGroupsData, programsData, activitiesData, areasData, certificationsData, colorsData, sessionsData, labelsData] = await Promise.all([
          campersService.getCampers(),
          staffMembersService.getStaffMembers(),
          locationsService.getLocations(),
          housingRoomsService.getHousingRooms(),
          eventsService.getEvents(),
          groupsService.getCamperGroups(),
          familyGroupsService.getFamilyGroups(),
          programsService.getPrograms(),
          activitiesService.getActivities(),
          areasService.getAreas(),
          certificationsService.getCertifications(),
          colorsService.getColors(),
          sessionsService.getSessions(),
          labelsService.getLabels(),
        ]);

        this.campers = campersData;
        this.staffMembers = membersData;
        this.locations = locationsData;
        this.housingRooms = housingRoomsData;
        this.events = eventsData;
        this.camperGroups = groupsData;
        this.familyGroups = familyGroupsData;
        this.programs = programsData;
        this.activities = activitiesData;
        this.areas = areasData;
        this.certifications = certificationsData;
        this.colors = colorsData;
        this.sessions = sessionsData;
        this.labels = labelsData;

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
        this.locations,
        this.certifications
      );
    },

    // Campers actions
    async addCamper(camper: Camper): Promise<void> {
      await campersService.saveCamper(camper);
      this.campers.push(camper);
      this.updateConflicts();
    },

    async updateCamper(camper: Camper): Promise<void> {
      await campersService.saveCamper(camper);
      const index = this.campers.findIndex(c => c.id === camper.id);
      if (index >= 0) {
        this.campers[index] = camper;
      }
      this.updateConflicts();
    },

    async deleteCamper(id: string): Promise<void> {
      await campersService.deleteCamper(id);
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
      await staffMembersService.saveStaffMember(member);
      this.staffMembers.push(member);
      this.updateConflicts();
    },

    async updateStaffMember(member: StaffMember): Promise<void> {
      await staffMembersService.saveStaffMember(member);
      const index = this.staffMembers.findIndex(m => m.id === member.id);
      if (index >= 0) {
        this.staffMembers[index] = member;
      }
      this.updateConflicts();
    },

    async deleteStaffMember(id: string): Promise<void> {
      await staffMembersService.deleteStaffMember(id);
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
    async addLocation(location: Location): Promise<void> {
      await locationsService.saveLocation(location);
      this.locations.push(location);
      this.updateConflicts();
    },

    async updateLocation(location: Location): Promise<void> {
      await locationsService.saveLocation(location);
      const index = this.locations.findIndex(r => r.id === location.id);
      if (index >= 0) {
        this.locations[index] = location;
      }
      this.updateConflicts();
    },

    async deleteLocation(id: string): Promise<void> {
      await locationsService.deleteLocation(id);
      this.locations = this.locations.filter(l => l.id !== id);
      this.updateConflicts();
    },

    // Housing room actions
    async addHousingRoom(housingRoom: HousingRoom): Promise<void> {
      await housingRoomsService.saveHousingRoom(housingRoom);
      this.housingRooms.push(housingRoom);
    },

    async updateHousingRoom(housingRoom: HousingRoom): Promise<void> {
      await housingRoomsService.saveHousingRoom(housingRoom);
      const index = this.housingRooms.findIndex(r => r.id === housingRoom.id);
      if (index >= 0) {
        this.housingRooms[index] = housingRoom;
      }
    },

    async deleteHousingRoom(id: string): Promise<void> {
      await housingRoomsService.deleteHousingRoom(id);
      this.housingRooms = this.housingRooms.filter(r => r.id !== id);
    },

    // Event actions
    async addEvent(event: Event): Promise<void> {
      await eventsService.saveEvent(event);
      this.events.push(event);
      this.updateConflicts();
    },

    // Batch add events - more efficient for recurring events
    async addEventsBatch(events: Event[]): Promise<void> {
      // Save all events to storage in parallel
      await eventsService.saveEventsBatch(events);
      // Add all to state at once
      this.events.push(...events);
      // Only run conflict detection once at the end
      this.updateConflicts();
    },

    async updateEvent(event: Event): Promise<void> {
      await eventsService.saveEvent(event);
      const index = this.events.findIndex(e => e.id === event.id);
      if (index >= 0) {
        this.events[index] = event;
      }
      this.updateConflicts();
    },

    async deleteEvent(id: string): Promise<void> {
      await eventsService.deleteEvent(id);
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

      await eventsService.enrollCamper(eventId, camperId);
      
      if (!event.enrolledCamperIds) {
        event.enrolledCamperIds = [];
      }
      event.enrolledCamperIds.push(camperId);
      
      this.updateConflicts();
    },

    async unenrollCamper(eventId: string, camperId: string): Promise<void> {
      const event = this.events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      await eventsService.unenrollCamper(eventId, camperId);
      event.enrolledCamperIds = event.enrolledCamperIds?.filter(id => id !== camperId) || [];
      
      this.updateConflicts();
    },

    async moveCamper(fromEventId: string, toEventId: string, camperId: string): Promise<void> {
      await this.unenrollCamper(fromEventId, camperId);
      await this.enrollCamper(toEventId, camperId);
    },

    // Camper Group actions
    async addCamperGroup(group: CamperGroup): Promise<void> {
      await groupsService.saveCamperGroup(group);
      this.camperGroups.push(group);
    },

    async updateCamperGroup(group: CamperGroup): Promise<void> {
      await groupsService.saveCamperGroup(group);
      const index = this.camperGroups.findIndex(g => g.id === group.id);
      if (index >= 0) {
        this.camperGroups[index] = group;
      }
    },

    async deleteCamperGroup(id: string): Promise<void> {
      await groupsService.deleteCamperGroup(id);
      this.camperGroups = this.camperGroups.filter(g => g.id !== id);
    },

    // Family Group actions
    async addFamilyGroup(group: FamilyGroup): Promise<void> {
      await familyGroupsService.saveFamilyGroup(group);
      this.familyGroups.push(group);
    },

    async updateFamilyGroup(group: FamilyGroup): Promise<void> {
      await familyGroupsService.saveFamilyGroup(group);
      const index = this.familyGroups.findIndex(g => g.id === group.id);
      if (index >= 0) {
        this.familyGroups[index] = group;
      }
    },

    async deleteFamilyGroup(id: string): Promise<void> {
      await familyGroupsService.deleteFamilyGroup(id);
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
          await eventsService.enrollCamper(eventId, camper.id);
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
      await programsService.saveProgram(program);
      this.programs.push(program);
    },

    async updateProgram(program: Program): Promise<void> {
      await programsService.saveProgram(program);
      const index = this.programs.findIndex(p => p.id === program.id);
      if (index >= 0) {
        this.programs[index] = program;
      }
    },

    async deleteProgram(id: string): Promise<void> {
      // The programsService handles all cleanup logic
      await programsService.deleteProgram(id);
      
      // Update state - activities may have been deleted
      this.activities = await activitiesService.getActivities();
      this.programs = this.programs.filter(p => p.id !== id);
    },

    // Activity actions
    async addActivity(activity: Activity): Promise<void> {
      await activitiesService.saveActivity(activity);
      this.activities.push(activity);
      
      // Add activity ID to all parent programs
      for (const programId of activity.programIds) {
        const program = this.programs.find(p => p.id === programId);
        if (program && !program.activityIds.includes(activity.id)) {
          program.activityIds.push(activity.id);
          await this.updateProgram(program);
        }
      }
    },

    async updateActivity(activity: Activity): Promise<void> {
      const oldActivity = this.activities.find(a => a.id === activity.id);
      
      await activitiesService.saveActivity(activity);
      const index = this.activities.findIndex(a => a.id === activity.id);
      if (index >= 0) {
        this.activities[index] = activity;
      }

      // Update program associations if they changed
      if (oldActivity) {
        const oldProgramIds = new Set(oldActivity.programIds);
        const newProgramIds = new Set(activity.programIds);

        // Remove from programs that are no longer associated
        for (const programId of oldProgramIds) {
          if (!newProgramIds.has(programId)) {
            const program = this.programs.find(p => p.id === programId);
            if (program) {
              program.activityIds = program.activityIds.filter(aid => aid !== activity.id);
              await this.updateProgram(program);
            }
          }
        }

        // Add to new programs
        for (const programId of newProgramIds) {
          if (!oldProgramIds.has(programId)) {
            const program = this.programs.find(p => p.id === programId);
            if (program && !program.activityIds.includes(activity.id)) {
              program.activityIds.push(activity.id);
              await this.updateProgram(program);
            }
          }
        }
      }
    },

    async deleteActivity(id: string): Promise<void> {
      const activity = this.activities.find(a => a.id === id);
      if (activity) {
        // Remove from all programs' activityIds
        for (const programId of activity.programIds) {
          const program = this.programs.find(p => p.id === programId);
          if (program) {
            program.activityIds = program.activityIds.filter(aid => aid !== id);
            await this.updateProgram(program);
          }
        }
      }
      
      await activitiesService.deleteActivity(id);
      this.activities = this.activities.filter(a => a.id !== id);
    },

    // Add/remove activity from a specific program
    async addActivityToProgram(activityId: string, programId: string): Promise<void> {
      await activitiesService.addActivityToProgram(activityId, programId);
      
      // Update state
      const activity = this.activities.find(a => a.id === activityId);
      const program = this.programs.find(p => p.id === programId);
      
      if (activity && !activity.programIds.includes(programId)) {
        activity.programIds.push(programId);
      }
      
      if (program && !program.activityIds.includes(activityId)) {
        program.activityIds.push(activityId);
      }
    },

    async removeActivityFromProgram(activityId: string, programId: string): Promise<void> {
      await activitiesService.removeActivityFromProgram(activityId, programId);
      
      // Update state
      const activity = this.activities.find(a => a.id === activityId);
      const program = this.programs.find(p => p.id === programId);
      
      if (activity) {
        activity.programIds = activity.programIds.filter(id => id !== programId);
      }
      
      if (program) {
        program.activityIds = program.activityIds.filter(id => id !== activityId);
      }
    },

    // Area actions
    async addArea(area: Area): Promise<void> {
      await areasService.saveArea(area);
      this.areas.push(area);
    },

    async updateArea(area: Area): Promise<void> {
      await areasService.saveArea(area);
      const index = this.areas.findIndex(a => a.id === area.id);
      if (index >= 0) {
        this.areas[index] = area;
      }
    },

    async deleteArea(id: string): Promise<void> {
      await areasService.deleteArea(id);
      this.areas = this.areas.filter(a => a.id !== id);
    },

    // Certification actions
    async addCertification(certification: Certification): Promise<void> {
      await certificationsService.saveCertification(certification);
      this.certifications.push(certification);
    },

    async updateCertification(certification: Certification): Promise<void> {
      await certificationsService.saveCertification(certification);
      const index = this.certifications.findIndex(c => c.id === certification.id);
      if (index >= 0) {
        this.certifications[index] = certification;
      }
    },

    async deleteCertification(id: string): Promise<void> {
      await certificationsService.deleteCertification(id);
      this.certifications = this.certifications.filter(c => c.id !== id);
    },

    // Color actions
    async addColor(color: CampColor): Promise<void> {
      await colorsService.saveColor(color);
      this.colors.push(color);
    },

    async updateColor(color: CampColor): Promise<void> {
      await colorsService.saveColor(color);
      const index = this.colors.findIndex(c => c.id === color.id);
      if (index >= 0) {
        this.colors[index] = color;
      }
    },

    async deleteColor(id: string): Promise<void> {
      await colorsService.deleteColor(id);
      this.colors = this.colors.filter(c => c.id !== id);
    },

    // Session actions
    async addSession(session: CampSession): Promise<void> {
      await sessionsService.saveSession(session);
      this.sessions.push(session);
    },

    async updateSession(session: CampSession): Promise<void> {
      await sessionsService.saveSession(session);
      const index = this.sessions.findIndex(s => s.id === session.id);
      if (index >= 0) {
        this.sessions[index] = session;
      }
    },

    async deleteSession(id: string): Promise<void> {
      await sessionsService.deleteSession(id);
      this.sessions = this.sessions.filter(s => s.id !== id);
    },

    // Label actions
    async addLabel(label: Label): Promise<void> {
      await labelsService.saveLabel(label);
      this.labels.push(label);
    },

    async updateLabel(label: Label): Promise<void> {
      await labelsService.saveLabel(label);
      const index = this.labels.findIndex(l => l.id === label.id);
      if (index >= 0) {
        this.labels[index] = label;
      }
    },

    async deleteLabel(id: string): Promise<void> {
      await labelsService.deleteLabel(id);
      this.labels = this.labels.filter(l => l.id !== id);
    },
  }
});
