import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Calendar from '../views/Calendar.vue';
import Campers from '../views/Campers.vue';
import TeamMembers from '../views/TeamMembers.vue';
import Rooms from '../views/Rooms.vue';
import SleepingRooms from '../views/SleepingRooms.vue';
import Groups from '../views/Groups.vue';

const router = createRouter({
  history: createWebHistory(),
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
      path: '/team',
      name: 'team',
      component: TeamMembers,
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
  ],
});

export default router;

