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
      <h1>Lista de Visitantes</h1>
      <button class="btn btn-primary" (click)="goToAdd()">Agregar Visitante</button>
      
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
    }
    
    .loading, .error, .no-data {
      text-align: center;
      padding: 20px;
      margin-top: 20px;
    }
    
    .error {
      color: #dc3545;
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

