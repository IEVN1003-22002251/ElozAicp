import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IncidentService } from '../services/incident.service';

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
    private incidentService: IncidentService
  ) {}

  ngOnInit(): void {
    this.loadIncidentsByType();
  }

  ngAfterViewInit(): void {
    // Esperar a que el canvas esté disponible y Chart.js esté cargado
    setTimeout(() => {
      this.ensureChartReady();
    }, 200);
  }

  ensureChartReady(): void {
    // Verificar que Chart.js esté disponible, el canvas exista y haya datos
    if (typeof Chart !== 'undefined' && this.chartCanvas && this.incidentsByType.length > 0) {
      if (!this.chart) {
        this.createChart();
      }
    } else if (typeof Chart === 'undefined') {
      // Si Chart.js aún no está disponible, intentar de nuevo
      setTimeout(() => {
        this.ensureChartReady();
      }, 100);
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
      next: (response) => {
        console.log('Response from API:', response);
        if (response.success) {
          this.incidentsByType = response.data || [];
          this.totalIncidents = this.incidentsByType.reduce((sum, item) => sum + item.count, 0);
          console.log('Incidents by type:', this.incidentsByType);
          console.log('Total incidents:', this.totalIncidents);
          
          // Esperar un momento para asegurar que el canvas esté disponible
          setTimeout(() => {
            this.updateChart();
          }, 300);
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
    if (!this.chartCanvas || typeof Chart === 'undefined' || this.incidentsByType.length === 0) {
      console.log('Chart creation skipped:', {
        hasCanvas: !!this.chartCanvas,
        hasChart: typeof Chart !== 'undefined',
        hasData: this.incidentsByType.length > 0,
        chartCanvasElement: this.chartCanvas?.nativeElement
      });
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2d context from canvas');
      return;
    }

    // Destruir gráfica anterior si existe
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const labels = this.incidentsByType.map(item => this.formatIncidentType(item.incident_type));
    const data = this.incidentsByType.map(item => item.count);
    const backgroundColors = this.generateColors(this.incidentsByType.length);

    console.log('Creating chart with data:', { labels, data, colors: backgroundColors });

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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y || 0;
                const percentage = this.totalIncidents > 0 
                  ? ((value / this.totalIncidents) * 100).toFixed(1) 
                  : '0';
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#ffffff',
              font: {
                size: 12
              },
              stepSize: 1
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            }
          },
          x: {
            ticks: {
              color: '#ffffff',
              font: {
                size: 12
              }
            },
            grid: {
              display: false,
              drawBorder: false
            }
          }
        }
      }
    });

    console.log('Chart created successfully');
  }

  updateChart(): void {
    // Si no hay datos, no hacer nada
    if (this.incidentsByType.length === 0) {
      return;
    }

    // Si el chart no existe, crearlo
    if (!this.chart) {
      // Verificar que Chart.js y el canvas estén disponibles
      if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está disponible');
        setTimeout(() => this.updateChart(), 100);
        return;
      }
      
      if (!this.chartCanvas) {
        console.warn('Canvas no está disponible');
        setTimeout(() => this.updateChart(), 100);
        return;
      }

      this.createChart();
      return;
    }

    // Actualizar datos existentes
    const labels = this.incidentsByType.map(item => this.formatIncidentType(item.incident_type));
    const data = this.incidentsByType.map(item => item.count);
    const backgroundColors = this.generateColors(this.incidentsByType.length);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].backgroundColor = backgroundColors;
    this.chart.data.datasets[0].borderColor = backgroundColors.map((color: string) => color.replace('0.8', '1'));
    this.chart.update();
  }

  generateColors(count: number): string[] {
    const colors = [
      'rgba(255, 99, 132, 0.8)',   // Rojo
      'rgba(54, 162, 235, 0.8)',   // Azul
      'rgba(255, 206, 86, 0.8)',   // Amarillo
      'rgba(75, 192, 192, 0.8)',   // Verde azulado
      'rgba(153, 102, 255, 0.8)',  // Morado
      'rgba(255, 159, 64, 0.8)',   // Naranja
      'rgba(199, 199, 199, 0.8)',  // Gris
      'rgba(83, 102, 255, 0.8)',   // Azul índigo
      'rgba(255, 99, 255, 0.8)',   // Rosa
      'rgba(99, 255, 132, 0.8)'    // Verde claro
    ];

    // Si necesitamos más colores, los generamos
    if (count > colors.length) {
      const additionalColors = [];
      for (let i = colors.length; i < count; i++) {
        const hue = (i * 137.508) % 360; // Golden angle approximation
        additionalColors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
      }
      return [...colors, ...additionalColors];
    }

    return colors.slice(0, count);
  }

  formatIncidentType(type: string): string {
    // Formatear el tipo de incidente para mostrarlo de manera más legible
    const typeMap: { [key: string]: string } = {
      'robo': 'Robo',
      'vandalismo': 'Vandalismo',
      'accidente_vehicular': 'Accidente Vehicular',
      'accidente_personal': 'Accidente Personal',
      'intrusion': 'Intrusión',
      'ruido_excesivo': 'Ruido Excesivo',
      'agua_fuga': 'Fuga de Agua',
      'electricidad_falla': 'Falla Eléctrica',
      'seguridad_brecha': 'Brecha de Seguridad',
      'otro': 'Otro'
    };

    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
