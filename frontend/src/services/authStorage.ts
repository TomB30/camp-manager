/**
 * LocalStorage implementation for Authentication
 * Uses mock users for development/testing
 */
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  User,
} from "@/generated/api";

const AUTH_STORAGE_KEY = "camp_manager_auth";
const MOCK_TOKEN = "mock-jwt-token-123456789";

// Mock users for development
const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: "user-system",
    email: "system@admin.com",
    password: "password",
    tenantId: "tenant-1",
    accessRules: [
      {
        role: "admin",
        scopeType: "system",
        scopeId: null,
      },
    ],
  },
  {
    id: "user-tenant-admin",
    email: "tenant@admin.com",
    password: "password",
    tenantId: "tenant-1",
    accessRules: [
      {
        role: "admin",
        scopeType: "tenant",
        scopeId: "tenant-1",
      },
    ],
  },
  {
    id: "user-camp-admin",
    email: "camp@admin.com",
    password: "password",
    tenantId: "tenant-1",
    accessRules: [
      {
        role: "admin",
        scopeType: "camp",
        scopeId: "camp-1",
      },
    ],
  },
  {
    id: "user-mixed",
    email: "mixed@user.com",
    password: "password",
    tenantId: "tenant-1",
    accessRules: [
      {
        role: "admin",
        scopeType: "camp",
        scopeId: "camp-1",
      },
      {
        role: "viewer",
        scopeType: "camp",
        scopeId: "camp-2",
      },
    ],
  },
  {
    id: "user-viewer",
    email: "viewer@camp.com",
    password: "password",
    tenantId: "tenant-1",
    accessRules: [
      {
        role: "viewer",
        scopeType: "camp",
        scopeId: "camp-1",
      },
    ],
  },
];

export const authStorage = {
  login,
  signup,
  logout,
  getCurrentUser,
  isAuthenticated,
};

/**
 * Authenticate a user with email and password (mock implementation)
 * @param credentials - User's email and password
 * @returns LoginResponse containing user data and mock token
 * @throws Error if login fails
 */
async function login(credentials: LoginRequest): Promise<LoginResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock login - validate against mock users
  const user = MOCK_USERS.find(
    (u) => u.email === credentials.email && u.password === credentials.password,
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Remove password from stored user
  const { password: _, ...userWithoutPassword } = user;

  // Save to localStorage
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
  localStorage.setItem("auth_token", MOCK_TOKEN);

  return {
    user: userWithoutPassword,
    token: MOCK_TOKEN,
  };
}

/**
 * Register a new user (mock implementation)
 * @param signupData - User's email, password, and tenant ID
 * @returns LoginResponse containing user data and mock token
 * @throws Error if signup fails
 */
async function signup(signupData: SignupRequest): Promise<LoginResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock signup - check if user already exists
  const existingUser = MOCK_USERS.find((u) => u.email === signupData.email);

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Create new user with viewer access
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: signupData.email,
    tenantId: signupData.tenantId,
    accessRules: [
      {
        role: "viewer",
        scopeType: "tenant",
        scopeId: signupData.tenantId,
      },
    ],
  };

  // Save to localStorage
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
  localStorage.setItem("auth_token", MOCK_TOKEN);

  return {
    user: newUser,
    token: MOCK_TOKEN,
  };
}

/**
 * Logout the current user (mock implementation)
 */
async function logout(): Promise<void> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Clear stored authentication data
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("auth_token");
}

/**
 * Get the current authenticated user from localStorage
 * @returns User data if authenticated
 * @throws Error if not authenticated
 */
async function getCurrentUser(): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const stored = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) {
    throw new Error("Not authenticated");
  }

  try {
    const user = JSON.parse(stored) as User;
    return user;
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    throw new Error("Invalid stored user data");
  }
}

/**
 * Check if a user is currently authenticated
 * @returns true if user has a valid token, false otherwise
 */
function isAuthenticated(): boolean {
  const token = localStorage.getItem("auth_token");
  return !!token;
}

