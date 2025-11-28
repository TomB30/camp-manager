<template>
  <q-table
    :rows="rows"
    :columns="columns"
    :row-key="rowKey"
    :loading="loading"
    :grid="grid"
    :pagination="internalPagination"
    @update:pagination="handlePaginationUpdate"
    @request="request"
    @row-click="handleRowClick"
    v-bind="$attrs"
    class="server-table"
  >
    <!-- Grid mode: Custom card slot -->
    <template v-if="grid" #item="props">
      <slot name="item" :item="props.row" :index="props.rowIndex">
        {{ props.row }}
      </slot>
    </template>

    <!-- Table mode: Custom cell slots -->
    <template v-for="col in columns" :key="col.name" #[`body-cell-${col.name}`]="props">
      <q-td :props="props">
        <slot
          :name="`cell-${col.name}`"
          :item="props.row"
          :value="props.value"
        >
          {{ props.value }}
        </slot>
      </q-td>
    </template>

    <!-- Empty state slot -->
    <template #no-data>
      <slot name="empty">
        <div class="text-center q-pa-lg">
          <q-icon name="inbox" size="3em" color="grey-5" />
          <div class="text-h6 q-mt-md">No data available</div>
        </div>
      </slot>
    </template>

    <!-- Loading slot -->
    <template #loading>
      <slot name="loading">
        <q-inner-loading showing color="primary" />
      </slot>
    </template>
  </q-table>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import type { QTableColumn } from "quasar";

export interface ServerTablePagination {
  offset: number;
  limit: number;
  total: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export default defineComponent({
  name: "ServerTable",
  inheritAttrs: false,
  props: {
    columns: {
      type: Array as PropType<QTableColumn[]>,
      required: true,
    },
    rows: {
      type: Array as PropType<any[]>,
      required: true,
    },
    rowKey: {
      type: String,
      default: "meta.id",
    },
    grid: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    pagination: {
      type: Object as PropType<ServerTablePagination>,
      required: true,
    },
  },
  emits: ["update:pagination", "request", "row-click"],
  computed: {
    internalPagination: {
      get(): any {
        // Convert backend pagination (offset/limit) to Quasar pagination (page-based)
        const page =
          Math.floor(this.pagination.offset / this.pagination.limit) + 1;
        return {
          page,
          rowsPerPage: this.pagination.limit,
          rowsNumber: this.pagination.total,
          sortBy: this.pagination.sortBy,
          descending: this.pagination.sortOrder === "desc",
        };
      },
      set(_val: any) {
        // This will be called by q-table when pagination changes
        // We handle it in handlePaginationUpdate instead
      },
    },
  },
  methods: {
    request(newPagination: any): void {
      this.handlePaginationUpdate(newPagination.pagination);
    },
    handlePaginationUpdate(newPagination: any): void {
      const offset = (newPagination.page - 1) * newPagination.rowsPerPage;
      const limit = newPagination.rowsPerPage;
      const sortBy = newPagination.sortBy;
      const sortOrder = newPagination.descending ? "desc" : "asc";

      const updatedPagination: ServerTablePagination = {
        offset,
        limit,
        total: this.pagination.total,
        sortBy,
        sortOrder,
      };

      this.$emit("update:pagination", updatedPagination);
      this.$emit("request", {
        offset,
        limit,
        sortBy,
        sortOrder,
      });
    },
    handleRowClick(_event: Event, row: any, _index: number): void {
      this.$emit("row-click", row);
    },
  },
});
</script>

<style scoped>
.server-table {
  border-radius: var(--radius-lg);
}

/* Grid mode styles */
.server-table :deep(.q-table__grid-content) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.5rem;
}

/* Ensure pagination shows in grid mode */
.server-table :deep(.q-table__bottom) {
  border-top: 1px solid var(--border-light);
}
</style>
