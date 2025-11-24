<template>
  <BaseModal @close="cancel" modal-width="sm">
    <template #header>
      <h3>Delete Event</h3>
    </template>
    <template #body>
      <div class="delete-modal-content">
        <p class="event-name">{{ eventName }}</p>

        <div v-if="isRecurring" class="scope-options">
          <p class="scope-header">
            This is a recurring event. Choose deletion scope:
          </p>

          <div class="scope-option">
            <q-radio v-model="selectedScope" val="single" color="primary">
              <div class="scope-label">
                <div class="scope-title">This event only</div>
                <div class="scope-description">Delete only this occurrence</div>
              </div>
            </q-radio>
          </div>

          <div class="scope-option">
            <q-radio v-model="selectedScope" val="future" color="primary">
              <div class="scope-label">
                <div class="scope-title">This and future events</div>
                <div class="scope-description">
                  Delete this event and all future occurrences
                </div>
              </div>
            </q-radio>
          </div>

          <div class="scope-option">
            <q-radio v-model="selectedScope" val="all" color="primary">
              <div class="scope-label">
                <div class="scope-title">All events in series</div>
                <div class="scope-description">
                  Delete the entire recurring series
                </div>
              </div>
            </q-radio>
          </div>
        </div>

        <div v-else class="single-event-message">
          <p>Are you sure you want to delete this event?</p>
        </div>

        <p class="warning-message">
          <Icon name="AlertTriangle" :size="16" />
          This action cannot be undone. All assigned groups will be removed from
          {{
            isRecurring && selectedScope === "all"
              ? "all events in the series"
              : isRecurring && selectedScope === "future"
                ? "this and future events"
                : "this event"
          }}.
        </p>
      </div>
    </template>
    <template #footer>
      <BaseButton @click="cancel" label="Cancel" flat />
      <BaseButton color="negative" outline @click="confirm" label="Delete" />
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "../BaseModal.vue";
import Icon from "../Icon.vue";
import type { Event } from "@/generated/api";

export default defineComponent({
  name: "EventDeleteModal",
  components: {
    BaseModal,
    Icon,
  },
  props: {
    event: {
      type: Object as PropType<Event | null>,
      required: true,
    },
  },
  emits: ["confirm", "cancel"],
  data() {
    return {
      selectedScope: "single" as "single" | "future" | "all",
    };
  },
  computed: {
    eventName(): string {
      return this.event?.meta.name || "this event";
    },
    isRecurring(): boolean {
      return !!this.event?.spec.recurrenceId;
    },
  },
  methods: {
    confirm() {
      this.$emit("confirm", this.selectedScope);
    },
    cancel() {
      this.$emit("cancel");
    },
  },
});
</script>

<style scoped>
.delete-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0;
}

.scope-header {
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  font-weight: 500;
}

.scope-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.scope-option {
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  transition: all 0.15s ease;
}

.scope-option:hover {
  border-color: var(--primary-color);
  background: var(--surface-secondary);
}

.scope-option :deep(.q-radio) {
  align-items: flex-start;
}

.scope-option :deep(.q-radio__inner) {
  margin-top: 0.125rem;
}

.scope-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-left: 0.5rem;
}

.scope-title {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.scope-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.single-event-message {
  padding: 0.75rem;
  background: var(--surface-secondary);
  border-radius: var(--radius);
}

.single-event-message p {
  margin: 0;
  color: var(--text-primary);
}

.warning-message {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--warning-light, #fff3cd);
  border-left: 3px solid var(--warning-color, #ffc107);
  border-radius: var(--radius);
  font-size: 0.875rem;
  color: var(--warning-dark, #856404);
  margin: 0;
  line-height: 1.5;
}

.warning-message :deep(.icon) {
  flex-shrink: 0;
  margin-top: 0.125rem;
}
</style>
