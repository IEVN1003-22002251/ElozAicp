import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VisitorService } from '../../services/visitor.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  visitor: any = {};
  loading = true;
  saving = false;
  error = '';

  constructor(
    private visitorService: VisitorService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
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
          // Si es admin, regresar al historial; si es residente, al home
          const profile = this.authService.getCachedProfile();
          const isAdmin = profile?.role === 'admin';
          this.router.navigate([isAdmin ? '/history' : '/home']);
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
    // Si es admin, regresar al historial; si es residente, al home
    const profile = this.authService.getCachedProfile();
    const isAdmin = profile?.role === 'admin';
    this.router.navigate([isAdmin ? '/history' : '/home']);
  }
}

