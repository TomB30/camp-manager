import {
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
  getCurrentUser as apiGetCurrentUser,
} from "@/generated/api/sdk.gen";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  User,
} from "@/generated/api";
import { apiClient, setAuthToken, clearAuthToken } from "@/config/api";

/**
 * Authentication service that wraps the generated API client functions
 * Provides a clean interface for authentication operations
 */
export const authService = {
  login,
  signup,
  logout,
  getCurrentUser,
  isAuthenticated,
};


/**
 * Authenticate a user with email and password
 * @param credentials - User's email and password
 * @returns LoginResponse containing user data and token
 * @throws Error if login fails
 */
async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiLogin({
      client: apiClient,
      body: credentials,
    });

    if (response.error) {
      const errorMessage = typeof response.error === 'object' && 'message' in response.error
        ? String(response.error.message)
        : "Login failed";
      throw new Error(errorMessage);
    }

    if (!response.data) {
      throw new Error("No data returned from login");
    }

    // Store the token for subsequent requests
    if (response.data.token) {
      setAuthToken(response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Register a new user
 * @param signupData - User's email, password, and tenant ID
 * @returns LoginResponse containing user data and token
 * @throws Error if signup fails
 */
async function signup(signupData: SignupRequest): Promise<LoginResponse> {
  try {
    const response = await apiSignup({
      client: apiClient,
      body: signupData,
    });

    if (response.error) {
      const errorMessage = typeof response.error === 'object' && 'message' in response.error
        ? String(response.error.message)
        : "Signup failed";
      throw new Error(errorMessage);
    }

    if (!response.data) {
      throw new Error("No data returned from signup");
    }

    // Store the token for subsequent requests
    if (response.data.token) {
      setAuthToken(response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}

/**
 * Logout the current user
 * @throws Error if logout fails
 */
async function logout(): Promise<void> {
  try {
    const response = await apiLogout({
      client: apiClient,
    });

    if (response.error) {
      console.error("Logout error:", response.error);
      // Continue with cleanup even if API call fails
    }

    // Clear stored authentication data
    clearAuthToken();
  } catch (error) {
    console.error("Logout error:", error);
    // Clear stored authentication data even if API call fails
    clearAuthToken();
    throw error;
  }
}

/**
 * Get the current authenticated user
 * @returns User data if authenticated
 * @throws Error if not authenticated or request fails
 */
async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiGetCurrentUser({
      client: apiClient,
    });

    if (response.error) {
      const errorMessage = typeof response.error === 'object' && 'message' in response.error
        ? String(response.error.message)
        : "Failed to get current user";
      throw new Error(errorMessage);
    }

    if (!response.data?.user) {
      throw new Error("No user data returned");
    }

    return response.data.user;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
}

/**
 * Check if a user is currently authenticated
 * @returns true if user has a valid token, false otherwise
 */
function isAuthenticated(): boolean {
  // Check if token exists in localStorage
  const token = localStorage.getItem("auth_token");
  return !!token;
}

