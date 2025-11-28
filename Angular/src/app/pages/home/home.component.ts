import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <header class="home-header">
        <h1>AICP</h1>
        <button class="btn btn-secondary" (click)="goToDashboard()">Dashboard</button>
      </header>
      
      <main class="home-content">
        <h2>Página Principal</h2>
        <p>Contenido de la página principal aquí...</p>
      </main>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background-color: #1a1a1a;
    }
    
    .home-header {
      background-color: #2a2a2a;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .home-content {
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class HomeComponent {
  constructor(private router: Router) {}

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}

