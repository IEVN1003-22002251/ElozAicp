import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, Chart, registerables, TooltipItem } from 'chart.js';
import { AuthService } from '../services/auth.service';
import { VisitorService } from '../services/visitor.service';

Chart.register(...registerables);

@Component({
  selector: 'app-access-report',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './access-report.component.html',
  styleUrls: ['./access-report.component.css']
})
export class AccessReportComponent implements OnInit {
  loading = true;
  isAdmin = false;
  totalAccesses = 0;
  accessStats: any[] = [];
  allVisitors: any[] = [];
  selectedPeriod: 'all' | 'day' | 'month' | 'year' = 'all';
  selectedType: 'all' | 'visitors' | 'providers' | 'events' = 'all';

  public pieChartType: 'pie' = 'pie';
  public barChartType: 'bar' = 'bar';
  public pieChartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 2, borderColor: '#1a1a1a' }] };
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [{ label: 'Cantidad', data: [], backgroundColor: [], borderWidth: 2 }] };
  public pieChartOptions: ChartConfiguration<'pie'>['options'];
  public barChartOptions: ChartConfiguration<'bar'>['options'];

  private readonly typeColors: { [key: string]: string } = {
    visitors: '#20b2aa', providers: '#ff9800', events: '#d4a574', residents: '#007bff'
  };
  
  private readonly typeIcons: { [key: string]: string } = {
    visitors: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    providers: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    events: 'M3 4h18M3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4M3 4l0 0M8 2v4M16 2v4'
  };

  private readonly recordTypeMap: { [key: string]: string } = {
    visitor: 'visitors', 'one-time': 'visitors', provider: 'providers', event: 'events'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private visitorService: VisitorService,
    private cdr: ChangeDetectorRef
  ) {
    this.initChartOptions();
  }

  ngOnInit(): void {
    const profile = this.authService.getCachedProfile();
    const role = profile?.role?.toLowerCase();
    this.isAdmin = role === 'admin' || role === 'guard';
    if (!this.isAdmin) {
      this.router.navigate([role === 'resident' ? '/home' : '/dashboard']);
      return;
    }
    this.loadAccessData();
  }

  loadAccessData(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser && !this.authService.getCachedProfile()) {
      this.resetData();
      return;
    }
    const params: any = this.isAdmin ? {} : { user_id: currentUser?.id };
    this.visitorService.getVisitors(params).subscribe({
      next: (res) => {
        this.allVisitors = res.visitors || res.data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.resetData();
      }
    });
  }

  setPeriod(period: 'all' | 'day' | 'month' | 'year'): void {
    this.selectedPeriod = period;
    this.applyFilters();
  }

  setType(type: 'all' | 'visitors' | 'providers' | 'events'): void {
    this.selectedType = type;
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.allVisitors.length) {
      this.resetData();
      return;
    }
    const now = new Date();
    const filtered = this.allVisitors.filter(v => {
      if (!v.created_at) return false;
      if (!this.isDateInPeriod(new Date(v.created_at), now, this.selectedPeriod)) return false;
      if (this.selectedType !== 'all') {
        const mappedType = this.recordTypeMap[v.type] || 'visitors';
        return mappedType === this.selectedType;
      }
      return true;
    });
    this.processAccessData(filtered);
  }

  private isDateInPeriod(date: Date, now: Date, period: string): boolean {
    if (period === 'all') return true;
    const isSameYear = date.getFullYear() === now.getFullYear();
    if (period === 'year') return isSameYear;
    const isSameMonth = isSameYear && date.getMonth() === now.getMonth();
    if (period === 'month') return isSameMonth;
    return isSameMonth && date.getDate() === now.getDate();
  }

  processAccessData(visitors: any[]): void {
    if (!visitors.length) {
      this.resetData();
      return;
    }
    const counts = visitors.reduce((acc, v) => {
      const type = this.recordTypeMap[v.type] || 'visitors';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    this.accessStats = [];
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    Object.entries(counts).forEach(([type, count]) => {
      const label = this.getTypeLabel(type);
      const color = this.typeColors[type] || '#6c757d';
      this.accessStats.push({ label, count, color, iconPath: this.typeIcons[type] || this.typeIcons['visitors'] });
      labels.push(label);
      data.push(count as number);
      colors.push(color);
    });

    this.totalAccesses = visitors.length;
    this.updateCharts(labels, data, colors);
  }

  updateCharts(labels: string[], data: number[], colors: string[]): void {
    if (!labels.length) {
      this.resetData();
      return;
    }
    this.pieChartData = {
      labels: [...labels],
      datasets: [{ data: [...data], backgroundColor: [...colors], borderColor: '#1a1a1a', borderWidth: 2 }]
    };
    this.barChartData = {
      labels: [...labels],
      datasets: [{ label: 'Cantidad', data: [...data], backgroundColor: [...colors], borderColor: [...colors], borderWidth: 2 }]
    };
    this.cdr.detectChanges();
  }

  private resetData(): void {
    this.loading = false;
    this.accessStats = [];
    this.totalAccesses = 0;
    this.pieChartData.labels = [];
    this.pieChartData.datasets[0].data = [];
    this.barChartData.labels = [];
    this.barChartData.datasets[0].data = [];
    this.cdr.detectChanges();
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      visitors: 'Visitantes', providers: 'Proveedores', events: 'Eventos', residents: 'Residentes'
    };
    return labels[type] || type;
  }

  goBack(): void {
    const role = this.authService.getCachedProfile()?.role?.toLowerCase();
    this.router.navigate([role === 'guard' ? '/guard-dashboard' : '/dashboard']);
  }

  private initChartOptions() {
    const commonTooltip = {
      backgroundColor: '#2a2a2a', titleColor: '#ffffff', bodyColor: '#ffffff',
      borderColor: '#007bff', borderWidth: 1, padding: 12, displayColors: true
    };

    this.pieChartOptions = {
      responsive: true, maintainAspectRatio: false, aspectRatio: 1.5,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ffffff', font: { size: 12, weight: 500 }, padding: 15, usePointStyle: true, pointStyle: 'circle' } },
        tooltip: {
          ...commonTooltip,
          callbacks: {
            label: (ctx: TooltipItem<'pie'>) => {
              const val = ctx.parsed || 0;
              const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
              return `${ctx.label || ''}: ${val} (${total > 0 ? ((val / total) * 100).toFixed(1) : 0}%)`;
            }
          }
        }
      }
    };

    this.barChartOptions = {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { ...commonTooltip } },
      scales: {
        x: { beginAtZero: true, ticks: { color: '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        y: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
      }
    };
  }
}
