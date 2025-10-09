<template>
  <div class="container">
    <div class="dashboard">
      <h2 class="mb-2">Dashboard</h2>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #EFF6FF; color: #3B82F6;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Campers</div>
            <div class="stat-value">{{ store.campers.length }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #ECFDF5; color: #10B981;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Team Members</div>
            <div class="stat-value">{{ store.teamMembers.length }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #F3E8FF; color: #9333EA;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"></path></svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Activity Rooms</div>
            <div class="stat-value">{{ store.rooms.length }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #FEF3C7; color: #D97706;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Today's Events</div>
            <div class="stat-value">{{ todayEvents.length }}</div>
          </div>
        </div>
      </div>

      <!-- Conflicts Alert -->
      <div v-if="store.conflicts.length > 0" class="card mt-4" style="border-left: 4px solid var(--error-color);">
        <div class="card-header">
          <h3>⚠️ Scheduling Conflicts ({{ store.conflicts.length }})</h3>
        </div>
        <div class="conflicts-list">
          <div v-for="conflict in store.conflicts" :key="conflict.entityId" class="conflict-item">
            <span class="badge badge-error">{{ formatConflictType(conflict.type) }}</span>
            <span class="conflict-message">{{ conflict.message }}</span>
          </div>
        </div>
      </div>

      <!-- Today's Schedule -->
      <div class="card mt-4">
        <div class="card-header">
          <h3>Today's Schedule</h3>
        </div>
        <div v-if="todayEvents.length === 0" class="empty-state">
          <p class="text-secondary">No events scheduled for today</p>
        </div>
        <div v-else class="events-timeline">
          <div 
            v-for="event in sortedTodayEvents" 
            :key="event.id"
            class="timeline-event"
            :style="{ borderLeftColor: event.color || '#2196F3' }"
          >
            <div class="timeline-time">
              {{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}
            </div>
            <div class="timeline-content">
              <div class="timeline-title">{{ event.title }}</div>
              <div class="timeline-meta">
                <span class="badge badge-primary">
                  {{ getRoomName(event.roomId) }}
                </span>
                <span class="text-secondary text-sm">
                  {{ event.enrolledCamperIds?.length || 0 }}/{{ event.capacity }} campers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-3 mt-4">
        <div class="card">
          <h4 class="mb-2">Quick Actions</h4>
          <div class="flex flex-col gap-2">
            <button class="btn btn-primary" @click="$router.push('/calendar')">
              <Calendar :size="18" />
              View Calendar
            </button>
            <button class="btn btn-secondary" @click="$router.push('/campers')">
              <Users :size="18" />
              Manage Campers
            </button>
            <button class="btn btn-secondary" @click="$router.push('/team')">
              <UsersRound :size="18" />
              Manage Team
            </button>
          </div>
        </div>

        <div class="card">
          <h4 class="mb-2">Recent Enrollments</h4>
          <div class="recent-list">
            <div v-for="camper in recentCampers" :key="camper.id" class="recent-item">
              <span class="font-medium">{{ camper.firstName }} {{ camper.lastName }}</span>
              <span class="text-xs text-secondary">Age {{ camper.age }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h4 class="mb-2">Room Capacity</h4>
          <div class="capacity-list">
            <div v-for="room in store.rooms.slice(0, 5)" :key="room.id" class="capacity-item">
              <div class="capacity-name">{{ room.name }}</div>
              <div class="capacity-bar">
                <div 
                  class="capacity-fill"
                  :style="{ 
                    width: `${getRoomUsage(room.id)}%`,
                    background: getRoomUsage(room.id) > 80 ? 'var(--error-color)' : 'var(--success-color)'
                  }"
                ></div>
              </div>
              <div class="capacity-text text-xs">{{ getRoomUsage(room.id).toFixed(0) }}% used</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import { format } from 'date-fns';
import { Calendar, Users, UsersRound } from 'lucide-vue-next';

export default defineComponent({
  name: 'Dashboard',
  components: {
    Calendar,
    Users,
    UsersRound
  },
  computed: {
    store() {
      return useCampStore();
    },
    todayEvents() {
      const today = new Date();
      return this.store.eventsForDate(today);
    },
    sortedTodayEvents() {
      return [...this.todayEvents].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    },
    recentCampers() {
      return [...this.store.campers]
        .sort((a, b) => {
          const dateA = a.registrationDate ? new Date(a.registrationDate).getTime() : 0;
          const dateB = b.registrationDate ? new Date(b.registrationDate).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);
    }
  },
  methods: {
    formatTime(dateStr: string): string {
      return format(new Date(dateStr), 'h:mm a');
    },
    formatConflictType(type?: string): string {
      if (!type) return 'Unknown';
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getRoomName(roomId: string): string {
      const room = this.store.getRoomById(roomId);
      return room?.name || 'Unknown Room';
    },
    getRoomUsage(roomId: string): number {
      const roomEvents = this.store.roomEvents(roomId);
      if (roomEvents.length === 0) return 0;
      
      const room = this.store.getRoomById(roomId);
      if (!room) return 0;
      
      // Calculate average capacity usage
      const totalUsage = roomEvents.reduce((sum, event) => {
        return sum + ((event.enrolledCamperIds?.length || 0) / room.capacity) * 100;
      }, 0);
      
      return totalUsage / roomEvents.length;
    }
  }
});
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
  transition: all 0.15s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.conflicts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.conflict-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
}

.conflict-message {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.events-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-event {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  border-left: 3px solid var(--accent-color);
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  border-left: 3px solid var(--accent-color);
  transition: all 0.15s ease;
}

.timeline-event:hover {
  border-color: var(--border-color);
  box-shadow: var(--shadow-md);
}

.timeline-time {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 140px;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.timeline-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.empty-state {
  padding: 3rem;
  text-align: center;
}

.recent-list,
.capacity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--background);
  border-radius: var(--radius);
}

.capacity-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.capacity-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.capacity-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 999px;
  overflow: hidden;
}

.capacity-fill {
  height: 100%;
  transition: width 0.3s, background 0.3s;
}

.capacity-text {
  color: var(--text-secondary);
}
</style>

