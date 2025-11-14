import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";

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
      component: () => import("../views/CampSettings.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          redirect: "/settings/sessions",
        },
        {
          path: "sessions",
          name: "settings-sessions",
          component: () => import("../components/settings/SessionsTab.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "duration-presets",
          name: "settings-duration-presets",
          component: () =>
            import("../components/settings/DurationPresetsTab.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "areas",
          name: "settings-areas",
          component: () => import("../components/settings/AreasTab.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "locations",
          name: "settings-locations",
          component: () => import("../components/settings/LocationsTab.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "housing",
          name: "settings-housing",
          component: () => import("../components/settings/HousingTab.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "certifications",
          name: "settings-certifications",
          component: () =>
            import("../components/settings/CertificationsTab.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "roles",
          name: "settings-roles",
          component: () => import("../components/settings/RolesTab.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "colors",
          name: "settings-colors",
          component: () => import("../components/settings/ColorsTab.vue"),
          meta: { requiresAuth: true },
        },
      ],
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const uiStore = useUIStore();

  // Check if route requires auth
  const requiresAuth = to.meta.requiresAuth !== false;

  // Check authentication on first navigation
  if (from.name === undefined) {
    authStore.checkAuth();
  }

  // Handle sidebar mode based on route
  if (to.path.startsWith("/settings")) {
    uiStore.setSidebarMode("settings");
  } else {
    uiStore.setSidebarMode("main");
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
