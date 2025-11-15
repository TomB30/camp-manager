<template>
  <BaseModal
    :title="isEditing ? 'Edit Time Block' : 'Create Time Block'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Name</label>
          <BaseInput
            v-model="formData.meta.name"
            placeholder="Enter name (e.g., Morning Session)"
            :rules="[(val: string) => !!val || 'Enter name']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <BaseInput
            v-model="descriptionModel"
            type="textarea"
            :rows="2"
            placeholder="Optional description"
          />
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <BaseInput
              v-model="formData.spec.startTime"
              type="time"
              placeholder="Start time"
              :rules="[(val: string) => !!val || 'Enter start time']"
            />
          </div>

          <div class="form-group">
            <label class="form-label">End Time</label>
            <BaseInput
              v-model="formData.spec.endTime"
              type="time"
              placeholder="End time"
              :rules="[
                (val: string) => !!val || 'Enter end time',
                (val: string) =>
                  isEndTimeAfterStart(val) ||
                  'End time must be after start time',
              ]"
            />
          </div>
        </div>

        <div v-if="duration" class="row items-center gap-1 text-grey-8">
          <Icon name="Clock" :size="16" />
          <span>Duration: {{ duration }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Active Days</label>
          <p class="form-help-text">
            Select which days this time block applies to. Leave empty for all
            days.
          </p>
          <div class="days-selector">
            <button
              v-for="day in daysOfWeek"
              :key="day.value"
              type="button"
              class="day-button"
              :class="{ active: selectedDays.includes(day.value) }"
              @click="toggleDay(day.value)"
            >
              {{ day.label }}
              <q-tooltip>{{
                day.value.charAt(0).toUpperCase() + day.value.slice(1)
              }}</q-tooltip>
            </button>
          </div>
          <div v-if="selectedDays.length > 0" class="selected-days-display">
            <span class="">Active on: </span>
            <span class="text-primary">{{ selectedDaysText }}</span>
          </div>
          <div v-else class="selected-days-display">
            <span class="">Active on all days</span>
          </div>
        </div>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton
          color="primary"
          @click="handleSave"
          :label="isEditing ? 'Update' : 'Create'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import Icon from "@/components/Icon.vue";
import type { TimeBlock, TimeBlockCreationRequest } from "@/generated/api";
import type { QForm } from "quasar";
import { useTimeBlocksStore } from "@/stores";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "TimeBlockFormModal",
  setup() {
    const toast = useToast();
    return {
      toast,
    };
  },
  components: {
    BaseModal,
    BaseInput,
    Icon,
  },
  props: {
    timeBlockId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close"],
  data() {
    return {
      timeBlocksStore: useTimeBlocksStore(),
      loading: false,
      formData: {
        meta: {
          name: "",
          description: "",
        },
        spec: {
          startTime: "",
          endTime: "",
          daysOfWeek: [] as string[],
        },
      } as TimeBlockCreationRequest,
      formRef: null as any,
      selectedDays: [] as string[],
      daysOfWeek: [
        { label: "S", value: "sunday" },
        { label: "M", value: "monday" },
        { label: "T", value: "tuesday" },
        { label: "W", value: "wednesday" },
        { label: "T", value: "thursday" },
        { label: "F", value: "friday" },
        { label: "S", value: "saturday" },
      ],
    };
  },
  created() {
    if (!this.timeBlockId) return;

    const timeBlock: TimeBlock | undefined =
      this.timeBlocksStore.getTimeBlockById(this.timeBlockId);
    if (!timeBlock) return;

    this.formData = {
      meta: {
        name: timeBlock.meta.name,
        description: timeBlock.meta.description,
      },
      spec: {
        startTime: timeBlock.spec.startTime,
        endTime: timeBlock.spec.endTime,
        daysOfWeek: timeBlock.spec.daysOfWeek || [],
      },
    };

    // Set selected days from the time block
    if (timeBlock.spec.daysOfWeek) {
      this.selectedDays = [...timeBlock.spec.daysOfWeek];
    }
  },
  computed: {
    isEditing(): boolean {
      return !!this.timeBlockId;
    },
    descriptionModel: {
      get(): string {
        return this.formData.meta.description || "";
      },
      set(value: string) {
        this.formData.meta.description = value || "";
      },
    },
    duration(): string {
      if (!this.formData.spec.startTime || !this.formData.spec.endTime) {
        return "";
      }

      const start = this.parseTime(this.formData.spec.startTime);
      const end = this.parseTime(this.formData.spec.endTime);
      const diffMs = end.getTime() - start.getTime();

      if (diffMs <= 0) return "";

      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      if (hours === 0) {
        return `${mins} minutes`;
      } else if (mins === 0) {
        return `${hours} hour${hours > 1 ? "s" : ""}`;
      }
      return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minutes`;
    },
    selectedDaysText(): string {
      const dayMap: Record<string, string> = {
        sunday: "Sunday",
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
      };
      return this.selectedDays.map((day) => dayMap[day]).join(", ");
    },
  },
  methods: {
    toggleDay(day: string) {
      const index = this.selectedDays.indexOf(day);
      if (index > -1) {
        this.selectedDays.splice(index, 1);
      } else {
        this.selectedDays.push(day);
      }
    },
    parseTime(timeString: string): Date {
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    },
    isEndTimeAfterStart(endTime: string): boolean {
      if (!this.formData.spec.startTime || !endTime) return true;

      const start = this.parseTime(this.formData.spec.startTime);
      const end = this.parseTime(endTime);
      return end.getTime() > start.getTime();
    },
    async handleSave(): Promise<void> {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      // Update formData with selected days
      this.formData.spec.daysOfWeek =
        this.selectedDays.length > 0 ? (this.selectedDays as any) : undefined;

      if (this.isEditing) {
        return this.handleUpdate();
      }
      return this.handleCreate();
    },
    async handleUpdate(): Promise<void> {
      try {
        if (!this.timeBlockId) return;
        this.loading = true;
        await this.timeBlocksStore.updateTimeBlock(
          this.timeBlockId,
          this.formData,
        );
        this.toast.success("Time block updated successfully");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to update time block",
        );
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
    async handleCreate(): Promise<void> {
      try {
        this.loading = true;
        await this.timeBlocksStore.createTimeBlock(this.formData);
        this.toast.success("Time block created successfully");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to create time block",
        );
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
  },
});
</script>

<style scoped>
.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.form-help-text {
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.days-selector {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.day-button {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #e8eaf6;
  color: #5c6bc0;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-button:hover {
  background: #c5cae9;
}

.day-button.active {
  background: #5c6bc0;
  color: white;
}

.selected-days-display {
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
