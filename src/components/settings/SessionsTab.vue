<template>
  <div class="sessions-tab">
    <TabHeader
      title="Camp Sessions"
      description="Define the time periods (weeks, months, or custom durations) that campers can register for at your camp."
      action-text="Session"
      @action="showAddModal = true"
    >
      <template #action-icon>
        <Icon name="Plus" :size="18" />
      </template>
    </TabHeader>

    <!-- Search and Filters -->
    <FilterBar
      v-if="sessionsStore.sessions.length > 0"
      v-model:searchQuery="searchQuery"
      :filters="[]"
      :filtered-count="filteredSessions.length"
      :total-count="sessionsStore.sessions.length"
      @clear="clearFilters"
    />

    <!-- Empty State -->
    <EmptyState
      v-if="sessionsStore.sessions.length === 0"
      type="empty"
      title="No Sessions Yet"
      message="Add your first session to define the registration periods for your camp."
      action-text="Session"
      @action="showAddModal = true"
      icon-name="CalendarDays"
    />

    <!-- Sessions List -->
    <div v-else class="sessions-list">
      <SessionCard
        v-for="session in filteredSessions"
        :key="session.id"
        :session="session"
        @click="selectSession"
      />
    </div>

    <!-- Session Detail Modal -->
    <SessionDetailModal
      :show="!!selectedSessionId"
      :session="selectedSession"
      @close="selectedSessionId = null"
      @edit="editSessionFromDetail"
      @delete="deleteSessionConfirm"
    />

    <!-- Add/Edit Session Modal -->
    <SessionFormModal
      :show="showAddModal || showEditModal"
      :is-editing="!!editingSession"
      :form-data="formData"
      @close="closeModal"
      @save="saveSession"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :show="showConfirmModal"
      title="Delete Session"
      message="Are you sure you want to delete this session?"
      confirm-text="Delete"
      :danger-mode="true"
      @confirm="handleDeleteSession"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useSessionsStore } from "@/stores";
import type { Session } from "@/types";
import Icon from "@/components/Icon.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import SessionCard from "@/components/cards/SessionCard.vue";
import SessionDetailModal from "@/components/modals/SessionDetailModal.vue";
import SessionFormModal from "@/components/modals/SessionFormModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar from "@/components/FilterBar.vue";
import EmptyState from "@/components/EmptyState.vue";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "SessionsTab",
  components: {
    Icon,
    TabHeader,
    SessionCard,
    SessionDetailModal,
    SessionFormModal,
    ConfirmModal,
    FilterBar,
    EmptyState,
  },
  setup() {
    const sessionsStore = useSessionsStore();
    const toast = useToast();
    return { sessionsStore, toast };
  },
  data() {
    return {
      showAddModal: false,
      showEditModal: false,
      showConfirmModal: false,
      editingSession: null as Session | null,
      selectedSessionId: null as string | null,
      sessionToDelete: null as Session | null,
      searchQuery: "",
      formData: {
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        maxCampers: undefined as number | undefined,
      },
    };
  },
  computed: {
    filteredSessions(): Session[] {
      let filtered = this.sessionsStore.sessions;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (session) =>
            session.name.toLowerCase().includes(query) ||
            session.description?.toLowerCase().includes(query),
        );
      }

      // Sort by start date
      return [...filtered].sort((a, b) => {
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      });
    },

    selectedSession(): Session | null {
      if (!this.selectedSessionId) return null;
      return this.sessionsStore.getSessionById(this.selectedSessionId) || null;
    },
  },
  methods: {
    selectSession(id: string) {
      this.selectedSessionId = id;
    },

    editSessionFromDetail(session: Session) {
      this.selectedSessionId = null;
      this.editSession(session);
    },

    editSession(session: Session) {
      this.editingSession = session;
      this.formData = {
        name: session.name,
        startDate: session.startDate,
        endDate: session.endDate,
        description: session.description || "",
        maxCampers: session.maxCampers,
      };
      this.showEditModal = true;
    },

    deleteSessionConfirm(id: string) {
      const session = this.sessionsStore.getSessionById(id);
      if (session) {
        this.sessionToDelete = session;
        this.selectedSessionId = null;
        this.showConfirmModal = true;
      }
    },

    async handleDeleteSession() {
      if (!this.sessionToDelete) return;

      try {
        await this.sessionsStore.deleteSession(this.sessionToDelete.id);
        this.toast.success("Session deleted successfully");
        this.showConfirmModal = false;
        this.sessionToDelete = null;
      } catch (error: any) {
        this.toast.error(error.message || "Failed to delete session");
      }
    },

    async saveSession(data: {
      name: string;
      startDate: string;
      endDate: string;
      description: string;
      maxCampers?: number;
    }) {
      try {
        if (this.editingSession) {
          // Update existing
          await this.sessionsStore.updateSession({
            ...this.editingSession,
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            description: data.description || undefined,
            maxCampers: data.maxCampers,
            updatedAt: new Date().toISOString(),
          });
          this.toast.success("Session updated successfully");
        } else {
          // Create new
          await this.sessionsStore.addSession({
            id: crypto.randomUUID(),
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            description: data.description || undefined,
            maxCampers: data.maxCampers,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this.toast.success("Session added successfully");
        }
        this.closeModal();
      } catch (error: any) {
        this.toast.error(error.message || "Failed to save session");
      }
    },

    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.editingSession = null;
      this.formData = {
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        maxCampers: undefined,
      };
    },

    clearFilters() {
      this.searchQuery = "";
    },
  },
});
</script>

<style scoped>
.sessions-tab {
  animation: slideIn 0.3s ease;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .sessions-list {
    gap: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
