<template>
  <div class="container">
    <div class="campers-view">
      <ViewHeader title="Campers Management">
        <template #actions>
          <BaseButton color="primary" @click="showModal = true" label="Camper" icon="add"/>
        </template>
      </ViewHeader>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filter-gender="filterGender"
        v-model:filter-age="filterAge"
        v-model:filter-session="filterSession"
        :filters="campersFilters"
        :filtered-count="filteredCampers.length"
        :total-count="campersStore.campers.length"
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="viewMode" />
        </template>
      </FilterBar>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="campers-grid">
        <CamperCard
          v-for="camper in filteredCampers"
          :key="camper.id"
          :camper="camper"
          :formatted-gender="formatGender(camper.gender)"
          :session-name="getSessionName(camper.sessionId)"
          @click="selectCamper(camper.id)"
        />

        <EmptyState
          v-if="
            filteredCampers.length === 0 && campersStore.campers.length === 0
          "
          type="empty"
          title="No Campers Yet"
          message="Add your first camper to start managing registrations and camp activities."
          action-text="Camper"
          @action="showModal = true"
          icon-name="UsersRound"
        />

        <EmptyState
          v-if="filteredCampers.length === 0 && campersStore.campers.length > 0"
          type="no-results"
          title="No Campers Found"
          message="No campers match your current filters. Try adjusting your search criteria."
          action-text="Clear Filters"
          no-action-icon
          action-button-class="btn-secondary"
          @action="clearFilters"
          icon-name="UsersRound"
        />
      </div>

      <!-- Table View -->
      <DataTable
        v-if="viewMode === 'table'"
        :columns="camperColumns"
        :data="filteredCampers"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        row-key="id"
      >
        <template #cell-name="{ item }">
          <div class="camper-name-content">
            <AvatarInitials
              :first-name="item.firstName"
              :last-name="item.lastName"
              size="sm"
            />
            <div class="camper-fullname">
              {{ item.firstName }} {{ item.lastName }}
            </div>
          </div>
        </template>

        <template #cell-gender="{ item }">
          <span class="badge badge-primary badge-sm">{{
            formatGender(item.gender)
          }}</span>
        </template>

        <template #cell-session="{ item }">
          <span v-if="item.sessionId" class="badge badge-info badge-sm">
            {{ getSessionName(item.sessionId) }}
          </span>
          <span v-else class="text-secondary">Not registered</span>
        </template>

        <template #cell-allergies="{ item }">
          <span
            v-if="item.allergies && item.allergies.length > 0"
            class="badge badge-warning badge-sm"
          >
            {{ item.allergies.length }} allergy(ies)
          </span>
          <span v-else class="text-caption">None</span>
        </template>

        <template #cell-actions="{ item }">
          <BaseButton outline color="grey-8" size="sm" @click.stop="selectCamper(item.id)" label="View Details" />
        </template>
      </DataTable>

      <!-- Camper Detail Modal -->
      <CamperDetailModal
        v-if="!!selectedCamperId"
        :camper="selectedCamper"
        @close="selectedCamperId = null"
        @edit="editCamper"
        @delete="deleteCamperConfirm"
      >
        <template #session>
          <div v-if="selectedCamper?.sessionId">
            <span class="badge badge-info">
              {{ getSessionName(selectedCamper.sessionId) }}
            </span>
            <div class="text-xs text-secondary mt-1">
              {{ getSessionDateRange(selectedCamper.sessionId) }}
            </div>
          </div>
          <div v-else class="text-secondary">Not registered for a session</div>
        </template>
        <template #family-group>
          <div
            v-if="
              selectedCamper?.familyGroupId &&
              getGroupById(selectedCamper.familyGroupId)
            "
          >
            <div class="family-group-info">
              <span
                v-if="getGroupById(selectedCamper.familyGroupId)"
                class="badge"
                :style="{
                  background: getGroupColor(
                    getGroupById(selectedCamper.familyGroupId)!,
                  ),
                }"
              >
                {{ getGroupById(selectedCamper.familyGroupId)!.name }}
              </span>
              <div
                v-if="getGroupById(selectedCamper.familyGroupId)?.housingRoomId"
                class="text-xs text-secondary mt-1"
              >
                Room:
                {{
                  getSleepingRoomName(
                    getGroupById(selectedCamper.familyGroupId)?.housingRoomId ||
                      "",
                  )
                }}
              </div>
            </div>
          </div>
          <div v-else class="text-secondary">
            Not assigned to a family group
          </div>
        </template>
        <template #events>
          <EventsByDate
            :events="selectedCamper ? getCamperEvents(selectedCamper.id) : []"
            empty-message="No events enrolled"
          />
        </template>
      </CamperDetailModal>

      <!-- Add/Edit Camper Modal -->
      <CamperFormModal
        v-if="showModal"
        :is-editing="!!editingCamperId"
        :form-data="formData"
        :groups="
          groupsStore.getGroupsByType({ hasHousing: true, hasSession: true })
        "
        :sessions="sessionsStore.sessions"
        @close="closeModal"
        @save="saveCamper"
      />

      <!-- Confirmation Modal -->
      <ConfirmModal
        v-if="showConfirmModal"
        title="Delete Camper"
        :message="`Are you sure you want to delete ${camperToDelete?.name}?`"
        details="This action cannot be undone. The camper will be removed from all events and their housing room assignment."
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleConfirmDelete"
        @cancel="handleCancelDelete"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  useCampersStore,
  useSessionsStore,
  useEventsStore,
  useHousingRoomsStore,
  useColorsStore,
  useGroupsStore,
} from "@/stores";
import { format } from "date-fns";
import type { Camper, Event, Group } from "@/types";
import ViewHeader from "@/components/ViewHeader.vue";
import AvatarInitials from "@/components/AvatarInitials.vue";
import CamperCard from "@/components/cards/CamperCard.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar, { type Filter } from "@/components/FilterBar.vue";
import EventsByDate from "@/components/EventsByDate.vue";
import DataTable from "@/components/DataTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import Autocomplete from "@/components/Autocomplete.vue";
import EmptyState from "@/components/EmptyState.vue";
import CamperDetailModal from "@/components/modals/CamperDetailModal.vue";
import CamperFormModal from "@/components/modals/CamperFormModal.vue";

