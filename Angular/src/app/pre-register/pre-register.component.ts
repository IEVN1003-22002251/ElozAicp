import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pre-register',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pre-register.component.html',
  styleUrls: ['./pre-register.component.css']
})
export class PreRegisterComponent {
  constructor(
    private router: Router
  ) {}

  selectRegistrationType(type: string): void {
    // Redirigir a la ruta de agregar visitante con el tipo seleccionado
    this.router.navigate(['/visitors/add'], { 
      queryParams: { type: type } 
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
