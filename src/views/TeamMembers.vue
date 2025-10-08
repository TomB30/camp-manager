<template>
  <div class="container">
    <div class="team-view">
      <div class="view-header">
        <h2>Team Management</h2>
        <div class="header-actions">
          <div class="view-toggle">
            <button 
              class="btn btn-sm" 
              :class="{ 'btn-primary': viewMode === 'grid', 'btn-secondary': viewMode !== 'grid' }"
              @click="viewMode = 'grid'"
              title="Grid View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button 
              class="btn btn-sm" 
              :class="{ 'btn-primary': viewMode === 'table', 'btn-secondary': viewMode !== 'table' }"
              @click="viewMode = 'table'"
              title="Table View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
          <button class="btn btn-primary" @click="showModal = true">+ Add Team Member</button>
        </div>
      </div>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filterRole="filterRole"
        v-model:filterCertification="filterCertification"
        :filters="teamFilters"
        :filtered-count="filteredMembers.length"
        :total-count="store.teamMembers.length"
        @clear="clearFilters"
      />

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="team-grid">
        <div 
          v-for="member in filteredMembers"
          :key="member.id"
          class="team-card card"
          @click="selectMember(member.id)"
        >
          <div class="member-avatar" :style="{ background: getRoleColor(member.role) }">
            {{ member.firstName.charAt(0) }}{{ member.lastName.charAt(0) }}
          </div>
          <div class="member-details">
            <h4>{{ member.firstName }} {{ member.lastName }}</h4>
            <div class="member-role">
              <span class="badge badge-primary">{{ formatRole(member.role) }}</span>
            </div>
            <div v-if="member.email" class="member-contact text-sm text-secondary mt-1">
              {{ member.email }}
            </div>
            <div v-if="member.certifications && member.certifications.length > 0" class="member-certs text-xs mt-2">
              {{ member.certifications.length }} Certification(s)
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="team-table-container">
        <table class="team-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Certifications</th>
              <th>Events</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="member in filteredMembers"
              :key="member.id"
              class="table-row"
            >
              <td class="member-name-cell">
                <div class="member-name-content">
                  <div class="member-avatar-sm" :style="{ background: getRoleColor(member.role) }">
                    {{ member.firstName.charAt(0) }}{{ member.lastName.charAt(0) }}
                  </div>
                  <div class="member-fullname">{{ member.firstName }} {{ member.lastName }}</div>
                </div>
              </td>
              <td>
                <span class="badge badge-primary badge-sm">{{ formatRole(member.role) }}</span>
              </td>
              <td class="contact-cell">{{ member.email || '—' }}</td>
              <td class="contact-cell">{{ member.phone || '—' }}</td>
              <td>
                <span v-if="member.certifications && member.certifications.length > 0" class="badge badge-success badge-sm">
                  {{ member.certifications.length }} cert(s)
                </span>
                <span v-else class="text-secondary">None</span>
              </td>
              <td>
                <span class="event-count">{{ getMemberEvents(member.id).length }}</span>
              </td>
              <td>
                <button class="btn btn-sm btn-secondary" @click="selectMember(member.id)">
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Member Detail Modal -->
      <Teleport to="body">
        <div v-if="selectedMemberId" class="modal-overlay" @click.self="selectedMemberId = null">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ selectedMember?.firstName }} {{ selectedMember?.lastName }}</h3>
              <button class="btn btn-icon btn-secondary" @click="selectedMemberId = null">✕</button>
            </div>
            <div class="modal-body">
              <div v-if="selectedMember">
                <div class="detail-section">
                  <div class="detail-label">Role</div>
                  <div>
                    <span class="badge badge-primary">{{ formatRole(selectedMember.role) }}</span>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Manager</div>
                  <div>
                    <span class="badge badge-success">{{ getManagerName(selectedMember.managerId) }}</span>
                  </div>
                </div>

                <div v-if="getDirectReports(selectedMember.id).length > 0" class="detail-section">
                  <div class="detail-label">Direct Reports</div>
                  <div class="flex gap-1 flex-wrap">
                    <span v-for="report in getDirectReports(selectedMember.id)" :key="report.id" class="badge badge-primary">
                      {{ report.firstName }} {{ report.lastName }}
                    </span>
                  </div>
                </div>

                <div v-if="selectedMember.email" class="detail-section">
                  <div class="detail-label">Email</div>
                  <div>{{ selectedMember.email }}</div>
                </div>

                <div v-if="selectedMember.phone" class="detail-section">
                  <div class="detail-label">Phone</div>
                  <div>{{ selectedMember.phone }}</div>
                </div>

                <div v-if="selectedMember.certifications && selectedMember.certifications.length > 0" class="detail-section">
                  <div class="detail-label">Certifications</div>
                  <div class="flex gap-1 flex-wrap">
                    <span v-for="cert in selectedMember.certifications" :key="cert" class="badge badge-success">
                      {{ cert }}
                    </span>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Assigned Events</div>
                  <div v-if="getMemberEvents(selectedMember.id).length > 0" class="events-list">
                    <div 
                      v-for="event in getMemberEvents(selectedMember.id)"
                      :key="event.id"
                      class="event-item"
                      :style="{ borderLeftColor: event.color || '#2196F3' }"
                    >
                      <div class="event-item-title">{{ event.title }}</div>
                      <div class="event-item-time text-xs text-secondary">
                        {{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-secondary">No events assigned</div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-error" @click="deleteMemberConfirm">Delete Member</button>
              <button class="btn btn-secondary" @click="editMember">Edit</button>
              <button class="btn btn-secondary" @click="selectedMemberId = null">Close</button>
            </div>
          </div>
        </div>

        <!-- Add/Edit Member Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ editingMemberId ? 'Edit Team Member' : 'Add New Team Member' }}</h3>
              <button class="btn btn-icon btn-secondary" @click="closeModal">✕</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveMember">
                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">First Name</label>
                    <input v-model="formData.firstName" type="text" class="form-input" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Last Name</label>
                    <input v-model="formData.lastName" type="text" class="form-input" required />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Role</label>
                  <select v-model="formData.role" class="form-select" required>
                    <option value="counselor">Counselor</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="director">Director</option>
                    <option value="nurse">Nurse</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Manager</label>
                  <select v-model="formData.managerId" class="form-select">
                    <option value="">No Manager (Top Level)</option>
                    <option 
                      v-for="member in store.teamMembers.filter(m => m.id !== editingMemberId)" 
                      :key="member.id" 
                      :value="member.id"
                    >
                      {{ member.firstName }} {{ member.lastName }} ({{ formatRole(member.role) }})
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input v-model="formData.email" type="email" class="form-input" />
                </div>

                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input v-model="formData.phone" type="tel" class="form-input" />
                </div>

                <div class="form-group">
                  <label class="form-label">Certifications (comma-separated)</label>
                  <input v-model="certificationsInput" type="text" class="form-input" placeholder="e.g., CPR, First Aid" />
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button class="btn btn-primary" @click="saveMember">
                {{ editingMemberId ? 'Update' : 'Add' }} Member
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCampStore } from '@/stores/campStore';
import { format } from 'date-fns';
import type { TeamMember } from '@/types/api';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';