export default defineComponent({
  name: "Campers",
  components: {
    ViewHeader,
    AvatarInitials,
    CamperCard,
    ConfirmModal,
    FilterBar,
    EventsByDate,
    DataTable,
    ViewToggle,
    Autocomplete,
    EmptyState,
    CamperDetailModal,
    CamperFormModal,
  },
  data() {
    return {
      selectedCamperId: null as string | null,
      showModal: false,
      editingCamperId: null as string | null,
      allergiesInput: "",
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      showConfirmModal: false,
      camperToDelete: null as { id: string; name: string } | null,
      formData: {
        firstName: "",
        lastName: "",
        age: 8,
        gender: "male" as "male" | "female",
        parentContact: "",
        allergies: [] as string[],
        medicalNotes: "",
        sessionId: "" as string | undefined,
        familyGroupId: "" as string | undefined,
      },
      searchQuery: "",
      filterGender: "",
      filterAge: "",
      filterSession: "",
      camperColumns: [
        { key: "name", label: "Name", width: "200px" },
        { key: "age", label: "Age", width: "80px" },
        { key: "gender", label: "Gender", width: "100px" },
        { key: "session", label: "Session", width: "150px" },
        { key: "parentContact", label: "Parent Contact", width: "250px" },
        { key: "allergies", label: "Allergies", width: "120px" },
        { key: "actions", label: "Actions", width: "140px" },
      ],
    };
  },
  computed: {
    campersStore() {
      return useCampersStore();
    },
    sessionsStore() {
      return useSessionsStore();
    },
    eventsStore() {
      return useEventsStore();
    },
    housingRoomsStore() {
      return useHousingRoomsStore();
    },
    colorsStore() {
      return useColorsStore();
    },
    groupsStore() {
      return useGroupsStore();
    },
    campersFilters(): Filter[] {
      return [
        {
          model: "filterSession",
          value: this.filterSession,
          placeholder: "Filter by Session",
          options: this.sessionsStore.sessions.map((session) => ({
            label: session.name,
            value: session.id,
          })),
        },
        {
          model: "filterGender",
          value: this.filterGender,
          placeholder: "Filter by Gender",
          options: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ],
        },
        {
          model: "filterAge",
          value: this.filterAge,
          placeholder: "Filter by Age",
          options: [
            { label: "6-8 years", value: "6-8" },
            { label: "9-11 years", value: "9-11" },
            { label: "12-14 years", value: "12-14" },
            { label: "15+ years", value: "15+" },
          ],
        },
      ];
    },
    selectedCamper(): Camper | null {
      if (!this.selectedCamperId) return null;
      return this.campersStore.getCamperById(this.selectedCamperId) || null;
    },
    filteredCampers(): Camper[] {
      let campers: Camper[] = this.campersStore.campers;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        campers = campers.filter(
          (camper: Camper) =>
            camper.firstName.toLowerCase().includes(query) ||
            camper.lastName.toLowerCase().includes(query) ||
            `${camper.firstName} ${camper.lastName}`
              .toLowerCase()
              .includes(query),
        );
      }

      // Session filter
      if (this.filterSession) {
        campers = campers.filter(
          (camper: Camper) => camper.sessionId === this.filterSession,
        );
      }

      // Gender filter
      if (this.filterGender) {
        campers = campers.filter(
          (camper: Camper) => camper.gender === this.filterGender,
        );
      }

      // Age filter
      if (this.filterAge) {
        const [min, max] =
          this.filterAge === "15+"
            ? [15, 999]
            : this.filterAge.split("-").map(Number);
        campers = campers.filter(
          (camper: Camper) =>
            camper.age >= min && (max ? camper.age <= max : true),
        );
      }

      return campers;
    },
  },
  methods: {
    clearFilters(): void {
      this.searchQuery = "";
      this.filterGender = "";
      this.filterAge = "";
      this.filterSession = "";
    },
    getGroupColor(group: Group): string {
      if (group.colorId) {
        const color = this.colorsStore.getColorById(group.colorId);
        return color?.hexValue || "#6366F1";
      }
      return "#6366F1";
    },
    getCamperEvents(camperId: string): Event[] {
      const events = this.eventsStore.camperEvents(camperId);
      return events;
    },
    formatDate(dateStr: string): string {
      return format(new Date(dateStr), "MMMM d, yyyy");
    },
    getSleepingRoomName(housingRoomId: string): string {
      const room = this.housingRoomsStore.getHousingRoomById(housingRoomId);
      return room?.name || "Unknown Room";
    },
    getGroupById(groupId: string): Group | null | undefined {
      return this.groupsStore.getGroupById(groupId);
    },
    formatGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    getSessionName(sessionId: string | undefined): string {
      if (!sessionId) return "No session";
      const session = this.sessionsStore.sessions.find(
        (s) => s.id === sessionId,
      );
      return session?.name || "Unknown Session";
    },
    getSessionDateRange(sessionId: string | undefined): string {
      if (!sessionId) return "";
      const session = this.sessionsStore.sessions.find(
        (s) => s.id === sessionId,
      );
      if (!session) return "Unknown";
      const startDate = new Date(session.startDate).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" },
      );
      const endDate = new Date(session.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${startDate} - ${endDate}`;
    },
    selectCamper(camperId: string): void {
      this.selectedCamperId = camperId;
    },
    editCamper(): void {
      if (!this.selectedCamper) return;

      this.editingCamperId = this.selectedCamper.id;
      this.formData = {
        firstName: this.selectedCamper.firstName,
        lastName: this.selectedCamper.lastName,
        age: this.selectedCamper.age,
        gender: this.selectedCamper.gender,
        parentContact: this.selectedCamper.parentContact,
        allergies: this.selectedCamper.allergies || [],
        medicalNotes: this.selectedCamper.medicalNotes || "",
        sessionId: this.selectedCamper.sessionId,
        familyGroupId: this.selectedCamper.familyGroupId,
      };
      this.allergiesInput = (this.selectedCamper.allergies || []).join(", ");

      this.selectedCamperId = null;
      this.showModal = true;
    },
    async saveCamper(
      formData: typeof this.formData & { allergies: string[] },
    ): Promise<void> {
      const camperData: Camper = {
        id: this.editingCamperId || `camper-${Date.now()}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age,
        gender: formData.gender,
        parentContact: formData.parentContact,
        allergies: formData.allergies,
        medicalNotes: formData.medicalNotes,
        sessionId: formData.sessionId || undefined,
        familyGroupId: formData.familyGroupId || undefined,
        registrationDate: this.editingCamperId
          ? this.campersStore.getCamperById(this.editingCamperId)
              ?.registrationDate
          : new Date().toISOString(),
      };

      if (this.editingCamperId) {
        await this.campersStore.updateCamper(camperData);
      } else {
        await this.campersStore.addCamper(camperData);
      }

      this.closeModal();
    },
    deleteCamperConfirm(): void {
      if (!this.selectedCamperId) return;
      const camper = this.campersStore.getCamperById(this.selectedCamperId);
      if (!camper) return;

      this.camperToDelete = {
        id: this.selectedCamperId,
        name: `${camper.firstName} ${camper.lastName}`,
      };
      this.showConfirmModal = true;
    },
    async handleConfirmDelete(): Promise<void> {
      if (!this.camperToDelete) return;

      await this.campersStore.deleteCamper(this.camperToDelete.id);
      this.selectedCamperId = null;
      this.showConfirmModal = false;
      this.camperToDelete = null;
    },
    handleCancelDelete(): void {
      this.showConfirmModal = false;
      this.camperToDelete = null;
    },
    closeModal(): void {
      this.showModal = false;
      this.editingCamperId = null;
      this.formData = {
        firstName: "",
        lastName: "",
        age: 8,
        gender: "male",
        parentContact: "",
        allergies: [],
        medicalNotes: "",
        sessionId: undefined,
        familyGroupId: undefined,
      };
      this.allergiesInput = "";
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    filterGender() {
      this.currentPage = 1;
    },
    filterAge() {
      this.currentPage = 1;
    },
  },
});
</script>

<style scoped>
.campers-view {
  max-width: 1400px;
  margin: 0 auto;
}

.campers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.campers-grid .empty-state {
  grid-column: 1 / -1;
}

.family-group-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Table View Styles */
/* Table cell custom styles */
.camper-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.camper-avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.camper-fullname {
  font-weight: 500;
  color: var(--text-primary);
}

.event-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>
