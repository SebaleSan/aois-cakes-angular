import { Routes } from '@angular/router';

import { Inicio } from './pages/inicio/inicio';
import { Catalogo } from './pages/catalogo/catalogo';
import { Registro } from './pages/registro/registro';
import { Login } from './pages/login/login';
import { Carro } from './pages/carro/carro';
import { Admin } from './pages/admin/admin';
import { Detalle } from './pages/detalle/detalle';
import { Panel } from './pages/panel/panel';
import { adminGuard } from './guards/admin-guard';
import { Recuperar } from './pages/recuperar/recuperar';
import { ProductoForm } from './pages/producto-form/producto-form';



export const routes: Routes = [
  { path: '', component: Inicio, title: 'Aois Cakes - Inicio' },
  { path: 'catalogo', component: Catalogo, title: 'Aois Cakes - Catálogo' },
  { path: 'registro', component: Registro, title: 'Aois Cakes - Registro' },
  { path: 'login', component: Login, title: 'Aois Cakes - Login' },
  { path: 'panel', component: Panel, title: 'Aois Cakes - Panel' },
  { path: 'carro', component: Carro, title: 'Aois Cakes - Carro' },
  { path: 'detalle/:id', component: Detalle, title: 'Aois Cakes - Detalle' },
  { path: 'admin', component: Admin, title: 'Aois Cakes - Admin', canActivate: [adminGuard] },
  { path: 'admin/productos/nuevo', component: ProductoForm, title: 'Aois Cakes - Nuevo producto', canActivate: [adminGuard] },
  { path: 'admin/productos/:id/editar', component: ProductoForm, title: 'Aois Cakes - Editar producto', canActivate: [adminGuard] },
  {path: 'recuperar', component: Recuperar, title: 'Aois Cakes - Recuperar password' },
  { path: '**', redirectTo: '' }
];