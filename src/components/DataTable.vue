<template>
  <div class="data-table">
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :style="column.width ? { width: column.width } : {}"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in paginatedData"
            :key="getRowKey(item, index)"
            class="table-row"
            :class="{ clickable: clickable }"
            @click="handleRowClick(item)"
          >
            <td v-for="column in columns" :key="column.key">
              <slot
                :name="`cell-${column.key}`"
                :item="item"
                :value="getNestedValue(item, column.key)"
              >
                {{ formatValue(item, column) }}
              </slot>
            </td>
          </tr>
          <tr v-if="paginatedData.length === 0" class="empty-row">
            <td :colspan="columns.length" class="text-center">
              <slot name="empty"> No data available </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination
      v-model:current-page="currentPageModel"
      v-model:page-size="pageSizeModel"
      :total-items="data.length"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Pagination from "./Pagination.vue";

export interface Column {
  key: string;
  label: string;
  width?: string;
  formatter?: (value: any, item: any) => string;
}

export default defineComponent({
  name: "DataTable",
  components: {
    Pagination,
  },
  props: {
    columns: {
      type: Array as PropType<Column[]>,
      required: true,
    },
    data: {
      type: Array as PropType<any[]>,
      required: true,
    },
    currentPage: {
      type: Number,
      required: true,
    },
    pageSize: {
      type: Number,
      required: true,
    },
    rowKey: {
      type: [String, Function] as PropType<string | ((item: any) => string)>,
      default: undefined,
    },
    clickable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:currentPage", "update:pageSize", "row-click"],
  computed: {
    currentPageModel: {
      get(): number {
        return this.currentPage;
      },
      set(value: number) {
        this.$emit("update:currentPage", value);
      },
    },
    pageSizeModel: {
      get(): number {
        return this.pageSize;
      },
      set(value: number) {
        this.$emit("update:pageSize", value);
      },
    },
    paginatedData(): any[] {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.data.slice(start, end);
    },
  },
  methods: {
    getRowKey(item: any, index: number): string {
      if (typeof this.rowKey === "function") {
        return this.rowKey(item);
      }
      if (typeof this.rowKey === "string") {
        return item[this.rowKey];
      }
      return item.id || `row-${index}`;
    },
    getNestedValue(item: any, key: string): any {
      const keys = key.split(".");
      let value = item;
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
      return value;
    },
    formatValue(item: any, column: Column): string {
      const value = this.getNestedValue(item, column.key);
      if (column.formatter) {
        return column.formatter(value, item);
      }
      return value ?? "—";
    },
    handleRowClick(item: any) {
      if (this.clickable) {
        this.$emit("row-click", item);
      }
    },
  },
});
</script>

<style scoped>
.data-table {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: var(--surface-hover);
  position: sticky;
  top: 0;
  z-index: 1;
}

.table th {
  padding: 8px;
  text-align: left;
  font-weight: 600;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-light);
}

.table td {
  padding: 8px;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--border-light);
}

.table-row {
  transition: background-color 0.15s ease;
}

.table-row.clickable {
  cursor: pointer;
}

.table-row.clickable:hover {
  background: var(--surface-hover);
}

.empty-row td {
  padding: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .table th,
  .table td {
    padding: 8px;
    font-size: 0.8125rem;
  }
}
</style>
