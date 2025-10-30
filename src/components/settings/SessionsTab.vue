<template>
  <div class="sessions-tab">
    <TabHeader
      title="Camp Sessions"
      description="Define the time periods (weeks, months, or custom durations) that campers can register for at your camp."
      action-text="Session"
      @action="showFormModal = true"
    >
      <template #action-icon>
        <Icon name="Plus" :size="18" />
      </template>
    </TabHeader>

    <FilterBar
      v-if="sessionsStore.sessions.length > 0"
      v-model:searchQuery="searchQuery"
      :filtered-count="filteredSessions.length"
      :total-count="sessionsStore.sessions.length"
      @clear="clearFilters"
    />

    <EmptyState
      v-if="sessionsStore.sessions.length === 0"
      type="empty"
      title="No Sessions Yet"
      message="Add your first session to define the registration periods for your camp."
      action-text="Session"
      @action="showFormModal = true"
      icon-name="CalendarDays"
    />

    <div v-else class="sessions-list">
      <SessionCard
        v-for="session in filteredSessions"
        :key="session.meta.id"
        :session="session"
        @click="selectSession"
      />
    </div>

    <SessionDetailModal
      v-if="!!selectedSession"
      :session="selectedSession"
      @close="selectedSessionId = null"
      @edit="editSessionFromDetail"
      @delete="deleteSessionConfirm"
    />

    <SessionFormModal
      v-if="showFormModal"
      :session-id="editingSession?.meta.id"
      @close="closeModal"
    />

    <ConfirmModal
      v-if="showConfirmModal"
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
import type { Session } from "@/generated/api";
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
      showFormModal: false as boolean,
      showConfirmModal: false as boolean,
      editingSession: null as Session | null,
      selectedSessionId: null as string | null,
      sessionToDelete: null as Session | null,
      searchQuery: "" as string,
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
            session.meta.name.toLowerCase().includes(query) ||
            session.meta.description?.toLowerCase().includes(query),
        );
      }

      // Sort by start date
      return [...filtered].sort((a, b) => {
        return (
          new Date(a.spec.startDate).getTime() -
          new Date(b.spec.startDate).getTime()
        );
      });
    },
    selectedSession(): Session | null {
      if (!this.selectedSessionId) return null;
      return this.sessionsStore.getSessionById(this.selectedSessionId) || null;
    },
  },
  methods: {
    selectSession(id: string): void {
      this.selectedSessionId = id;
    },
    editSessionFromDetail(session: Session): void {
      this.selectedSessionId = null;
      this.editSession(session);
    },
    editSession(session: Session): void {
      this.editingSession = session;
      this.showFormModal = true;
    },
    deleteSessionConfirm(id: string): void {
      const session = this.sessionsStore.getSessionById(id);
      if (session) {
        this.sessionToDelete = session;
        this.selectedSessionId = null;
        this.showConfirmModal = true;
      }
    },
    async handleDeleteSession(): Promise<void> {
      if (!this.sessionToDelete) return;

      try {
        await this.sessionsStore.deleteSession(this.sessionToDelete.meta.id);
        this.toast.success("Session deleted successfully");
        this.showConfirmModal = false;
        this.sessionToDelete = null;
      } catch (error: any) {
        this.toast.error(error.message || "Failed to delete session");
      }
    },
    closeModal(): void {
      this.showFormModal = false;
      this.editingSession = null;
    },
    clearFilters(): void {
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
  gap: 1rem;
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
