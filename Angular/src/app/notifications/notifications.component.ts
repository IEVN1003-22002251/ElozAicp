import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  filteredNotifications: any[] = [];
  loading = false;
  filter: 'all' | 'unread' | 'read' = 'all';
  unreadCount = 0;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.http.get<any>(`${environment.apiUrl}/notifications?user_id=${user.id}`)
      .subscribe({
        next: (response) => {
          this.notifications = response.data || response.notifications || [];
          this.updateUnreadCount();
          this.applyFilter();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.loading = false;
        }
      });
  }

  updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.is_read).length;
  }

  setFilter(filter: 'all' | 'unread' | 'read'): void {
    this.filter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.filter) {
      case 'unread':
        this.filteredNotifications = this.notifications.filter(n => !n.is_read);
        break;
      case 'read':
        this.filteredNotifications = this.notifications.filter(n => n.is_read);
        break;
      default:
        this.filteredNotifications = this.notifications;
    }
  }

  markAsRead(id: string): void {
    this.http.put<any>(`${environment.apiUrl}/notifications/${id}/read`, {})
      .subscribe({
        next: () => {
          const notification = this.notifications.find(n => n.id === id);
          if (notification) {
            notification.is_read = true;
            this.updateUnreadCount();
            this.applyFilter();
          }
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
  }

  markAllAsRead(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.http.put<any>(`${environment.apiUrl}/notifications/mark-all-read`, { user_id: user.id })
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.is_read = true);
          this.updateUnreadCount();
          this.applyFilter();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error marking all as read:', error);
          this.loading = false;
        }
      });
  }

  deleteNotification(id: string): void {
    if (!confirm('¿Estás seguro de eliminar esta notificación?')) return;

    this.http.delete<any>(`${environment.apiUrl}/notifications/${id}`)
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== id);
          this.updateUnreadCount();
          this.applyFilter();
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        }
      });
  }

  getIconClass(type: string): string {
    const iconMap: any = {
      'info': 'info',
      'success': 'success',
      'warning': 'warning',
      'error': 'error'
    };
    return iconMap[type] || 'info';
  }

  getIconPath(type: string): string {
    const pathMap: any = {
      'info': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
      'success': 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
      'warning': 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
      'error': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'
    };
    return pathMap[type] || pathMap['info'];
  }

  formatTime(date: string): string {
    if (!date) return 'N/A';
    const now = new Date();
    const notificationDate = new Date(date);
    const diff = now.getTime() - notificationDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;
    return notificationDate.toLocaleDateString('es-ES');
  }

<<<<<<< HEAD
  deleteAllNotifications(): void {
    if (!confirm('¿Estás seguro de eliminar todas las notificaciones?')) return;

    this.loading = true;
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.loading = false;
      return;
    }

    // Eliminar todas las notificaciones una por una
    const deletePromises = this.filteredNotifications.map(notification =>
      this.http.delete<any>(`${environment.apiUrl}/notifications/${notification.id}`).toPromise()
    );

    Promise.all(deletePromises)
      .then(() => {
        this.notifications = [];
        this.filteredNotifications = [];
        this.updateUnreadCount();
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error deleting all notifications:', error);
        this.loading = false;
      });
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
=======
  goBack(): void {
    this.router.navigate(['/dashboard']);
>>>>>>> origin/Alan
  }
}
