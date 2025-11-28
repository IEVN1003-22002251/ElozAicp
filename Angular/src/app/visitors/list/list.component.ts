import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VisitorService } from '../../services/visitor.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header-section">
        <h1>Lista de Visitantes</h1>
        <div class="header-buttons">
          <button class="btn btn-back" (click)="goToDashboard()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Regresar al Dashboard
          </button>
          <button class="btn btn-primary" (click)="goToAdd()">Agregar Visitante</button>
        </div>
      </div>
      
      <div *ngIf="loading" class="loading">Cargando...</div>
      
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="visitors && visitors.length > 0" class="visitors-list">
        <div *ngFor="let visitor of visitors" class="visitor-card">
          <h3>{{ visitor.name }}</h3>
          <p>Email: {{ visitor.email }}</p>
          <p>Tipo: {{ visitor.type }}</p>
          <p>Estado: {{ visitor.status }}</p>
          <button class="btn btn-secondary" (click)="editVisitor(visitor.id)">Editar</button>
        </div>
      </div>
      
      <div *ngIf="visitors && visitors.length === 0" class="no-data">
        No hay visitantes registrados
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      min-height: 100vh;
      background-color: #1a1a1a;
    }
    
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .header-section h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    
    .header-buttons {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .visitors-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .visitor-card {
      background-color: #2a2a2a;
      padding: 20px;
      border-radius: 8px;
      color: #ffffff;
    }
    
    .visitor-card h3 {
      color: #ffffff;
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .visitor-card p {
      color: rgba(255, 255, 255, 0.8);
      margin: 8px 0;
      font-size: 14px;
    }
    
    .loading, .error, .no-data {
      text-align: center;
      padding: 20px;
      margin-top: 20px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .error {
      color: #dc3545;
    }
    
    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: #ffffff;
    }
    
    .btn-primary:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
    
    .btn-back {
      background-color: transparent;
      color: #ffffff;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    .btn-back:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }
    
    .btn-back svg {
      width: 16px;
      height: 16px;
    }
    
    .btn-secondary {
      background-color: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      margin-top: 12px;
    }
    
    .btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    @media (max-width: 768px) {
      .header-section {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .header-buttons {
        width: 100%;
        flex-direction: column;
      }
      
      .header-buttons .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ListComponent implements OnInit {
  visitors: any[] = [];
  loading = false;
  error = '';

  constructor(
    private visitorService: VisitorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVisitors();
  }

  loadVisitors(): void {
    this.loading = true;
    this.error = '';
    
    this.visitorService.getVisitors().subscribe({
      next: (response) => {
        if (response.exito) {
          this.visitors = response.visitors || [];
        } else {
          this.error = response.mensaje || 'Error al cargar visitantes';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  goToAdd(): void {
    this.router.navigate(['/visitors/add']);
  }

  editVisitor(id: string): void {
    this.router.navigate(['/visitors/edit', id]);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}

