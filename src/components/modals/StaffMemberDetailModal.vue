<template>
  <BaseModal
    :title="member ? `${member.firstName} ${member.lastName}` : ''"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="member">
        <div class="detail-section">
          <div class="detail-label">Role</div>
          <div>
            <span class="badge badge-primary">{{
              formatRole(member.roleId)
            }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Manager</div>
          <slot name="manager-info">
            <div>
              <span class="badge badge-success">None</span>
            </div>
          </slot>
        </div>

        <div class="detail-section">
          <div class="detail-label">Direct Reports</div>
          <slot name="direct-reports">
            <div class="text-caption">No direct reports</div>
          </slot>
        </div>

        <div v-if="member.email" class="detail-section">
          <div class="detail-label">Email</div>
          <div>{{ member.email }}</div>
        </div>

        <div v-if="member.phone" class="detail-section">
          <div class="detail-label">Phone</div>
          <div>{{ member.phone }}</div>
        </div>

        <div v-if="certificationNames.length > 0" class="detail-section">
          <div class="detail-label">Certifications</div>
          <div class="flex gap-1 flex-wrap">
            <span
              v-for="cert in certificationNames"
              :key="cert"
              class="badge badge-success"
            >
              {{ cert }}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Programs</div>
          <div v-if="memberPrograms.length > 0" class="flex gap-1 flex-wrap">
            <span
              v-for="program in memberPrograms"
              :key="program.id"
              class="badge badge-program"
              :style="{
                backgroundColor: getProgramColor(program),
                color: 'white',
              }"
            >
              {{ program.name }}
            </span>
          </div>
          <div v-else class="text-grey-7">Not assigned to any programs</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Assigned Events</div>
          <slot name="events-list">
            <div class="text-grey-7">No events assigned</div>
          </slot>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseButton
        outline
        color="negative"
        @click="$emit('delete')"
        label="Delete"
      />
      <BaseButton outline color="grey-8" @click="$emit('edit')" label="Edit" />
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import {
  useProgramsStore,
  useColorsStore,
  useCertificationsStore,
  useRolesStore,
} from "@/stores";
import type { StaffMember } from "@/types";

export default defineComponent({
  name: "StaffMemberDetailModal",
  components: {
    BaseModal,
  },
  props: {
    member: {
      type: Object as PropType<StaffMember | null>,
      default: null,
    },
  },
  emits: ["close", "edit", "delete"],
  setup() {
    const programsStore = useProgramsStore();
    const colorsStore = useColorsStore();
    const certificationsStore = useCertificationsStore();
    const rolesStore = useRolesStore();
    return { programsStore, colorsStore, certificationsStore, rolesStore };
  },
  computed: {
    certificationNames(): string[] {
      if (!this.member || !this.member.certificationIds) return [];

      return this.member.certificationIds
        .map((id) => {
          const cert = this.certificationsStore.getCertificationById(id);
          return cert ? cert.name : "";
        })
        .filter((name) => name.length > 0);
    },
    memberPrograms() {
      if (!this.member) return [];
      return this.programsStore.getProgramsForStaffMember(this.member.id);
    },
  },
  methods: {
    getProgramColor(program: any): string {
      if (program.colorId) {
        const color = this.colorsStore.getColorById(program.colorId);
        return color?.hexValue || "#6366F1";
      }
      return "#6366F1";
    },
    formatRole(roleId: string): string {
      const role = this.rolesStore.getRoleById(roleId);
      return role
        ? role.name.charAt(0).toUpperCase() + role.name.slice(1)
        : "Unknown Role";
    },
  },
});
</script>

<style scoped>
.detail-section {
  margin-bottom: 1.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.badge-program {
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
}
</style>
