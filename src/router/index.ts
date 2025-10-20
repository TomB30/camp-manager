import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: () => import("../views/Dashboard.vue"),
    },
    {
      path: "/calendar",
      name: "calendar",
      component: () => import("../views/Calendar.vue"),
    },
    {
      path: "/campers",
      name: "campers",
      component: () => import("../views/Campers.vue"),
    },
    {
      path: "/staff",
      name: "staff",
      component: () => import("../views/StaffMembers.vue"),
    },
    {
      path: "/groups",
      name: "groups",
      component: () => import("../views/Groups.vue"),
    },
    {
      path: "/programs",
      name: "programs",
      component: () => import("../views/Programs.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/CampSettings.vue"),
    },
  ],
});

export default router;
