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
        @change="handlePageSizeChange"
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

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    }
  },
  emits: ['update:currentPage', 'update:pageSize'],
  computed: {
    totalPages(): number {
      return Math.ceil(this.totalItems / this.pageSize);
    },
    startItem(): number {
      if (this.totalItems === 0) return 0;
      return (this.currentPage - 1) * this.pageSize + 1;
    },
    endItem(): number {
      const end = this.currentPage * this.pageSize;
      return Math.min(end, this.totalItems);
    },
    visiblePages(): number[] {
      const pages: number[] = [];
      const maxVisible = 5;
      
      if (this.totalPages <= maxVisible) {
        // Show all pages if total is less than max
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show current page and surrounding pages
        let start = Math.max(1, this.currentPage - 2);
        let end = Math.min(this.totalPages, this.currentPage + 2);
        
        // Adjust if we're near the start or end
        if (this.currentPage <= 3) {
          end = maxVisible;
        } else if (this.currentPage >= this.totalPages - 2) {
          start = this.totalPages - maxVisible + 1;
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    }
  },
  methods: {
    handlePageSizeChange(event: Event) {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;
      this.$emit('update:pageSize', Number(target.value));
      this.$emit('update:currentPage', 1);
    }
  }
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

