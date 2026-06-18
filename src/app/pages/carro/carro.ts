import { Component } from '@angular/core';
import {RouterLink } from '@angular/router';

@Component({
  selector: 'app-carro',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './carro.html',
  styleUrl: './carro.css',
})
export class Carro {}
