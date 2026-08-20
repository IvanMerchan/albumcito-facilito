export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Shape returned by the auth Server Actions to useActionState.
export interface AuthFormState {
  error?: string;
}
