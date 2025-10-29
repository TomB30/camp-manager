<template>
  <BaseModal
    :title="isEditing ? 'Edit Staff Member' : 'Create New Staff Member'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <BaseInput
              v-model="firstName"
              placeholder="Enter first name"
              :rules="[(val: string) => !!val || 'Enter first name']"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Last Name</label>
            <BaseInput
              v-model="lastName"
              placeholder="Enter last name"
              :rules="[(val: string) => !!val || 'Enter last name']"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Role</label>
          <Autocomplete
            v-model="localFormData.spec.roleId"
            :options="roleOptions"
            placeholder="Select role..."
            :required="true"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Manager</label>
          <Autocomplete
            v-model="localFormData.spec.managerId"
            :options="managerOptions"
            placeholder="No Manager (Top Level)"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <BaseInput
            v-model="emailModel"
            type="email"
            placeholder="Enter email"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Phone</label>
          <BaseInput
            v-model="phoneModel"
            type="tel"
            placeholder="Enter phone"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Certifications</label>
          <SelectionList
            v-model="certificationIdsModel"
            :items="certificationsStore.certifications"
            item-type="certification"
            placeholder="Select a certification..."
            empty-text="No certifications selected"
            add-button-text="Add"
            mode="multiple"
            :get-label-fn="(cert) => cert.meta.name"
            :get-initials-fn="
              (cert) => cert.meta.name.substring(0, 2).toUpperCase()
            "
            :get-options-fn="
              (cert) => ({ label: cert.meta.name, value: cert.meta.id })
            "
          />
          <p class="form-help-text">
            Select certifications from the prepared list
          </p>
        </div>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton
          color="primary"
          @click="handleSave"
          :label="isEditing ? 'Update Staff Member' : 'Create Staff Member'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
// Components
import BaseModal from "@/components/BaseModal.vue";
import Autocomplete, {
  type AutocompleteOption,
} from "@/components/Autocomplete.vue";
import SelectionList from "@/components/SelectionList.vue";
// Stores
import {
  useCertificationsStore,
  useRolesStore,
  useStaffMembersStore,
} from "@/stores";
// Types
import type { StaffMember, StaffMemberCreationRequest } from "@/generated/api";
import type { QForm } from "quasar";
// Composables
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "StaffMemberFormModal",
  components: {
    BaseModal,
    Autocomplete,
    SelectionList,
  },
  props: {
    staffMemberId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close"],
  setup() {
    const certificationsStore = useCertificationsStore();
    const rolesStore = useRolesStore();
    const staffMembersStore = useStaffMembersStore();
    const toast = useToast();
    return { certificationsStore, rolesStore, staffMembersStore, toast };
  },
  data() {
    return {
      firstName: "",
      lastName: "",
      localFormData: {
        meta: {
          name: "",
          description: "",
        },
        spec: {
          roleId: "",
          email: "",
          certificationIds: [],
          managerId: "",
        },
      } as StaffMemberCreationRequest,
      formRef: null as any,
    };
  },
  created() {
    if (!this.staffMemberId) return;
    const staffMember = this.staffMembersStore.getStaffMemberById(
      this.staffMemberId,
    );
    if (!staffMember) return;

    // Split the name into firstName and lastName
    const nameParts = staffMember.meta.name.split(" ");
    this.firstName = nameParts[0] || "";
    this.lastName = nameParts.slice(1).join(" ") || "";

    this.localFormData = {
      meta: {
        name: staffMember.meta.name,
        description: staffMember.meta.description || "",
      },
      spec: {
        roleId: staffMember.spec.roleId,
        email: staffMember.spec.email || "",
        certificationIds: staffMember.spec.certificationIds || [],
        managerId: staffMember.spec.managerId || "",
      },
    };
  },
  computed: {
    staffMembers(): StaffMember[] {
      return this.staffMembersStore.staffMembers;
    },
    isEditing() {
      return !!this.staffMemberId;
    },
    roleOptions(): AutocompleteOption[] {
      return this.rolesStore.roles.map((role) => ({
        label: role.meta.name,
        value: role.meta.id,
      }));
    },
    emailModel: {
      get(): string {
        return this.localFormData.spec.email || "";
      },
      set(value: string) {
        this.localFormData.spec.email = value || "";
      },
    },
    phoneModel: {
      get(): string {
        return this.localFormData.spec.email || "";
      },
      set(value: string) {
        this.localFormData.spec.email = value || "";
      },
    },
    certificationIdsModel: {
      get(): string[] {
        return this.localFormData.spec.certificationIds || [];
      },
      set(value: string[]) {
        this.localFormData.spec.certificationIds = value || [];
      },
    },
    managerOptions(): AutocompleteOption[] {
      // Filter out the current member to prevent self-assignment
      return this.staffMembers
        .filter((m) => m.meta.id !== this.staffMemberId)
        .map((member) => {
          const role = this.rolesStore.getRoleById(member.spec.roleId);
          const roleName = role ? role.meta.name : "Unknown Role";
          return {
            label: `${member.meta.name} (${roleName})`,
            value: member.meta.id,
          };
        });
    },
  },
  methods: {
    async handleSave(): Promise<void> {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      // Combine firstName and lastName into meta.name
      this.localFormData.meta.name =
        `${this.firstName} ${this.lastName}`.trim();

      if (this.isEditing) {
        return this.updateStaffMember();
      } else {
        return this.createStaffMember();
      }
    },
    async updateStaffMember(): Promise<void> {
      if (!this.staffMemberId) return;
      try {
        await this.staffMembersStore.updateStaffMember(
          this.staffMemberId,
          this.localFormData,
        );
        this.toast.success("Staff member updated successfully");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to update staff member",
        );
      } finally {
        this.$emit("close");
      }
    },
    async createStaffMember(): Promise<void> {
      try {
        await this.staffMembersStore.createStaffMember(this.localFormData);
        this.toast.success("Staff member created successfully");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to create staff member",
        );
      } finally {
        this.$emit("close");
      }
    },
  },
});
</script>

<style scoped>
.form-help-text {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
