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
                  isEndTimeAfterStart(val) || 'End time must be after start time',
              ]"
            />
          </div>
        </div>

        <div v-if="duration" class="row items-center gap-1 text-grey-8">
          <Icon name="Clock" :size="16" />
          <span>Duration: {{ duration }}</span>
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
        },
      } as TimeBlockCreationRequest,
      formRef: null as any,
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
      },
    };
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
  },
  methods: {
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

.duration-display {
  /* display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius);
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem; */
}

@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>

