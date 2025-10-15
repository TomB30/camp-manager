<template>
  <span class="duration-display">{{ formattedDuration }}</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DurationDisplay',
  props: {
    minutes: {
      type: Number,
      required: true,
    },
    format: {
      type: String as () => 'short' | 'long',
      default: 'short',
      validator: (value: string) => ['short', 'long'].includes(value),
    },
  },
  computed: {
    formattedDuration(): string {
      const minutes = this.minutes;
      
      // Less than 60 minutes - show in minutes only
      if (minutes < 60) {
        return this.formatSingleUnit(minutes, 'minute', 'min');
      }
      
      // Less than 24 hours - show hours and minutes
      if (minutes < 1440) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return this.formatCompoundTime(hours, 'hour', 'hr', remainingMinutes, 'minute', 'min');
      }
      
      // Less than 7 days - show days and hours
      if (minutes < 10080) {
        const days = Math.floor(minutes / 1440);
        const remainingMinutes = minutes % 1440;
        const hours = Math.floor(remainingMinutes / 60);
        return this.formatCompoundTime(days, 'day', 'day', hours, 'hour', 'hr');
      }
      
      // 7 days or more - show weeks and days
      const weeks = Math.floor(minutes / 10080);
      const remainingMinutes = minutes % 10080;
      const days = Math.floor(remainingMinutes / 1440);
      return this.formatCompoundTime(weeks, 'week', 'wk', days, 'day', 'day');
    },
  },
  methods: {
    formatSingleUnit(value: number, longUnit: string, shortUnit: string): string {
      if (this.format === 'long') {
        const unit = value === 1 ? longUnit : `${longUnit}s`;
        return `${value} ${unit}`;
      } else {
        return `${value} ${shortUnit}`;
      }
    },
    formatCompoundTime(
      primaryValue: number,
      primaryLongUnit: string,
      primaryShortUnit: string,
      secondaryValue: number,
      secondaryLongUnit: string,
      secondaryShortUnit: string
    ): string {
      // Format primary unit
      const primaryText = this.format === 'long'
        ? `${primaryValue} ${primaryValue === 1 ? primaryLongUnit : `${primaryLongUnit}s`}`
        : `${primaryValue} ${primaryShortUnit}`;
      
      // If secondary value is 0, return only primary
      if (secondaryValue === 0) {
        return primaryText;
      }
      
      // Format secondary unit
      const secondaryText = this.format === 'long'
        ? `${secondaryValue} ${secondaryValue === 1 ? secondaryLongUnit : `${secondaryLongUnit}s`}`
        : `${secondaryValue} ${secondaryShortUnit}`;
      
      return `${primaryText} ${secondaryText}`;
    },
  },
});
</script>

<style scoped>
.duration-display {
  display: inline;
}
</style>

