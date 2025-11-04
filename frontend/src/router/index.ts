import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/",
      name: "dashboard",
      component: () => import("../views/Dashboard.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/calendar",
      name: "calendar",
      component: () => import("../views/Calendar.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/campers",
      name: "campers",
      component: () => import("../views/Campers.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/staff",
      name: "staff",
      component: () => import("../views/StaffMembers.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/groups",
      name: "groups",
      component: () => import("../views/Groups.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/programs",
      name: "programs",
      component: () => import("../views/Programs.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/CampSettings.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Check if route requires auth
  const requiresAuth = to.meta.requiresAuth !== false;
  
  // Check authentication on first navigation
  if (from.name === undefined) {
    authStore.checkAuth();
  }
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: "login" });
  } else if (to.name === "login" && authStore.isAuthenticated) {
    // Redirect to dashboard if already authenticated
    next({ name: "dashboard" });
  } else {
    next();
  }
});

export default router;
