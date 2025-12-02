import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-guard-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guard-dashboard.component.html',
  styleUrls: ['./guard-dashboard.component.css']
})
export class GuardDashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  profile: any = null;
  emergencyAlerts: any[] = [];
  currentEmergencyAlert: any = null;
  private alertsInterval: any = null;
  private audioContext: AudioContext | null = null;
  private emergencySound: HTMLAudioElement | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.profile = this.authService.getCachedProfile();
    
    // Verificar que el usuario es guardia
    if (!this.user || (this.profile?.role !== 'guard' && this.profile?.role !== 'admin')) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }

    // Cargar alertas de emergencia
    this.loadEmergencyAlerts();
    
    // Recargar alertas cada 10 segundos
    this.alertsInterval = setInterval(() => {
      this.loadEmergencyAlerts();
    }, 10000);
  }

  loadEmergencyAlerts(): void {
    if (!this.user?.id) return;

    this.http.get<any>(`${environment.apiUrl}/notifications?user_id=${this.user.id}`)
      .subscribe({
        next: (response) => {
          const notifications = response.data || response.notifications || [];
          // Filtrar solo alertas de emergencia (no leídas y que contengan "ALERTA DE EMERGENCIA")
          const newAlerts = notifications.filter((n: any) => 
            !n.is_read && !n.read && n.title && n.title.includes('ALERTA DE EMERGENCIA')
          );
          
          // Si hay una nueva alerta y no hay una alerta actual mostrándose, mostrar la primera
          if (newAlerts.length > 0 && !this.currentEmergencyAlert) {
            this.currentEmergencyAlert = newAlerts[0];
            this.playEmergencySound();
          }
          
          this.emergencyAlerts = newAlerts;
        },
        error: (error) => {
          console.error('Error al cargar alertas de emergencia:', error);
        }
      });
  }

  playEmergencySound(): void {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const playBeep = () => {
        const osc = this.audioContext!.createOscillator();
        const gain = this.audioContext!.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext!.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.audioContext!.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.audioContext!.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioContext!.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.2);
        osc.start(this.audioContext!.currentTime);
        osc.stop(this.audioContext!.currentTime + 0.2);
      };
      playBeep();
      setTimeout(() => playBeep(), 300);
      setTimeout(() => playBeep(), 600);
    } catch (error) {
      console.error('Error al reproducir sonido de emergencia:', error);
    }
  }

  markAlertAsAttended(): void {
    if (!this.currentEmergencyAlert) return;
    
    const alertId = this.currentEmergencyAlert.id;
    this.http.put<any>(`${environment.apiUrl}/notifications/${alertId}/read`, {})
      .subscribe({
        next: () => {
          // Remover la alerta actual y de la lista
          this.currentEmergencyAlert = null;
          this.emergencyAlerts = this.emergencyAlerts.filter(a => a.id !== alertId);
          
          // Si hay más alertas pendientes, mostrar la siguiente
          if (this.emergencyAlerts.length > 0) {
            this.currentEmergencyAlert = this.emergencyAlerts[0];
            this.playEmergencySound();
          }
        },
        error: (error) => {
          console.error('Error al marcar alerta como atendida:', error);
        }
      });
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diffMins = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (diffMins < 1) return 'Hace menos de 1 minuto';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy(): void {
    if (this.alertsInterval) {
      clearInterval(this.alertsInterval);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/sing-in']);
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}

