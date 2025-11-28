import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VisitorService } from '../../services/visitor.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Editar Visitante</h1>
      
      <div *ngIf="loading" class="loading">Cargando...</div>
      
      <form *ngIf="!loading" (ngSubmit)="onSubmit()" #visitorForm="ngForm">
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" class="form-control" [(ngModel)]="visitor.name" name="name" required />
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input type="email" class="form-control" [(ngModel)]="visitor.email" name="email" />
        </div>
        
        <div class="form-group">
          <label>Teléfono</label>
          <input type="text" class="form-control" [(ngModel)]="visitor.phone" name="phone" />
        </div>
        
        <div *ngIf="error" class="error">{{ error }}</div>
        
        <button type="submit" class="btn btn-primary" [disabled]="saving || !visitorForm.valid">
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </button>
        <button type="button" class="btn btn-secondary" (click)="cancel()">Cancelar</button>
      </form>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .error {
      color: #dc3545;
      margin-bottom: 20px;
    }
  `]
})
export class EditComponent implements OnInit {
  visitor: any = {};
  loading = true;
  saving = false;
  error = '';

  constructor(
    private visitorService: VisitorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVisitor(id);
    }
  }

  loadVisitor(id: string): void {
    this.visitorService.getVisitor(id).subscribe({
      next: (response) => {
        if (response.exito) {
          this.visitor = response.visitor || {};
        } else {
          this.error = response.mensaje || 'Error al cargar visitante';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.saving || !this.visitor.id) return;

    this.saving = true;
    this.error = '';

    this.visitorService.updateVisitor(this.visitor.id, this.visitor).subscribe({
      next: (response) => {
        if (response.exito) {
          this.router.navigate(['/visitors/list']);
        } else {
          this.error = response.mensaje || 'Error al actualizar visitante';
          this.saving = false;
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/visitors/list']);
  }
}

