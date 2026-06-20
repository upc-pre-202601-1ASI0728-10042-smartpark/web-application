import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthenticatedUser,
  AuthResult,
  LoginRequest,
  RegisterRequest,
  UserRole,
} from './auth.models';

const TOKEN_KEY = 'smartpark.token';
const USER_KEY = 'smartpark.user';

/**
 * Servicio de autenticación: gestiona login/registro contra la API, persiste el
 * JWT, expone el usuario actual como signal reactivo y cierra la sesión
 * automáticamente al expirar el token.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private expiryTimer?: ReturnType<typeof setTimeout>;

  private readonly _user = signal<AuthenticatedUser | null>(this.restoreUser());

  /** Usuario autenticado actual (null si no hay sesión). */
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => {
    const u = this._user();
    return !!u && u.expiresAt.getTime() > Date.now();
  });
  readonly role = computed<UserRole | null>(() => this._user()?.role ?? null);

  login(request: LoginRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${this.baseUrl}/login`, request)
      .pipe(tap((result) => this.persist(result)));
  }

  register(request: RegisterRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${this.baseUrl}/register`, request)
      .pipe(tap((result) => this.persist(result)));
  }

  logout(): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persist(result: AuthResult): void {
    const user: AuthenticatedUser = {
      fullName: result.fullName,
      role: result.role,
      expiresAt: new Date(result.expiresAt),
    };
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
    this.scheduleExpiry(user);
  }

  /** Programa el cierre de sesión automático al llegar la expiración. */
  private scheduleExpiry(user: AuthenticatedUser): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    const ms = user.expiresAt.getTime() - Date.now();
    if (ms <= 0) {
      this.logout();
      return;
    }
    // setTimeout admite hasta ~24.8 días; las sesiones son mucho más cortas.
    this.expiryTimer = setTimeout(() => this.logout(), ms);
  }

  private restoreUser(): AuthenticatedUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as AuthenticatedUser;
      const user: AuthenticatedUser = { ...parsed, expiresAt: new Date(parsed.expiresAt) };
      if (user.expiresAt.getTime() <= Date.now()) {
        this.logout();
        return null;
      }
      this.scheduleExpiry(user);
      return user;
    } catch {
      return null;
    }
  }
}
