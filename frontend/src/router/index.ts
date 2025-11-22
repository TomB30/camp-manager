import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";

// Static imports for instant navigation after initial load
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import Calendar from "../views/Calendar.vue";
import Campers from "../views/Campers.vue";
import StaffMembers from "../views/StaffMembers.vue";
import Groups from "../views/Groups.vue";
import Programs from "../views/Programs.vue";
import CampSettings from "../views/CampSettings.vue";
import TimeBlocks from "../views/TimeBlocks.vue";
import Sessions from "../views/Sessions.vue";
import Areas from "../views/Areas.vue";
import Locations from "../views/Locations.vue";
import Housing from "../views/Housing.vue";
import Certifications from "../views/Certifications.vue";
import Roles from "../views/Roles.vue";
import Colors from "../views/Colors.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: "/",
      name: "dashboard",
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path: "/calendar",
      name: "calendar",
      component: Calendar,
      meta: { requiresAuth: true },
    },
    {
      path: "/campers",
      name: "campers",
      component: Campers,
      meta: { requiresAuth: true },
    },
    {
      path: "/staff",
      name: "staff",
      component: StaffMembers,
      meta: { requiresAuth: true },
    },
    {
      path: "/groups",
      name: "groups",
      component: Groups,
      meta: { requiresAuth: true },
    },
    {
      path: "/programs",
      name: "programs",
      component: Programs,
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      component: CampSettings,
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          redirect: "/settings/time-blocks",
        },
        {
          path: "time-blocks",
          name: "settings-time-blocks",
          component: TimeBlocks,
          meta: { requiresAuth: true },
        },
        {
          path: "sessions",
          name: "settings-sessions",
          component: Sessions,
          meta: { requiresAuth: true },
        },
        {
          path: "areas",
          name: "settings-areas",
          component: Areas,
          meta: { requiresAuth: true },
        },
        {
          path: "locations",
          name: "settings-locations",
          component: Locations,
          meta: { requiresAuth: true },
        },
        {
          path: "housing",
          name: "settings-housing",
          component: Housing,
          meta: { requiresAuth: true },
        },
        {
          path: "certifications",
          name: "settings-certifications",
          component: Certifications,
          meta: { requiresAuth: true },
        },
        {
          path: "roles",
          name: "settings-roles",
          component: Roles,
          meta: { requiresAuth: true },
        },
        {
          path: "colors",
          name: "settings-colors",
          component: Colors,
          meta: { requiresAuth: true },
        },
      ],
    },
  ],
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const uiStore = useUIStore();

  // Check if route requires auth
  const requiresAuth = to.meta.requiresAuth !== false;

  // Check authentication on first navigation
  if (from.name === undefined) {
    await authStore.checkAuth();
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
