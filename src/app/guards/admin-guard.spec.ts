import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { adminGuard } from './admin-guard';
import { AuthService } from '../services/auth';
import { vi } from 'vitest';

describe('adminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { esAdmin: true } },
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    });
  });

  it('deberia permitir acceder si el rol es admin', () => {
    const result = executeGuard({} as any, {} as any);
    expect(result).toBe(true);
  });

  it('deberia denegar el acceso si el rol no es admin', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { esAdmin: false } },
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    });

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(false);
  });
});
