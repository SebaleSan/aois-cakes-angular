import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Buscador } from '../buscador/buscador';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Buscador],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {}