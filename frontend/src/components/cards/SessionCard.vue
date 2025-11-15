<template>
  <div
    class="session-card card clickable"
    @click="$emit('click', session.meta.id)"
  >
    <div class="card-header">
      <div class="session-icon card-icon">
        <Icon name="CalendarDays" :size="24" />
      </div>
      <div class="session-title-section">
        <h3 class="session-name">{{ session.meta.name }}</h3>
        <p v-if="session.meta.description" class="session-description">
          {{ session.meta.description }}
        </p>
      </div>
    </div>

    <div class="session-details">
      <div class="session-detail">
        <Icon name="Calendar" :size="16" class="detail-icon" />
        <span class="detail-label">Dates:</span>
        <span class="detail-value"
          >{{ formatDate(session.spec.startDate) }} -
          {{ formatDate(session.spec.endDate) }}</span
        >
      </div>

      <div class="session-detail">
        <Icon name="Clock" :size="16" class="detail-icon" />
        <span class="detail-label">Duration:</span>
        <span class="detail-value">{{
          dateUtils.calculateDuration(
            session.spec.startDate,
            session.spec.endDate,
          )
        }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Session } from "@/generated/api";
import Icon from "../Icon.vue";
import { dateUtils } from "@/utils/dateUtils";

export default defineComponent({
  name: "SessionCard",
  components: {
    Icon,
  },
  props: {
    session: {
      type: Object as PropType<Session>,
      required: true,
    },
  },
  emits: ["click"],
  data() {
    return {
      dateUtils,
    };
  },
  methods: {
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
});
</script>

<style scoped>
.session-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.session-title-section {
  flex: 1;
  min-width: 0;
}

.session-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.session-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.session-details {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.session-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.detail-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.detail-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .session-details {
    flex-direction: column;
    gap: 0;
  }
}
</style>
