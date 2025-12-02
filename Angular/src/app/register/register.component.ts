import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationService } from '../services/registration.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  step = 1;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  error = '';

  formData = {
    full_name: '',
    user_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    fraccionamiento_id: '',
    street: '',
    house_number: ''
  };

  fraccionamientos = [
    { id: 1, name: 'La Querencia' },
    { id: 2, name: 'Las Palmas' },
    { id: 3, name: 'Puerta Luna' },
    { id: 4, name: 'Villas del Sol' }
  ];

  constructor(
    private router: Router,
    private registrationService: RegistrationService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  nextStep(): void {
    if (this.formData.password !== this.formData.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    this.error = '';
    this.step = 2;
  }

  previousStep(): void {
    this.step = 1;
    this.error = '';
  }

  goBack(): void {
    this.router.navigate(['/auth/sing-in']);
  }

  submitRegistration(): void {
    if (this.loading) return;
    if (!this.formData.street || !this.formData.house_number) {
      this.error = 'Por favor completa todos los campos de dirección';
      return;
    }
    if (!this.formData.fraccionamiento_id) {
      this.error = 'Por favor selecciona un fraccionamiento';
      return;
    }
    this.loading = true;
    this.error = '';
    const registrationData = {
      full_name: this.formData.full_name, user_name: this.formData.user_name,
      email: this.formData.email, password: this.formData.password, role: 'resident',
      fraccionamiento_id: this.formData.fraccionamiento_id, status: 'pending',
      phone: this.formData.phone || null, street: this.formData.street, house_number: this.formData.house_number
    };
    this.registrationService.createRegistration(registrationData).subscribe({
      next: (res) => {
        if (res.success || res.exito) {
          this.router.navigate(['/auth/sing-in'], { queryParams: { registered: 'true' } });
        } else {
          this.error = res.message || res.mensaje || 'Error al enviar la solicitud';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || err.error?.mensaje || err.error?.error || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }
}
