import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CarroService, CompraPedido, ItemCarro } from '../../services/carro';
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
  compraRealizada = false;
  compraEnProceso = false;
  ultimaCompra: CompraPedido | null = null;
  private sub: Subscription = new Subscription();
  private temporizadorCompra: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public carroService: CarroService,
    public authService: AuthService,
    private zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.sub = this.carroService.items$.subscribe(items => {
      this.items = items;

      if (items.length > 0 && this.compraRealizada) {
        this.compraRealizada = false;
        this.ultimaCompra = null;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.temporizadorCompra) {
      clearTimeout(this.temporizadorCompra);
    }

    this.sub.unsubscribe();
  }

  finalizarPedido(): void {
    if (this.compraEnProceso || this.items.length === 0) {
      return;
    }

    const itemsPendientes = this.items.map(item => ({
      producto: { ...item.producto },
      cantidad: item.cantidad
    }));

    this.compraEnProceso = true;
    this.compraRealizada = false;
    this.ultimaCompra = null;

    this.temporizadorCompra = setTimeout(() => {
      this.zone.run(() => {
        try {
          const compra = this.carroService.finalizarPedido(itemsPendientes);

          if (compra) {
            this.ultimaCompra = compra;
            this.compraRealizada = true;
          }
        } finally {
          this.compraEnProceso = false;
          this.temporizadorCompra = null;
          this.changeDetectorRef.detectChanges();
        }
      });
    }, 1600);
  }

  trackByProductoId(index: number, item: ItemCarro): number {
    return item.producto.id;
  }
}