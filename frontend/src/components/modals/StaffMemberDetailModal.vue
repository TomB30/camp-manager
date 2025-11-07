<template>
  <BaseModal :title="member ? member.meta.name : ''" @close="$emit('close')">
    <template #body>
      <div v-if="member">
        <div class="detail-section">
          <div class="detail-label">Role</div>
          <div>
            <span class="badge badge-primary">{{
              formatRole(member.spec.roleId)
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

        <div v-if="member.spec.email" class="detail-section">
          <div class="detail-label">Email</div>
          <div>{{ member.spec.email }}</div>
        </div>

        <div v-if="member.spec.phone" class="detail-section">
          <div class="detail-label">Phone</div>
          <div>{{ member.spec.phone }}</div>
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
          <div class="detail-label">Groups</div>
          <div v-if="memberGroups.length > 0" class="flex gap-1 flex-wrap">
            <span
              v-for="group in memberGroups"
              :key="group.meta.id"
              class="badge badge-primary"
            >
              {{ group.meta.name }}
            </span>
          </div>
          <div v-else class="text-grey-7">Not assigned to any groups</div>
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
  useGroupsStore,
} from "@/stores";
import type { Group, StaffMember } from "@/generated/api";

export default defineComponent({
  name: "StaffMemberDetailModal",
  components: {
    BaseModal,
  },
  props: {
    member: {
      type: Object as PropType<StaffMember>,
      required: true,
    },
  },
  emits: ["close", "edit", "delete"],
  setup() {
    const programsStore = useProgramsStore();
    const colorsStore = useColorsStore();
    const certificationsStore = useCertificationsStore();
    const rolesStore = useRolesStore();
    const groupsStore = useGroupsStore();
    return {
      programsStore,
      colorsStore,
      certificationsStore,
      rolesStore,
      groupsStore,
    };
  },
  computed: {
    certificationNames(): string[] {
      if (!this.member || !this.member.spec.certificationIds) return [];

      return this.member.spec.certificationIds
        .map((id) => {
          const cert = this.certificationsStore.getCertificationById(id);
          return cert ? cert.meta.name : "";
        })
        .filter((name) => name.length > 0);
    },
    memberGroups(): Group[] {
      if (!this.member) return [];
      return this.groupsStore.groups.filter(
        (group: Group) =>
          group.spec.staffIds?.includes(this.member.meta.id) || false,
      );
    },
  },
  methods: {
    formatRole(roleId: string): string {
      const role = this.rolesStore.getRoleById(roleId);
      return role
        ? role.meta.name.charAt(0).toUpperCase() + role.meta.name.slice(1)
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
