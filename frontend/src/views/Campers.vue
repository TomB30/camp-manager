<template>
  <div class="view">
    <TabHeader
      title="Campers"
      description="Manage your campers and their registrations, allergies, and sessions."
      action-text="Camper"
      @action="showModal = true"
    />

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

    <TransitionGroup
      v-if="viewMode === 'grid'"
      name="list"
      tag="div"
      class="campers-grid"
    >
      <CamperCard
        v-for="camper in filteredCampers"
        :key="camper.meta.id"
        :camper="camper"
        :formatted-gender="formatGender(camper.spec.gender)"
        :session-name="getSessionName(camper.spec.sessionId)"
        @click="selectCamper(camper.meta.id)"
      />

      <EmptyState
        v-if="filteredCampers.length === 0 && campersStore.campers.length === 0"
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
    </TransitionGroup>

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
            :first-name="item.spec.firstName"
            :last-name="item.spec.lastName"
            size="sm"
          />
          <div class="camper-fullname">
            {{ item.spec.firstName }} {{ item.spec.lastName }}
          </div>
        </div>
      </template>

      <template #cell-age="{ item }">
        {{ calculateAge(item.spec.birthday) }}
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
        <BaseButton
          outline
          color="grey-8"
          size="sm"
          @click="selectCamper(item.meta.id)"
          label="View Details"
        />
      </template>
    </DataTable>

    <CamperDetailModal
      v-if="!!selectedCamperId"
      :camper="selectedCamper"
      @close="selectedCamperId = null"
      @edit="editCamper"
      @delete="deleteCamperConfirm"
    />

    <CamperFormModal
      v-if="showModal"
      :camper-id="editingCamperId || undefined"
      @close="closeModal"
    />

    <ConfirmModal
      v-if="showConfirmModal"
      title="Delete Camper"
      :message="`Are you sure you want to delete ${camperToDelete?.name}?`"
      details="This action cannot be undone. The camper will be removed from all events and their housing assignment."
      confirm-text="Delete"
      :danger-mode="true"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useCampersStore, useSessionsStore } from "@/stores";
import type { Camper } from "@/generated/api";
import AvatarInitials from "@/components/AvatarInitials.vue";
import CamperCard from "@/components/cards/CamperCard.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar, { type Filter } from "@/components/FilterBar.vue";
import DataTable from "@/components/DataTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import EmptyState from "@/components/EmptyState.vue";
import CamperDetailModal from "@/components/modals/CamperDetailModal.vue";
import CamperFormModal from "@/components/modals/CamperFormModal.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import Icon from "@/components/Icon.vue";
import { dateUtils } from "@/utils/dateUtils";

export default defineComponent({
  name: "Campers",
  components: {
    AvatarInitials,
    CamperCard,
    ConfirmModal,
    FilterBar,
    DataTable,
    ViewToggle,
    EmptyState,
    CamperDetailModal,
    CamperFormModal,
    TabHeader,
    Icon,
  },
  data() {
    return {
      selectedCamperId: null as string | null,
      showModal: false,
      editingCamperId: null as string | null,
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      showConfirmModal: false,
      camperToDelete: null as { id: string; name: string } | null,
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
    campersFilters(): Filter[] {
      return [
        {
          model: "filterSession",
          value: this.filterSession,
          placeholder: "Filter by Session",
          options: this.sessionsStore.sessions.map((session) => ({
            label: session.meta.name,
            value: session.meta.id,
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
            camper.meta.name.split(" ")[0].toLowerCase().includes(query) ||
            camper.meta.name
              .split(" ")
              .slice(1)
              .join(" ")
              .toLowerCase()
              .includes(query) ||
            `${camper.meta.name.split(" ")[0]} ${camper.meta.name.split(" ").slice(1).join(" ")}`
              .toLowerCase()
              .includes(query)
        );
      }

      // Session filter
      if (this.filterSession) {
        campers = campers.filter(
          (camper: Camper) => camper.spec.sessionId === this.filterSession
        );
      }

      // Gender filter
      if (this.filterGender) {
        campers = campers.filter(
          (camper: Camper) => camper.spec.gender === this.filterGender
        );
      }

      // Age filter - calculate age from birthday
      if (this.filterAge) {
        const [min, max] =
          this.filterAge === "15+"
            ? [15, 999]
            : this.filterAge.split("-").map(Number);
        campers = campers.filter((camper: Camper) => {
          const age = camper.spec.birthday
            ? dateUtils.calculateAge(camper.spec.birthday)
            : 0;
          return age >= min && (max ? age <= max : true);
        });
      }

      return campers;
    },
  },
  methods: {
    calculateAge(birthday: string): number {
      return birthday ? dateUtils.calculateAge(birthday) : 0;
    },
    clearFilters(): void {
      this.searchQuery = "";
      this.filterGender = "";
      this.filterAge = "";
      this.filterSession = "";
    },
    formatGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    getSessionName(sessionId: string | undefined): string {
      if (!sessionId) return "No session";
      const session = this.sessionsStore.sessions.find(
        (s) => s.meta.id === sessionId
      );
      return session?.meta.name || "Unknown Session";
    },
    selectCamper(camperId: string): void {
      this.selectedCamperId = camperId;
    },
    editCamper(): void {
      if (!this.selectedCamper) return;

      this.editingCamperId = this.selectedCamper.meta.id;
      this.selectedCamperId = null;
      this.showModal = true;
    },
    deleteCamperConfirm(): void {
      if (!this.selectedCamperId) return;
      const camper = this.campersStore.getCamperById(this.selectedCamperId);
      if (!camper) return;

      this.camperToDelete = {
        id: this.selectedCamperId,
        name: `${camper.meta.name.split(" ")[0]} ${camper.meta.name.split(" ").slice(1).join(" ")}`,
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
.campers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: .5rem;
}

.campers-grid .empty-state {
  grid-column: 1 / -1;
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
