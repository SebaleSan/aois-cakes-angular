import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Buscador } from '../buscador/buscador';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule, Buscador],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {

  logueado: boolean = false;
  esAdmin: boolean = false;
  private sub: Subscription = new Subscription();

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.usuarioActual$.subscribe(usuario => {
      this.logueado = usuario !== null;
      this.esAdmin = usuario?.rol === 'admin';
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  cerrarNavbar(event: MouseEvent): void {
    const navbar = document.getElementById('navbarNav');
    const toggler = document.querySelector('.navbar-toggler');

    if (navbar?.classList.contains('show') &&
        !navbar.contains(event.target as Node) &&
        !toggler?.contains(event.target as Node)) {
      toggler?.dispatchEvent(new Event('click'));
    }
  }

  @HostListener('window:scroll')
  cerrarNavbarScroll(): void {
    const navbar = document.getElementById('navbarNav');
    const toggler = document.querySelector('.navbar-toggler');

    if (navbar?.classList.contains('show')) {
      toggler?.dispatchEvent(new Event('click'));
    }
  }

  cerrarMenu(): void {
  const navbar = document.getElementById('navbarNav');
  const toggler = document.querySelector('.navbar-toggler');
  if (navbar?.classList.contains('show')) {
    toggler?.dispatchEvent(new Event('click'));
  }
}
}