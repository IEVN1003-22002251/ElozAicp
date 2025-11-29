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
  allRegistrations: any[] = [];
  pendingRegistrations: any[] = [];
  approvedRegistrations: any[] = [];
  rejectedRegistrations: any[] = [];
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
          this.allRegistrations = response.data || [];
          this.separateRegistrationsByStatus();
        } else {
          this.error = 'Error al cargar los registros';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || err.error?.message || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  separateRegistrationsByStatus(): void {
    this.pendingRegistrations = this.allRegistrations.filter(
      (reg: any) => reg.status === 'pending'
    );
    this.approvedRegistrations = this.allRegistrations.filter(
      (reg: any) => reg.status === 'approved'
    );
    this.rejectedRegistrations = this.allRegistrations.filter(
      (reg: any) => reg.status === 'rejected'
    );
  }

  approveRegistration(registration: any): void {
    if (!registration.id || this.loading || registration.status !== 'pending') return;

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
          // Actualizar el estado del registro localmente
          registration.status = 'approved';
          registration.updated_at = new Date().toISOString();
          // Mover el registro de pendientes a aprobados
          this.pendingRegistrations = this.pendingRegistrations.filter(r => r.id !== registration.id);
          this.approvedRegistrations.unshift(registration);
          this.loading = false;
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
    if (!registration.id || this.loading || registration.status !== 'pending') return;

    const reason = prompt(`¿Por qué deseas rechazar el registro de ${registration.full_name}? (Opcional)`);

    this.loading = true;
    this.error = '';
    this.success = '';

    this.registrationService.rejectRegistration(registration.id, reason || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Registro rechazado exitosamente';
          // Actualizar el estado del registro localmente
          registration.status = 'rejected';
          registration.updated_at = new Date().toISOString();
          if (reason) {
            registration.rejection_reason = reason;
          }
          // Mover el registro de pendientes a rechazados
          this.pendingRegistrations = this.pendingRegistrations.filter(r => r.id !== registration.id);
          this.rejectedRegistrations.unshift(registration);
          this.loading = false;
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
