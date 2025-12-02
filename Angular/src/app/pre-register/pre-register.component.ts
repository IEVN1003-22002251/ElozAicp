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
    this.router.navigate(['/visitors/add'], { queryParams: { type } });
  }

  goBack(): void {
    const isAdmin = this.authService.getCachedProfile()?.role === 'admin';
    this.router.navigate([isAdmin ? '/dashboard' : '/home']);
  }
}
