import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth';
import { USUARIOS } from '../data/usuarios';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });
Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock, writable: true });

describe('AuthService', () => {

  let service: AuthService;

  beforeEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
    localStorageMock.setItem('aoisCakesUsuarios', JSON.stringify(USUARIOS));
    service = new AuthService();
  });

  it('debe iniciar sesión correctamente con credenciales válidas', () => {
    const resultado = service.login('cliente@aoiscakes.cl', 'Cliente123');

    expect(resultado.ok).toBe(true);
    expect(resultado.mensaje).toBe('Inicio de sesión correcto.');
    expect(service.logueado).toBe(true);
    expect(service.usuarioActual?.correo).toBe('cliente@aoiscakes.cl');
  });

  it('debe rechazar login con contraseña incorrecta', () => {
    const resultado = service.login('cliente@aoiscakes.cl', 'wrongpassword');

    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toBe('Correo o contraseña incorrectos.');
    expect(service.logueado).toBe(false);
  });

   it('debe rechazar registro si el correo ya está en uso', () => {
  const resultado = service.registrar(
    'Otro Cliente',
    'otrocliente',
    'cliente@aoiscakes.cl',
    '', 
    'Cliente123!',
    '2000-01-01',
    'cliente'
  );

  expect(resultado.ok).toBe(false);
  expect(resultado.mensaje).toBe('Ya existe una cuenta con ese correo.');
});

  it('debe rechazar cambio de contraseña si la contraseña actual es incorrecta', () => {
    service.login('cliente@aoiscakes.cl', 'Cliente123');

    const resultado = service.cambiarPassword('passwordIncorrecta', 'NuevaPass1!');

    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toBe('La contraseña actual es incorrecta.');
  });

});