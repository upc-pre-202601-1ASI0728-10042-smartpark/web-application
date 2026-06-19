import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthResult } from './auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const sample: AuthResult = {
    token: 'jwt-123',
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    role: 'Operator',
    fullName: 'Abel Valle',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('persists token and user on successful login', () => {
    service.login({ email: 'op@smartpark.pe', password: 'secret1' }).subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush(sample);

    expect(service.token).toBe('jwt-123');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.user()?.role).toBe('Operator');
    expect(service.user()?.fullName).toBe('Abel Valle');
  });

  it('clears the session on logout', () => {
    service.login({ email: 'op@smartpark.pe', password: 'secret1' }).subscribe();
    httpMock.expectOne((r) => r.url.endsWith('/auth/login')).flush(sample);

    service.logout();

    expect(service.token).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.user()).toBeNull();
  });
});
