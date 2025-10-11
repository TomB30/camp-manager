import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Calendar from '../views/Calendar.vue';
import Campers from '../views/Campers.vue';
import StaffMembers from '../views/StaffMembers.vue';
import Rooms from '../views/Rooms.vue';
import SleepingRooms from '../views/SleepingRooms.vue';
import Groups from '../views/Groups.vue';
import FamilyGroups from '../views/FamilyGroups.vue';

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
      path: '/rooms',
      name: 'rooms',
      component: Rooms,
    },
    {
      path: '/sleeping-rooms',
      name: 'sleeping-rooms',
      component: SleepingRooms,
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
  ],
});

export default router;

