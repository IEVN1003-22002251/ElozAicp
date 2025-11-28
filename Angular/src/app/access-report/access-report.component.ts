import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccessReportService } from '../services/access-report.service';

@Component({
  selector: 'app-access-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="access-report-container">
      <!-- Header -->
      <div class="report-header">
        <button class="btn-back" (click)="goBack()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Regresar al Dashboard
        </button>
        <h1 class="report-title">Reporte de Accesos</h1>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <p>Cargando estadísticas...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-state">
        <p>{{ error }}</p>
      </div>

      <!-- Content -->
      <div *ngIf="!loading && !error" class="report-content">
        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-icon total">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="card-content">
              <p class="card-label">Total de Accesos</p>
              <p class="card-value">{{ stats.total }}</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon visitor">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="card-content">
              <p class="card-label">Visitantes</p>
              <p class="card-value">{{ stats.byAccessType['visitor'] || 0 }}</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon resident">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <p class="card-label">Residentes</p>
              <p class="card-value">{{ stats.byAccessType['resident'] || 0 }}</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon provider">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div class="card-content">
              <p class="card-label">Proveedores</p>
              <p class="card-value">{{ stats.byAccessType['provider'] || 0 }}</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon active">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <p class="card-label">Activos</p>
              <p class="card-value">{{ stats.byStatus['active'] || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
          <!-- Chart 1: Accesos por Tipo de Acceso (Visitante, Residente, Proveedor) -->
          <div class="chart-card">
            <h3 class="chart-title">Accesos por Tipo (Visitantes, Residentes, Proveedores)</h3>
            <div class="chart-container">
              <canvas #accessTypeChart width="400" height="300"></canvas>
            </div>
          </div>

          <!-- Chart 2: Accesos por Tipo de Visitante -->
          <div class="chart-card">
            <h3 class="chart-title">Tipos de Visitantes</h3>
            <div class="chart-container">
              <canvas #typeChart width="400" height="300"></canvas>
            </div>
          </div>

          <!-- Chart 3: Accesos por Estado -->
          <div class="chart-card">
            <h3 class="chart-title">Accesos por Estado</h3>
            <div class="chart-container">
              <canvas #statusChart width="400" height="300"></canvas>
            </div>
          </div>

          <!-- Chart 4: Accesos por Día -->
          <div class="chart-card chart-full">
            <h3 class="chart-title">Accesos por Día (Últimos 7 días)</h3>
            <div class="chart-container">
              <canvas #dateChart width="800" height="300"></canvas>
            </div>
          </div>

          <!-- Chart 5: Accesos por Hora -->
          <div class="chart-card chart-full">
            <h3 class="chart-title">Distribución de Accesos por Hora del Día</h3>
            <div class="chart-container">
              <canvas #hourChart width="800" height="300"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .access-report-container {
      min-height: 100vh;
      background-color: #1a1a1a;
      padding: 20px;
      padding-bottom: 40px;
    }

    .report-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 32px;
    }

    .btn-back {
      padding: 8px 16px;
      background-color: transparent;
      color: #ffffff;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-back:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .btn-back svg {
      width: 16px;
      height: 16px;
    }

    .report-title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 60px 20px;
      color: rgba(255, 255, 255, 0.7);
    }

    .error-state {
      color: #dc3545;
    }

    .report-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .summary-card {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-icon.total {
      background-color: rgba(0, 123, 255, 0.2);
      color: #007bff;
    }

    .card-icon.visitor {
      background-color: rgba(0, 123, 255, 0.2);
      color: #007bff;
    }

    .card-icon.resident {
      background-color: rgba(40, 167, 69, 0.2);
      color: #28a745;
    }

    .card-icon.provider {
      background-color: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }

    .card-icon.active {
      background-color: rgba(40, 167, 69, 0.2);
      color: #28a745;
    }

    .card-icon.inactive {
      background-color: rgba(220, 53, 69, 0.2);
      color: #dc3545;
    }

    .card-content {
      flex: 1;
    }

    .card-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 8px 0;
    }

    .card-value {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .chart-card {
      background-color: #2a2a2a;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .chart-card.chart-full {
      grid-column: 1 / -1;
    }

    .chart-title {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 20px 0;
    }

    .chart-container {
      width: 100%;
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .chart-container canvas {
      max-width: 100%;
      height: auto;
    }

    @media (max-width: 768px) {
      .access-report-container {
        padding: 16px;
      }

      .report-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .summary-cards {
        grid-template-columns: 1fr;
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .chart-card.chart-full {
        grid-column: 1;
      }
    }
  `]
})
export class AccessReportComponent implements OnInit, AfterViewInit {
  @ViewChild('accessTypeChart', { static: false }) accessTypeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('typeChart', { static: false }) typeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart', { static: false }) statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dateChart', { static: false }) dateChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hourChart', { static: false }) hourChartRef!: ElementRef<HTMLCanvasElement>;

  stats: any = {
    total: 0,
    byType: {},
    byAccessType: {},
    byStatus: {},
    byDate: {},
    byHour: {}
  };
  loading = true;
  error = '';

  constructor(
    private accessReportService: AccessReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    // Los gráficos se dibujarán después de que los datos se carguen
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';

    this.accessReportService.getAccessStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
        setTimeout(() => {
          this.drawCharts();
        }, 100);
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al cargar estadísticas';
        this.loading = false;
      }
    });
  }

  drawCharts(): void {
    this.drawAccessTypeChart();
    this.drawTypeChart();
    this.drawStatusChart();
    this.drawDateChart();
    this.drawHourChart();
  }

  drawAccessTypeChart(): void {
    const canvas = this.accessTypeChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.stats.byAccessType;
    const labels = Object.keys(data);
    const values = Object.values(data) as number[];

    if (labels.length === 0) {
      this.drawEmptyChart(ctx, canvas);
      return;
    }

    const total = values.reduce((a, b) => a + b, 0);
    const colors: { [key: string]: string } = {
      'visitor': '#007bff',
      'resident': '#28a745',
      'provider': '#ffc107'
    };
    
    let currentAngle = -Math.PI / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar gráfica de pastel
    labels.forEach((label, index) => {
      const sliceAngle = (values[index] / total) * 2 * Math.PI;
      const color = colors[label] || '#6c757d';
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Etiqueta
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      const labelText = label === 'visitor' ? 'Visitante' : label === 'resident' ? 'Residente' : 'Proveedor';
      ctx.fillText(`${labelText}: ${values[index]}`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Leyenda
    let legendY = 30;
    labels.forEach((label, index) => {
      const color = colors[label] || '#6c757d';
      const labelText = label === 'visitor' ? 'Visitante' : label === 'resident' ? 'Residente' : 'Proveedor';
      ctx.fillStyle = color;
      ctx.fillRect(20, legendY, 15, 15);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${labelText} (${values[index]})`, 40, legendY + 12);
      legendY += 25;
    });
  }

  drawTypeChart(): void {
    const canvas = this.typeChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Filtrar solo tipos de visitantes (excluir resident y provider que ya están en accessTypeChart)
    const data = this.stats.byType;
    const filteredData: any = {};
    Object.keys(data).forEach(key => {
      if (key !== 'resident' && key !== 'provider') {
        filteredData[key] = data[key];
      }
    });

    const labels = Object.keys(filteredData);
    const values = Object.values(filteredData) as number[];

    if (labels.length === 0) {
      this.drawEmptyChart(ctx, canvas);
      return;
    }

    const total = values.reduce((a, b) => a + b, 0);
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'];
    
    let currentAngle = -Math.PI / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar gráfica de pastel
    labels.forEach((label, index) => {
      const sliceAngle = (values[index] / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Etiqueta
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${label}: ${values[index]}`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Leyenda
    let legendY = 30;
    labels.forEach((label, index) => {
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(20, legendY, 15, 15);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${label} (${values[index]})`, 40, legendY + 12);
      legendY += 25;
    });
  }

  drawStatusChart(): void {
    const canvas = this.statusChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.stats.byStatus;
    const labels = Object.keys(data);
    const values = Object.values(data) as number[];

    if (labels.length === 0) {
      this.drawEmptyChart(ctx, canvas);
      return;
    }

    const maxValue = Math.max(...values, 1);
    const barWidth = (canvas.width - 100) / labels.length;
    const barMaxHeight = canvas.height - 80;
    const colors = ['#28a745', '#dc3545', '#ffc107', '#17a2b8'];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar barras
    labels.forEach((label, index) => {
      const barHeight = (values[index] / maxValue) * barMaxHeight;
      const x = 50 + index * barWidth;
      const y = canvas.height - 30 - barHeight;

      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, y, barWidth - 10, barHeight);

      // Valor
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(values[index].toString(), x + (barWidth - 10) / 2, y - 5);

      // Etiqueta
      ctx.fillText(label, x + (barWidth - 10) / 2, canvas.height - 10);
    });
  }

  drawDateChart(): void {
    const canvas = this.dateChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.stats.byDate;
    const dates = Object.keys(data).sort();
    const last7Days = dates.slice(-7);
    const values = last7Days.map(date => data[date] || 0);

    if (last7Days.length === 0) {
      this.drawEmptyChart(ctx, canvas);
      return;
    }

    const maxValue = Math.max(...values, 1);
    const chartWidth = canvas.width - 100;
    const chartHeight = canvas.height - 80;
    const stepX = chartWidth / (last7Days.length - 1 || 1);
    const colors = ['#007bff', '#28a745'];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar línea
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 3;
    ctx.beginPath();

    last7Days.forEach((date, index) => {
      const x = 50 + index * stepX;
      const y = canvas.height - 30 - (values[index] / maxValue) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Punto
      ctx.fillStyle = colors[0];
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Valor
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(values[index].toString(), x, y - 10);

      // Fecha
      const dateLabel = new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      ctx.fillText(dateLabel, x, canvas.height - 10);
    });

    ctx.stroke();
  }

  drawHourChart(): void {
    const canvas = this.hourChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.stats.byHour;
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const values = hours.map(hour => data[hour] || 0);

    const maxValue = Math.max(...values, 1);
    const barWidth = (canvas.width - 100) / 24;
    const barMaxHeight = canvas.height - 80;
    const color = '#007bff';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar barras
    hours.forEach((hour, index) => {
      const barHeight = (values[index] / maxValue) * barMaxHeight;
      const x = 50 + index * barWidth;
      const y = canvas.height - 30 - barHeight;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth - 2, barHeight);

      // Etiqueta de hora cada 3 horas
      if (hour % 3 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(hour.toString(), x + barWidth / 2, canvas.height - 10);
      }
    });
  }

  drawEmptyChart(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No hay datos disponibles', canvas.width / 2, canvas.height / 2);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
