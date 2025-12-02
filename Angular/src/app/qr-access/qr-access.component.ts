import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-qr-access',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-access.component.html',
  styleUrls: ['./qr-access.component.css']
})
export class QrAccessComponent implements OnInit {
  profile: any = null;
  qrCodeUrl: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profile = this.authService.getCachedProfile();
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.authService.getProfile(currentUser.id).subscribe({
        next: (res) => {
          if (res.exito && res.profile) {
            this.profile = res.profile;
            localStorage.setItem('profile', JSON.stringify(res.profile));
          }
          this.generateQRCode();
        },
        error: () => this.generateQRCode()
      });
    } else {
      this.generateQRCode();
    }
  }

  generateQRCode(): void {
    const userId = this.profile?.id || this.authService.getCurrentUser()?.id;
    if (!userId) {
      this.qrCodeUrl = '';
      return;
    }
    const qrDataString = JSON.stringify({ t: 'resident', id: userId });
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrDataString)}`;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  getResidentAddress(): string {
    if (!this.profile) return '';
    if (this.profile.address) return this.profile.address;
    const addressParts: string[] = [];
    if (this.profile.street) addressParts.push(this.profile.street);
    if (this.profile.house_number) addressParts.push(`Casa ${this.profile.house_number}`);
    return addressParts.length > 0 ? addressParts.join(', ') : '';
  }
}
