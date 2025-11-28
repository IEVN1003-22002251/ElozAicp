import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegistrationService } from '../services/registration.service';

@Component({
  selector: 'app-pending-registrations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-registrations.component.html',
  styleUrls: ['./pending-registrations.component.css']
})
export class PendingRegistrationsComponent implements OnInit {
  registrations: any[] = [];
  loading = false;
  error = '';
  success = '';

  constructor(
    private router: Router,
    private registrationService: RegistrationService
  ) {}

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.loading = true;
    this.error = '';
    
    this.registrationService.getPendingRegistrations().subscribe({
      next: (response) => {
        if (response.success) {
          // Filtrar solo los registros con status 'pending'
          this.registrations = (response.data || []).filter(
            (reg: any) => reg.status === 'pending'
          );
        } else {
          this.error = 'Error al cargar los registros pendientes';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || err.error?.message || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  approveRegistration(registration: any): void {
    if (!registration.id || this.loading) return;

    if (!confirm(`¿Estás seguro de aprobar el registro de ${registration.full_name}?`)) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.registrationService.approveRegistration(registration.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Registro aprobado exitosamente';
          // Recargar la lista de registros
          this.loadRegistrations();
          setTimeout(() => {
            this.success = '';
          }, 3000);
        } else {
          this.error = 'Error al aprobar el registro';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || err.error?.message || 'Error al aprobar el registro';
        this.loading = false;
      }
    });
  }

  rejectRegistration(registration: any): void {
    if (!registration.id || this.loading) return;

    const reason = prompt(`¿Por qué deseas rechazar el registro de ${registration.full_name}? (Opcional)`);

    this.loading = true;
    this.error = '';
    this.success = '';

    this.registrationService.rejectRegistration(registration.id, reason || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Registro rechazado exitosamente';
          // Recargar la lista de registros
          this.loadRegistrations();
          setTimeout(() => {
            this.success = '';
          }, 3000);
        } else {
          this.error = 'Error al rechazar el registro';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || err.error?.message || 'Error al rechazar el registro';
        this.loading = false;
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return date;
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
