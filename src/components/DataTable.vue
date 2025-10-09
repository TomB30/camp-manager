<template>
  <div class="data-table">
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" :style="column.width ? { width: column.width } : {}">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(item, index) in paginatedData"
            :key="getRowKey(item, index)"
            class="table-row"
            :class="{ 'clickable': clickable }"
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
            <td :colspan="columns.length" class="text-center text-secondary">
              <slot name="empty">
                No data available
              </slot>
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

<script setup lang="ts">
import { computed } from 'vue';
import Pagination from './Pagination.vue';

export interface Column {
  key: string;
  label: string;
  width?: string;
  formatter?: (value: any, item: any) => string;
}

const props = defineProps<{
  columns: Column[];
  data: any[];
  currentPage: number;
  pageSize: number;
  rowKey?: string | ((item: any) => string);
  clickable?: boolean;
}>();

const emit = defineEmits<{
  'update:currentPage': [value: number];
  'update:pageSize': [value: number];
  'row-click': [item: any];
}>();

const currentPageModel = computed({
  get: () => props.currentPage,
  set: (value) => emit('update:currentPage', value)
});

const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (value) => emit('update:pageSize', value)
});

const paginatedData = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize;
  const end = start + props.pageSize;
  return props.data.slice(start, end);
});

const getRowKey = (item: any, index: number): string => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(item);
  }
  if (typeof props.rowKey === 'string') {
    return item[props.rowKey];
  }
  return item.id || `row-${index}`;
};

const getNestedValue = (item: any, key: string): any => {
  const keys = key.split('.');
  let value = item;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  return value;
};

const formatValue = (item: any, column: Column): string => {
  const value = getNestedValue(item, column.key);
  if (column.formatter) {
    return column.formatter(value, item);
  }
  return value ?? '—';
};

const handleRowClick = (item: any) => {
  if (props.clickable) {
    emit('row-click', item);
  }
};
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

