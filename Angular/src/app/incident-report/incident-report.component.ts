import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IncidentService } from '../services/incident.service';
import { AuthService } from '../services/auth.service';

declare var Chart: any;

@Component({
  selector: 'app-incident-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incident-report.component.html',
  styleUrls: ['./incident-report.component.css']
})
export class IncidentReportComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  chart: any = null;
  loading = false;
  error = '';
  incidentsByType: { incident_type: string; count: number }[] = [];
  totalIncidents = 0;

  constructor(
    private router: Router,
    private incidentService: IncidentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadIncidentsByType();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.ensureChartReady(), 200);
  }

  ensureChartReady(): void {
    if (typeof Chart !== 'undefined' && this.chartCanvas && this.incidentsByType.length > 0 && !this.chart) {
      this.createChart();
    } else if (typeof Chart === 'undefined') {
      setTimeout(() => this.ensureChartReady(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadIncidentsByType(): void {
    this.loading = true;
    this.error = '';
    this.incidentService.getIncidentsByType().subscribe({
      next: (res) => {
        if (res.success) {
          this.incidentsByType = res.data || [];
          this.totalIncidents = this.incidentsByType.reduce((sum, item) => sum + item.count, 0);
          setTimeout(() => this.updateChart(), 300);
        } else {
          this.error = 'Error al cargar los datos de incidentes';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || err.error?.message || 'Error al conectar con el servidor';
        this.loading = false;
        console.error('Error loading incidents:', err);
      }
    });
  }

  createChart(): void {
    if (!this.chartCanvas || typeof Chart === 'undefined' || this.incidentsByType.length === 0) return;
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    const labels = this.incidentsByType.map(item => this.formatIncidentType(item.incident_type));
    const data = this.incidentsByType.map(item => item.count);
    const backgroundColors = this.generateColors(this.incidentsByType.length);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cantidad de Incidentes',
          data: data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((color: string) => color.replace('0.8', '1')),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Incidentes por Tipo',
            color: '#ffffff',
            font: {
              size: 20,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)', titleColor: '#ffffff', bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, padding: 12, displayColors: true,
            callbacks: {
              label: (ctx: any) => {
                const val = ctx.parsed.y || 0;
                const pct = this.totalIncidents > 0 ? ((val / this.totalIncidents) * 100).toFixed(1) : '0';
                return `${ctx.dataset.label || ''}: ${val} (${pct}%)`;
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#ffffff', font: { size: 12 }, stepSize: 1 },
            grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false } },
          x: { ticks: { color: '#ffffff', font: { size: 12 } }, grid: { display: false, drawBorder: false } }
        }
      }
    });
  }

  updateChart(): void {
    if (this.incidentsByType.length === 0) return;
    if (!this.chart) {
      if (typeof Chart === 'undefined' || !this.chartCanvas) {
        setTimeout(() => this.updateChart(), 100);
        return;
      }
      this.createChart();
      return;
    }
    const labels = this.incidentsByType.map(item => this.formatIncidentType(item.incident_type));
    const data = this.incidentsByType.map(item => item.count);
    const colors = this.generateColors(this.incidentsByType.length);
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].backgroundColor = colors;
    this.chart.data.datasets[0].borderColor = colors.map((c: string) => c.replace('0.8', '1'));
    this.chart.update();
  }

  generateColors(count: number): string[] {
    const colors = ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
      'rgba(199, 199, 199, 0.8)', 'rgba(83, 102, 255, 0.8)', 'rgba(255, 99, 255, 0.8)', 'rgba(99, 255, 132, 0.8)'];
    if (count > colors.length) {
      const additional = [];
      for (let i = colors.length; i < count; i++) {
        additional.push(`hsla(${(i * 137.508) % 360}, 70%, 60%, 0.8)`);
      }
      return [...colors, ...additional];
    }
    return colors.slice(0, count);
  }

  formatIncidentType(type: string): string {
    const typeMap: { [key: string]: string } = {
      robo: 'Robo', vandalismo: 'Vandalismo', accidente_vehicular: 'Accidente Vehicular',
      accidente_personal: 'Accidente Personal', intrusion: 'Intrusión', ruido_excesivo: 'Ruido Excesivo',
      agua_fuga: 'Fuga de Agua', electricidad_falla: 'Falla Eléctrica', seguridad_brecha: 'Brecha de Seguridad', otro: 'Otro'
    };
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  goBack(): void {
    const role = this.authService.getCachedProfile()?.role?.toLowerCase();
    this.router.navigate([role === 'guard' ? '/guard-dashboard' : '/dashboard']);
  }
}
