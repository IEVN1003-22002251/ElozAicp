import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-pre-register',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pre-register.component.html',
  styleUrls: ['./pre-register.component.css']
})
export class PreRegisterComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  selectRegistrationType(type: string): void {
    // Redirigir a la ruta de agregar visitante con el tipo seleccionado
    this.router.navigate(['/visitors/add'], { 
      queryParams: { type: type } 
    });
  }

  goBack(): void {
    // Verificar si el usuario es admin o residente
    const profile = this.authService.getCachedProfile();
    const isAdmin = profile?.role === 'admin';
    
    // Si es admin, regresar al dashboard; si es residente, regresar al home
    if (isAdmin) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
