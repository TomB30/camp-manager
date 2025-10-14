import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Calendar from '../views/Calendar.vue';
import Campers from '../views/Campers.vue';
import StaffMembers from '../views/StaffMembers.vue';
import Groups from '../views/Groups.vue';
import FamilyGroups from '../views/FamilyGroups.vue';
import Programs from '../views/Programs.vue';
import CampSettings from '../views/CampSettings.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: Calendar,
    },
    {
      path: '/campers',
      name: 'campers',
      component: Campers,
    },
    {
      path: '/staff',
      name: 'staff',
      component: StaffMembers,
    },
    {
      path: '/groups',
      name: 'groups',
      component: Groups,
    },
    {
      path: '/family-groups',
      name: 'family-groups',
      component: FamilyGroups,
    },
    {
      path: '/programs',
      name: 'programs',
      component: Programs,
    },
    {
      path: '/settings',
      name: 'settings',
      component: CampSettings,
    },
  ],
});

export default router;

