export type RolUsuario = 'cliente' | 'admin';

export interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  correo: string;
  direccion: string;
  password: string;
  rol: RolUsuario;
}

export const USUARIOS: Usuario[] = [
  {
    id: 1,
    nombre: 'Cliente Aois Cakes',
    usuario: 'cliente1',
    correo: 'cliente@aoiscakes.cl',
    direccion: '',
    password: 'Cliente123',
    rol: 'cliente'
  },
  {
    id: 2,
    nombre: 'Administrador Aois Cakes',
    usuario: 'admin',
    correo: 'admin@aoiscakes.cl',
    direccion: '',
    password: 'Admin123',
    rol: 'admin'
  }
];