const store = useCampStore();
const selectedMemberId = ref<string | null>(null);
const showModal = ref(false);
const editingMemberId = ref<string | null>(null);
const certificationsInput = ref('');
const viewMode = ref<'grid' | 'table' | 'org-chart'>('grid');
const expandedMembers = ref<Set<string>>(new Set());


// Expand all by default on mount
onMounted(() => {
  // Auto-expand all members with reports
  store.teamMembers.forEach(member => {
    if (getDirectReports(member.id).length > 0) {
      expandedMembers.value.add(member.id);
    }
  });
});

const formData = ref<{
  firstName: string;
  lastName: string;
  role: TeamMember['role'];
  email: string;
  phone: string;
  certifications: string[];
  managerId: string;
}>({
  firstName: '',
  lastName: '',
  role: 'counselor',
  email: '',
  phone: '',
  certifications: [],
  managerId: '',
});

// Filter state
const searchQuery = ref('');
const filterRole = ref('');
const filterCertification = ref('');

const teamFilters = computed<Filter[]>(() => [
  {
    model: 'filterRole',
    value: filterRole.value,
    placeholder: 'All Roles',
    options: [
      { label: 'Counselor', value: 'counselor' },
      { label: 'Activity Leader', value: 'activity-leader' },
      { label: 'Medical Staff', value: 'medical-staff' },
      { label: 'Administrator', value: 'administrator' },
    ],
  },
  {
    model: 'filterCertification',
    value: filterCertification.value,
    placeholder: 'All Certifications',
    options: [
      { label: 'First Aid', value: 'First Aid' },
      { label: 'CPR', value: 'CPR' },
      { label: 'Lifeguard', value: 'Lifeguard' },
      { label: 'Swimming Instructor', value: 'Swimming Instructor' },
      { label: 'Wilderness First Aid', value: 'Wilderness First Aid' },
    ],
  },
]);

