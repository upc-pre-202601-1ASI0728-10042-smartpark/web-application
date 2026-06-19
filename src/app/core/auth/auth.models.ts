/** Roles soportados por la API de SmartPark (Identity & Access). */
export type UserRole = 'Operator' | 'Driver';

/** Credenciales para iniciar sesión. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Datos para registrar un nuevo usuario. */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

/** Respuesta del backend al autenticar (AuthResult). */
export interface AuthResult {
  token: string;
  expiresAt: string;
  role: UserRole;
  fullName: string;
}

/** Usuario autenticado en sesión, derivado del AuthResult. */
export interface AuthenticatedUser {
  fullName: string;
  role: UserRole;
  expiresAt: Date;
}
