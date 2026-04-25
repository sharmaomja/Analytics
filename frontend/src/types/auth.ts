export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: User;
};

export type MeResponse = {
  user: User;
};