const selectedMember = computed(() => {
  if (!selectedMemberId.value) return null;
  return store.getTeamMemberById(selectedMemberId.value);
});

const filteredMembers = computed(() => {
  let members = store.teamMembers;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    members = members.filter(member =>
      member.firstName.toLowerCase().includes(query) ||
      member.lastName.toLowerCase().includes(query) ||
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(query) ||
      (member.email && member.email.toLowerCase().includes(query))
    );
  }

  // Role filter
  if (filterRole.value) {
    members = members.filter(member => member.role === filterRole.value);
  }

  // Certification filter
  if (filterCertification.value) {
    members = members.filter(member =>
      member.certifications && member.certifications.includes(filterCertification.value)
    );
  }

  return members;
});

const clearFilters = () => {
  searchQuery.value = '';
  filterRole.value = '';
  filterCertification.value = '';
};

// Org chart functions
const getDirectReports = (managerId: string) => {
  return filteredMembers.value.filter(member => member.managerId === managerId);
};

const getManagerName = (managerId: string | undefined) => {
  if (!managerId) return 'None';
  const manager = store.getTeamMemberById(managerId);
  return manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown';
};

const formatRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getRoleColor = (role: TeamMember['role']) => {
  const colors: Record<TeamMember['role'], string> = {
    director: '#9C27B0',
    supervisor: '#2196F3',
    counselor: '#4CAF50',
    nurse: '#F44336',
    instructor: '#FF9800',
  };
  return colors[role] || '#757575';
};

const getMemberEvents = (memberId: string) => {
  return store.staffEvents(memberId);
};

const formatTime = (dateStr: string) => {
  return format(new Date(dateStr), 'h:mm a');
};

const selectMember = (memberId: string) => {
  selectedMemberId.value = memberId;
};

const editMember = () => {
  if (!selectedMember.value) return;
  
  editingMemberId.value = selectedMember.value.id;
  formData.value = {
    firstName: selectedMember.value.firstName,
    lastName: selectedMember.value.lastName,
    role: selectedMember.value.role,
    email: selectedMember.value.email || '',
    phone: selectedMember.value.phone || '',
    certifications: selectedMember.value.certifications || [],
    managerId: selectedMember.value.managerId || '',
  };
  certificationsInput.value = (selectedMember.value.certifications || []).join(', ');
  
  selectedMemberId.value = null;
  showModal.value = true;
};

