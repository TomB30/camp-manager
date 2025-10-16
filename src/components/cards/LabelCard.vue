<template>
  <div class="label-card">
    <div 
      class="label-preview" 
      :style="{ background: labelColor || '#6B7280' }"
    >
      <div class="label-overlay">
        <button class="icon-btn" @click.stop="$emit('edit', label)" title="Edit">
          <Edit2 :size="18" />
        </button>
        <button class="icon-btn" @click.stop="$emit('delete', label)" title="Delete">
          <Trash2 :size="18" />
        </button>
      </div>
    </div>
    <div class="label-info">
      <div class="label-name">{{ label.name }}</div>
      <div v-if="label.description" class="label-description">{{ label.description }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Label } from '@/types';
import { useColorsStore } from '@/stores';
import { Edit2, Trash2 } from 'lucide-vue-next';

export default defineComponent({
  name: 'LabelCard',
  components: {
    Edit2,
    Trash2,
  },
  props: {
    label: {
      type: Object as PropType<Label>,
      required: true,
    },
  },
  emits: ['edit', 'delete'],
  setup() {
    const colorsStore = useColorsStore();
    return { colorsStore };
  },
  computed: {
    labelColor(): string {
      if (this.label.colorId) {
        const color = this.colorsStore.getColorById(this.label.colorId);
        return color?.hexValue || '#6B7280';
      }
      return '#6B7280';
    },
  },
});
</script>

<style scoped>
.label-card {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
  cursor: pointer;
}

.label-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.label-preview {
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.label-card:hover .label-overlay {
  opacity: 1;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: scale(1.1);
}

.label-info {
  padding: 0.75rem 1rem;
}

.label-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.label-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .label-preview {
    height: 80px;
  }
  
  .icon-btn {
    width: 32px;
    height: 32px;
  }
}
</style>

