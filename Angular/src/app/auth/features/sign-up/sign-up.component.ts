import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="signup-container">
      <div class="signup-card">
        <h1>AICP</h1>
        <h2>Registro</h2>
        <p>Funcionalidad de registro próximamente...</p>
        <button class="btn btn-secondary" (click)="goToSignIn()">Volver a Iniciar Sesión</button>
      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .signup-card {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    
    h1 {
      margin-bottom: 10px;
      color: #007bff;
    }
    
    h2 {
      margin-bottom: 20px;
      font-weight: 500;
    }
  `]
})
export class SignUpComponent {
  constructor(private router: Router) {}

  goToSignIn(): void {
    this.router.navigate(['/auth/sing-in']);
  }
}

