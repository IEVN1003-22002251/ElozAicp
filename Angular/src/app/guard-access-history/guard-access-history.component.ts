import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VisitorService } from '../services/visitor.service';

@Component({
  selector: 'app-guard-access-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guard-access-history.component.html',
  styleUrls: ['./guard-access-history.component.css']
})
export class GuardAccessHistoryComponent implements OnInit, OnDestroy {
  selectedFilter: 'all' | 'residents' | 'visitors' | 'providers' = 'all';
  allAccesses: any[] = [];
  filteredAccesses: any[] = [];
  loading = false;
  totalAccesses = 0;
  dentroCount = 0;
  salioCount = 0;
  private refreshInterval: any;
  private readonly REFRESH_INTERVAL_MS = 5000; // 5 segundos

  constructor(
    private router: Router,
    private authService: AuthService,
    private visitorService: VisitorService
  ) {}

  ngOnInit(): void {
    // Verificar que el usuario es guardia
    const profile = this.authService.getCachedProfile();
    if (profile?.role !== 'guard' && profile?.role !== 'admin') {
      this.router.navigate(['/guard-dashboard']);
    }
    
    this.loadAccesses();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.loadAccesses();
    }, this.REFRESH_INTERVAL_MS);
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  loadAccesses(): void {
    this.loading = true;
    
    // Cargar todos los visitantes (incluye visitantes, proveedores, eventos)
    this.visitorService.getVisitors().subscribe({
      next: (response) => {
        const visitors = response.visitors || [];
        
        // Mapear visitantes a formato de acceso
        this.allAccesses = visitors.map((visitor: any) => ({
          id: visitor.id,
          name: visitor.name,
          visitor_name: visitor.name,
          type: visitor.type === 'provider' ? 'provider' : (visitor.type === 'event' ? 'visitor' : 'visitor'),
          status: visitor.status || 'active',
          resident_name: visitor.resident_name || '',
          resident_address: visitor.resident_address || '',
          created_at: visitor.created_at,
          timestamp: visitor.created_at
        }));
        
        this.updateStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading accesses:', error);
        this.loading = false;
      }
    });
  }

  updateStats(): void {
    this.totalAccesses = this.allAccesses.length;
    this.dentroCount = this.allAccesses.filter(a => a.status === 'dentro').length;
    this.salioCount = this.allAccesses.filter(a => a.status === 'salio' || a.status === 'salió').length;
  }

  setFilter(filter: 'all' | 'residents' | 'visitors' | 'providers'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedFilter === 'all') {
      this.filteredAccesses = [...this.allAccesses];
    } else if (this.selectedFilter === 'residents') {
      // Los residentes se obtendrían de otra fuente, por ahora mostrar vacío
      this.filteredAccesses = [];
    } else if (this.selectedFilter === 'visitors') {
      this.filteredAccesses = this.allAccesses.filter(a => a.type === 'visitor' || a.type === 'one-time');
    } else if (this.selectedFilter === 'providers') {
      this.filteredAccesses = this.allAccesses.filter(a => a.type === 'provider');
    }
    
    // Ordenar por fecha más reciente
    this.filteredAccesses.sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp || 0).getTime();
      const dateB = new Date(b.created_at || b.timestamp || 0).getTime();
      return dateB - dateA;
    });
  }

  getTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'resident': 'Residente',
      'visitor': 'Visitante',
      'one-time': 'Visitante (Una vez)',
      'provider': 'Proveedor',
      'event': 'Evento'
    };
    return typeMap[type] || type;
  }

  getStatusLabel(status: string): string {
    if (!status) return 'N/A';
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'activo': 'Activo',
      'dentro': 'Dentro',
      'salio': 'Salió',
      'salió': 'Salió'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  goBack(): void {
    this.router.navigate(['/guard-dashboard']);
  }
}

