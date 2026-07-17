// components/toast/toast.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../services/notificacion';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class Toast {
  constructor(public notificacionService: NotificacionService) {}

  trackById(index: number, notificacion: { id: number }): number {
    return notificacion.id;
  }
}