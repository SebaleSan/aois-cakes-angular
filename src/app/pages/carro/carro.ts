import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CarroService, ItemCarro } from '../../services/carro';
import { AuthService } from '../../services/auth';

/**
 * @description
 * Componente contenedor de la vista del carrito de compras.
 *
 * Este componente escucha los cambios del servicio de carrito y mantiene una
 * copia local de los items para renderizarlos en la plantilla.
 */
@Component({
  selector: 'app-carro',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carro.html',
  styleUrl: './carro.css'
})
export class Carro implements OnInit, OnDestroy {

  items: ItemCarro[] = [];
  private sub: Subscription = new Subscription();

  constructor(
    public carroService: CarroService,
    public authService: AuthService
  ) {}


  ngOnInit(): void {
    this.sub = this.carroService.items$.subscribe(items => {
      this.items = items;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}