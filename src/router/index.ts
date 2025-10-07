import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Calendar from '../views/Calendar.vue';
import Children from '../views/Children.vue';
import TeamMembers from '../views/TeamMembers.vue';
import Rooms from '../views/Rooms.vue';
import SleepingRooms from '../views/SleepingRooms.vue';

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
      path: '/children',
      name: 'children',
      component: Children,
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
  ],
});

export default router;

