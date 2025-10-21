<template>
  <BaseModal :title="isEditing ? 'Edit Staff Member' : 'Add New Staff Member'" @close="$emit('close')">
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <BaseInput
              v-model="localFormData.firstName"
              placeholder="Enter first name"
              :rules="[(val: string) => !!val || 'Enter first name']"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Last Name</label>
            <BaseInput
              v-model="localFormData.lastName"
              placeholder="Enter last name"
              :rules="[(val: string) => !!val || 'Enter last name']"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Role</label>
          <Autocomplete
            v-model="localFormData.role"
            :options="roleOptions"
            placeholder="Select role..."
            :required="true"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Manager</label>
          <Autocomplete
            v-model="localFormData.managerId"
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
            v-model="localFormData.certificationIds"
            :items="certificationsStore.certifications"
            item-type="certification"
            placeholder="Select a certification..."
            empty-text="No certifications selected"
            add-button-text="Add"
            mode="multiple"
            :get-label-fn="(cert) => cert.name"
            :get-initials-fn="(cert) => cert.name.substring(0, 2).toUpperCase()"
            :get-options-fn="(cert) => ({ label: cert.name, value: cert.id })"
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
        <BaseButton color="primary" @click="handleSave" :label="isEditing ? 'Update Member' : 'Add Member'" />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import Autocomplete, {
  type AutocompleteOption,
} from "@/components/Autocomplete.vue";
import SelectionList from "@/components/SelectionList.vue";
import { useCertificationsStore, useRolesStore } from "@/stores";
import type { StaffMember } from "@/types";
import type { QForm } from "quasar";

interface StaffMemberFormData {
  firstName: string;
  lastName: string;
  roleId: StaffMember["roleId"];
  email: string;
  phone: string;
  certificationIds: string[];
  managerId: string;
}

export default defineComponent({
  name: "StaffMemberFormModal",
  components: {
    BaseModal,
    BaseInput,
    BaseButton,
    Autocomplete,
    SelectionList,
  },
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },
    formData: {
      type: Object as PropType<StaffMemberFormData>,
      required: true,
    },
    staffMembers: {
      type: Array as PropType<StaffMember[]>,
      required: true,
    },
    currentMemberId: {
      type: String,
      default: "",
    },
  },
  emits: ["close", "save"],
  setup() {
    const certificationsStore = useCertificationsStore();
    const rolesStore = useRolesStore();
    return { certificationsStore, rolesStore };
  },
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      formRef: null as any,
    };
  },
  computed: {
    roleOptions(): AutocompleteOption[] {
      return this.rolesStore.roles.map((role) => ({
        label: role.name,
        value: role.id,
      }));
    },
    emailModel: {
      get(): string {
        return this.localFormData.email || "";
      },
      set(value: string) {
        this.localFormData.email = value || "";
      },
    },
    phoneModel: {
      get(): string {
        return this.localFormData.phone || "";
      },
      set(value: string) {
        this.localFormData.phone = value || "";
      },
    },
    managerOptions(): AutocompleteOption[] {
      // Filter out the current member to prevent self-assignment
      return this.staffMembers
        .filter((m) => m.id !== this.currentMemberId)
        .map((member) => {
          const role = this.rolesStore.getRoleById(member.roleId);
          const roleName = role ? role.name : 'Unknown Role';
          return {
            label: `${member.firstName} ${member.lastName} (${roleName})`,
            value: member.id,
          };
        });
    },
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
      },
      deep: true,
    },
  },
  methods: {
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      this.$emit("save", this.localFormData);
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