const saveMember = async () => {
  const certifications = certificationsInput.value
    .split(',')
    .map(c => c.trim())
    .filter(c => c.length > 0);

  const memberData: TeamMember = {
    id: editingMemberId.value || `staff-${Date.now()}`,
    firstName: formData.value.firstName,
    lastName: formData.value.lastName,
    role: formData.value.role,
    email: formData.value.email,
    phone: formData.value.phone,
    certifications,
    managerId: formData.value.managerId || undefined,
  };

  if (editingMemberId.value) {
    await store.updateTeamMember(memberData);
  } else {
    await store.addTeamMember(memberData);
  }

  closeModal();
};

const deleteMemberConfirm = async () => {
  if (!selectedMemberId.value) return;
  if (confirm('Are you sure you want to delete this team member? They will be removed from all events.')) {
    await store.deleteTeamMember(selectedMemberId.value);
    selectedMemberId.value = null;
  }
};

const closeModal = () => {
  showModal.value = false;
  editingMemberId.value = null;
  formData.value = {
    firstName: '',
    lastName: '',
    role: 'counselor',
    email: '',
    phone: '',
    certifications: [],
    managerId: '',
  };
  certificationsInput.value = '';
};
</script>

<style scoped>
.team-view {
  max-width: 1400px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 2px;
  background: var(--background);
}

.view-toggle .btn {
  padding: 0.5rem;
  border-radius: calc(var(--radius) - 2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.team-card {
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  gap: 1rem;
}

.team-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.member-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  flex-shrink: 0;
}

.member-details {
  flex: 1;
  min-width: 0;
}

.member-details h4 {
  margin-bottom: 0.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-item {
  padding: 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary-color);
}

.event-item-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

/* Table View Styles */
.team-table-container {
  background: var(--card-background);
  border-radius: var(--radius);
  overflow-x: auto;
  box-shadow: var(--shadow);
}

.team-table {
  width: 100%;
  border-collapse: collapse;
}

.team-table thead {
  background: var(--background);
  border-bottom: 2px solid var(--border-color);
}

.team-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.team-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: all 0.15s ease;
}

.team-table tbody tr:hover {
  background: var(--background);
}

.team-table td {
  padding: 1rem;
  font-size: 0.875rem;
}

.member-name-cell {
  min-width: 200px;
}

.member-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.member-avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.member-fullname {
  font-weight: 500;
  color: var(--text-primary);
}

.contact-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

/* Org Chart - Tree List Style */
.org-chart-container {
  padding: 0;
}

.hierarchy-tree {
  max-width: 1000px;
  margin: 0 auto;
}

.tree-section {
  margin-bottom: 2rem;
}

.tree-item {
  display: flex;
  align-items: stretch;
  margin-bottom: 0.5rem;
  position: relative;
}

.tree-item:hover .tree-content {
  background: var(--background);
  box-shadow: var(--shadow-lg);
}

.tree-line {
  position: relative;
  min-width: 40px;
  margin-right: 1rem;
}

.tree-line::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 20px;
  width: 2px;
  background: var(--border-color);
}

.tree-line::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 20px;
  width: 20px;
  height: 2px;
  background: var(--border-color);
}

.tree-line.is-last::before {
  bottom: 50%;
}

.level-0 .tree-line {
  display: none;
}

.level-1 .tree-line {
  margin-left: 0;
}

.level-2 .tree-line {
  margin-left: 40px;
}

.tree-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--card-background);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.level-0 .tree-content {
  border: 2px solid var(--primary-color);
  box-shadow: var(--shadow-lg);
}

.expand-btn {
  background: transparent;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.15s ease;
  border-radius: var(--radius);
  flex-shrink: 0;
}

.expand-btn:hover {
  background: var(--background);
  color: var(--primary-color);
}

.expand-btn svg {
  transition: transform 0.2s ease;
}

.tree-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 600;
  flex-shrink: 0;
}

.tree-avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.tree-info {
  flex: 1;
  min-width: 0;
}

.tree-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.tree-name-sm {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.125rem;
  color: var(--text-primary);
}

.tree-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tree-role {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.tree-role-sm {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.tree-count {
  font-size: 0.75rem;
  color: var(--primary-color);
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: 999px;
  opacity: 0.8;
}
</style>

