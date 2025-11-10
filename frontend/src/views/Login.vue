<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-section">
          <Icon name="Sun" :size="32" />
          <h1>Summer Camp Manager</h1>
        </div>
        <p class="subtitle">
          {{
            mode === "login"
              ? "Sign in to your account"
              : "Create a new account"
          }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <BaseInput
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <BaseInput
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            :disabled="loading"
          />
        </div>

        <div v-if="mode === 'signup'" class="form-group">
          <label for="tenantId">Tenant ID</label>
          <BaseInput
            id="tenantId"
            v-model="tenantId"
            type="text"
            placeholder="Enter tenant ID"
            required
            :disabled="loading"
          />
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          :disabled="loading"
          class="submit-btn"
        >
          {{
            loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Sign Up"
          }}
        </BaseButton>

        <div class="mode-toggle">
          <span>{{
            mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"
          }}</span>
          <button
            type="button"
            @click="toggleMode"
            class="toggle-btn"
            :disabled="loading"
          >
            {{ mode === "login" ? "Sign Up" : "Sign In" }}
          </button>
        </div>
      </form>

      <details class="test-credentials">
        <summary>Test Credentials</summary>
        <div class="credentials-list">
          <div class="credential-item">
            <strong>System Admin</strong>
            <code>system@admin.com / password</code>
            <span class="role-badge system">System Access</span>
          </div>
          <div class="credential-item">
            <strong>Tenant Admin</strong>
            <code>tenant@admin.com / password</code>
            <span class="role-badge tenant">Tenant-wide Access</span>
          </div>
          <div class="credential-item">
            <strong>Camp Admin</strong>
            <code>camp@admin.com / password</code>
            <span class="role-badge camp-admin">Camp 1 Admin</span>
          </div>
          <div class="credential-item">
            <strong>Mixed Permissions</strong>
            <code>mixed@user.com / password</code>
            <span class="role-badge camp-admin">Camp 1 Admin</span>
            <span class="role-badge viewer">Camp 2 Viewer</span>
          </div>
          <div class="credential-item">
            <strong>Viewer</strong>
            <code>viewer@camp.com / password</code>
            <span class="role-badge viewer">Camp 1 Viewer</span>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { useMainStore } from "@/stores";
import { authService, campersService, campService, storageService } from "@/services";
import Icon from "@/components/Icon.vue";

export default defineComponent({
  name: "Login",
  components: {
    Icon,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const toastStore = useToastStore();
    const mainStore = useMainStore();

    const mode = ref<"login" | "signup">("login");
    const email = ref("");
    const password = ref("");
    const tenantId = ref("tenant-1");
    const loading = ref(false);

    const toggleMode = () => {
      mode.value = mode.value === "login" ? "signup" : "login";
      // Clear form on toggle
      email.value = "";
      password.value = "";
    };

    const loadDataAfterAuth = async () => {
      // Check if we have data, if not, seed with mock data
      const existingCampers = await campersService.listCampers();

      if (existingCampers.length === 0) {
        // Lazy load mock data only when needed
        const { mockData } = await import("@/data/mockData");
        await storageService.seedData(mockData);
      }

      await mainStore.loadAll();
    };

    const handleSubmit = async () => {
      loading.value = true;

      try {
        if (mode.value === "login") {
          // Example of using the generated API client directly
          // const response = await authService.login({
          //   email: email.value,
          //   password: password.value,
          // });

          // const camps = await campService.getCampsApi();

          await authStore.login(email.value, password.value);
          toastStore.success("Successfully logged in!");

          // Load data after successful login
          await loadDataAfterAuth();

          router.push("/");
        } else {
          await authStore.signup(email.value, password.value, tenantId.value);
          toastStore.success("Account created successfully!");

          // Load data after successful signup
          await loadDataAfterAuth();

          router.push("/");
        }
      } catch (error) {
        toastStore.error(
          error instanceof Error ? error.message : "Authentication failed"
        );
      } finally {
        loading.value = false;
      }
    };

    return {
      mode,
      email,
      password,
      tenantId,
      loading,
      toggleMode,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-dark) 100%
  );
  padding: 1rem;
}

.login-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo-section h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.submit-btn {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.mode-toggle {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.toggle-btn:hover:not(:disabled) {
  color: var(--primary-dark);
}

.toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-credentials {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
}

.test-credentials summary {
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: background 0.15s ease;
}

.test-credentials summary:hover {
  background: var(--surface-secondary);
}

.credentials-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.credential-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--surface-secondary);
  border-radius: var(--radius);
  font-size: 0.813rem;
}

.credential-item strong {
  color: var(--text-primary);
  font-size: 0.875rem;
}

.credential-item code {
  background: var(--background);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-family: "Monaco", "Courier New", monospace;
  font-size: 0.75rem;
  color: var(--text-primary);
  display: inline-block;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.688rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.system {
  background: #8b5cf6;
  color: white;
}

.role-badge.tenant {
  background: #0ea5e9;
  color: white;
}

.role-badge.camp-admin {
  background: #10b981;
  color: white;
}

.role-badge.viewer {
  background: #f59e0b;
  color: white;
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }

  .logo-section h1 {
    font-size: 1.25rem;
  }
}
</style>
