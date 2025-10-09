<template>
  <div class="pagination">
    <div class="pagination-info">
      Showing {{ startItem }} - {{ endItem }} of {{ totalItems }}
    </div>
    
    <div class="pagination-controls">
      <button 
        class="btn btn-sm btn-secondary"
        :disabled="currentPage === 1"
        @click="$emit('update:currentPage', currentPage - 1)"
      >
        ← Previous
      </button>
      
      <div class="pagination-pages">
        <button
          v-for="page in visiblePages"
          :key="page"
          class="btn btn-sm"
          :class="page === currentPage ? 'btn-primary' : 'btn-secondary'"
          @click="$emit('update:currentPage', page)"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        class="btn btn-sm btn-secondary"
        :disabled="currentPage === totalPages"
        @click="$emit('update:currentPage', currentPage + 1)"
      >
        Next →
      </button>
    </div>
    
    <div class="pagination-size">
      <label class="text-sm text-secondary">Items per page:</label>
      <select 
        :value="pageSize"
        @change="$emit('update:pageSize', Number($event.target.value))"
        class="form-select"
      >
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentPage: number;
  pageSize: number;
  totalItems: number;
}>();

defineEmits<{
  'update:currentPage': [value: number];
  'update:pageSize': [value: number];
}>();

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize));

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
  const end = props.currentPage * props.pageSize;
  return Math.min(end, props.totalItems);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  
  if (totalPages.value <= maxVisible) {
    // Show all pages if total is less than max
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Show current page and surrounding pages
    let start = Math.max(1, props.currentPage - 2);
    let end = Math.min(totalPages.value, props.currentPage + 2);
    
    // Adjust if we're near the start or end
    if (props.currentPage <= 3) {
      end = maxVisible;
    } else if (props.currentPage >= totalPages.value - 2) {
      start = totalPages.value - maxVisible + 1;
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
});
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface);
  border-top: 1px solid var(--border-light);
  flex-wrap: wrap;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-size .form-select {
  width: auto;
  min-width: 80px;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pagination-controls {
    justify-content: center;
  }
  
  .pagination-info,
  .pagination-size {
    justify-content: center;
    text-align: center;
  }
}
</style>

