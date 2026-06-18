import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  function configure(): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('attaches the Bearer token when a session exists', () => {
    localStorage.setItem('smartpark.token', 'jwt-abc');
    configure();

    http.get('/api/v1/occupancy/summary').subscribe();

    const req = httpMock.expectOne('/api/v1/occupancy/summary');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
    req.flush({});
  });

  it('does not attach a header when there is no token', () => {
    localStorage.clear();
    configure();

    http.get('/api/v1/occupancy/summary').subscribe();

    const req = httpMock.expectOne('/api/v1/occupancy/summary');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
