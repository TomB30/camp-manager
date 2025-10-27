<template>
  <BaseModal
    :title="isEditing ? 'Edit Role' : 'Add New Role'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Role Name</label>
          <BaseInput
            v-model="formModel.meta.name"
            placeholder="Enter role name"
            :rules="[(val: string) => !!val || 'Enter role name']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <BaseInput
            v-model="descriptionModel"
            type="textarea"
            :rows="3"
            placeholder="Optional description"
          />
        </div>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton
          color="primary"
          @click="handleSave"
          :label="isEditing ? 'Update Role' : 'Add Role'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import type { QForm } from "quasar";
import type { RoleCreationRequest } from "@/types";
import { useRolesStore } from "@/stores";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "RoleFormModal",
  components: {
    BaseModal,
  },
  props: {
    roleId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close"],
  data() {
    return {
      formModel: {
        meta: {
          name: "",
          description: "",
        },
        spec: {},
      } as RoleCreationRequest,
      formRef: null as any,
      loading: false as boolean,
    };
  },
  created() {
    if (!this.roleId) return;

    const role = this.rolesStore.getRoleById(this.roleId);
    if (!role) return;

    this.formModel = {
      meta: {
        name: role.meta.name,
        description: role.meta.description || "",
      },
      spec: {},
    };
  },
  setup() {
    const rolesStore = useRolesStore();
    const toast = useToast();
    return { rolesStore, toast };
  },
  computed: {
    isEditing(): boolean {
      return !!this.roleId;
    },
    descriptionModel: {
      get(): string {
        return this.formModel.meta.description || "";
      },
      set(value: string) {
        this.formModel.meta.description = value || "";
      },
    },
  },
  methods: {
    async handleSave(): Promise<void> {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      if (this.isEditing) {
        return this.updateRole();
      }
      return this.createRole();
    },
    async createRole(): Promise<void> {
      try {
        this.loading = true;
        await this.rolesStore.createRole(this.formModel);
        this.toast.success("Role created successfully");
      } catch (error) {
        this.toast.error((error as Error).message || "Failed to create role");
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
    async updateRole(): Promise<void> {
      if (!this.roleId) return;
      try {
        this.loading = true;
        await this.rolesStore.updateRole(this.roleId, this.formModel);
        this.toast.success("Role updated successfully");
      } catch (error) {
        this.toast.error((error as Error).message || "Failed to update role");
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
  },
});
</script>

<style scoped>
/* No additional styles needed */
</style>
