export interface RegisterRequest {
  email: string;
  userId: string;
  brandName: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  userId: string;
  brandName: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  userId?: string;
  brandName?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
