<template>
  <BaseModal
    title="Import Campers from CSV"
    subtitle="Upload a CSV file to import multiple campers at once"
    modal-width="md"
    @close="$emit('close')"
  >
    <template #body>
      <div class="csv-import-content">
        <!-- Upload Section -->
        <div v-if="!file" class="upload-section">
          <div
            class="upload-dropzone"
            @click="triggerFileInput"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            :class="{ dragging: isDragging }"
          >
            <Icon name="Upload" :size="48" class="upload-icon" />
            <p class="upload-text">
              Click to upload or drag and drop your CSV file
            </p>
            <p class="upload-hint">CSV files only</p>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            @change="handleFileSelect"
            style="display: none"
          />
        </div>

        <!-- File Info Section -->
        <div v-else class="file-info-section">
          <div class="file-info">
            <Icon name="FileText" :size="24" />
            <div class="file-details">
              <p class="file-name">{{ file.name }}</p>
              <p class="file-size">{{ formatFileSize(file.size) }}</p>
            </div>
            <q-btn 
            icon="close"
            color="grey-6"
            flat
            round
            size="sm"
            @click="clearFile"
            />
          </div>

          <!-- Validation Errors -->
          <div v-if="validationErrors.length > 0" class="errors-section">
            <div class="errors-header">
              <Icon name="AlertCircle" :size="20" class="error-icon" />
              <h4>Validation Errors ({{ validationErrors.length }})</h4>
            </div>
            <div class="errors-list">
              <div
                v-for="(error, index) in validationErrors"
                :key="index"
                class="error-item"
              >
                <span class="error-location">Row {{ error.row }}:</span>
                <span class="error-field">{{ error.field }}</span>
                <span class="error-message">{{ error.message }}</span>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="validated && validationErrors.length === 0" class="success-section">
            <Icon name="CheckCircle" :size="20" class="success-icon" />
            <p class="success-message">
              Validation successful! {{ totalRows }} row(s) ready to import.
            </p>
          </div>
        </div>

        <!-- Loading States -->
        <div v-if="validating" class="loading-section">
          <q-spinner color="primary" size="40px" />
          <p>Validating CSV file...</p>
        </div>

        <div v-if="importing" class="loading-section">
          <q-spinner color="primary" size="40px" />
          <p>Importing campers...</p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton
          flat
          @click="$emit('close')"
          label="Cancel"
          :disable="validating || importing"
        />
        <BaseButton
          v-if="!validated && file"
          color="primary"
          @click="validateFile"
          label="Validate"
          :loading="validating"
          :disable="validating"
        />
        <BaseButton
          v-if="validated && validationErrors.length === 0"
          color="primary"
          @click="importFile"
          label="Import Campers"
          :loading="importing"
          :disable="importing"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import Icon from "@/components/Icon.vue";
import { useToast } from "@/composables/useToast";
import * as sdk from "@/generated/api/sdk.gen";
import type { ImportJob, ValidationError } from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export default defineComponent({
  name: "CamperCSVModal",
  components: {
    BaseModal,
    Icon,
  },
  emits: ["close", "imported"],
  data() {
    return {
      file: null as File | null,
      isDragging: false,
      validating: false,
      importing: false,
      validated: false,
      validationErrors: [] as ValidationError[],
      totalRows: 0,
      toast: useToast(),
    };
  },
  methods: {
    triggerFileInput() {
      (this.$refs.fileInput as HTMLInputElement).click();
    },
    handleFileSelect(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.setFile(target.files[0]);
      }
    },
    handleFileDrop(event: DragEvent) {
      this.isDragging = false;
      if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        this.setFile(event.dataTransfer.files[0]);
      }
    },
    setFile(file: File) {
      // Validate file type
      if (!file.name.endsWith(".csv")) {
        this.toast.error("Please select a CSV file");
        return;
      }

      this.file = file;
      this.validated = false;
      this.validationErrors = [];
      this.totalRows = 0;
    },
    clearFile() {
      this.file = null;
      this.validated = false;
      this.validationErrors = [];
      this.totalRows = 0;
      // Reset file input
      const fileInput = this.$refs.fileInput as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    },
    formatFileSize(bytes: number): string {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    },
    async validateFile() {
      if (!this.file) return;

      this.validating = true;
      this.validationErrors = [];

      try {
        const response = await sdk.validateImport({
          client: apiClient,
          path: {
            camp_id: getApiCampId(),
            entity_type: "campers",
          },
          body: {
            file: this.file,
          },
        });

        if (response.error || !response.data) {
          throw new Error("Failed to validate CSV file");
        }

        const importJob = response.data as ImportJob;
        this.totalRows = importJob.totalRows;
        this.validationErrors = importJob.validationErrors || [];
        this.validated = true;

        if (this.validationErrors.length === 0) {
          this.toast.success("CSV validation successful!");
        } else {
          this.toast.error(
            `Validation failed with ${this.validationErrors.length} error(s)`,
          );
        }
      } catch (error: any) {
        console.error("Validation error:", error);
        this.toast.error(
          error?.message || "Failed to validate CSV file. Please try again.",
        );
      } finally {
        this.validating = false;
      }
    },
    async importFile() {
      if (!this.file || this.validationErrors.length > 0) return;

      this.importing = true;

      try {
        const response = await sdk.startImport({
          client: apiClient,
          path: {
            camp_id: getApiCampId(),
            entity_type: "campers",
          },
          query: {
            mode: "create",
          },
          body: {
            file: this.file,
          },
        });

        if (response.error || !response.data) {
          throw new Error("Failed to import CSV file");
        }

        const importJob = response.data as ImportJob;
        this.toast.success(
          `Import started! Processing ${importJob.totalRows} row(s).`,
        );
        this.$emit("imported");
      } catch (error: any) {
        console.error("Import error:", error);
        this.toast.error(
          error?.message || "Failed to import CSV file. Please try again.",
        );
      } finally {
        this.importing = false;
      }
    },
  },
});
</script>

<style scoped>
.csv-import-content {
  min-height: 200px;
}

.upload-section {
  margin: 1rem 0;
}

.upload-dropzone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--surface);
}

.upload-dropzone:hover,
.upload-dropzone.dragging {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.upload-icon {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0.5rem 0;
}

.upload-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.file-info-section {
  margin: 1rem 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  margin-bottom: 1rem;
}

.file-details {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.file-size {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.errors-section {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--danger-light);
  border: 1px solid var(--danger);
  border-radius: var(--radius);
}

.errors-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.errors-header h4 {
  margin: 0;
  color: var(--danger);
}

.error-icon {
  color: var(--danger);
}

.errors-list {
  max-height: 300px;
  overflow-y: auto;
}

.error-item {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: white;
  border-radius: var(--radius);
  font-size: 0.875rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.error-location {
  font-weight: 600;
  color: var(--danger);
}

.error-field {
  font-weight: 500;
  color: var(--text-primary);
}

.error-message {
  color: var(--text-secondary);
}

.success-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--success-light);
  border: 1px solid var(--success);
  border-radius: var(--radius);
  margin-top: 1rem;
}

.success-icon {
  color: var(--success);
  flex-shrink: 0;
}

.success-message {
  margin: 0;
  color: var(--success-dark);
  font-weight: 500;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.loading-section p {
  margin: 0;
  color: var(--text-secondary);
}
</style>

