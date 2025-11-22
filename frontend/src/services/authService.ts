/**
 * Unified Authentication Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from '@/config/dataSource';
import { authStorage } from './authStorage';
import { authApi } from './api/authApi';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  User,
} from '@/generated/api';

const impl = () => isBackendEnabled() ? authApi : authStorage;

export const authService = {
  login: (credentials: LoginRequest): Promise<LoginResponse> => impl().login(credentials),
  signup: (signupData: SignupRequest): Promise<LoginResponse> => impl().signup(signupData),
  logout: (): Promise<void> => impl().logout(),
  getCurrentUser: (): Promise<User> => impl().getCurrentUser(),
  isAuthenticated: (): boolean => impl().isAuthenticated(),
};
