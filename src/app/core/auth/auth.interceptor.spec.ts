import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth.interceptor';

const API_URL = `${environment.apiBaseUrl}/occupancy/summary`;

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

  it('attaches the Bearer token to API calls when a session exists', () => {
    localStorage.setItem('smartpark.token', 'jwt-abc');
    configure();

    http.get(API_URL).subscribe();

    const req = httpMock.expectOne(API_URL);
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
    req.flush({});
  });

  it('does not attach a header when there is no token', () => {
    localStorage.clear();
    configure();

    http.get(API_URL).subscribe();

    const req = httpMock.expectOne(API_URL);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('does not attach the token to third-party URLs', () => {
    localStorage.setItem('smartpark.token', 'jwt-abc');
    configure();

    http.get('https://example.com/data').subscribe();

    const req = httpMock.expectOne('https://example.com/data');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
