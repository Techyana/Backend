export interface AuthUserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  isActive: boolean;
}
