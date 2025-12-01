import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HistoryService } from '../services/history.service';
import { VisitorService } from '../services/visitor.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, TooltipItem } from 'chart.js';
import { Chart, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-access-report',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './access-report.component.html',
  styleUrls: ['./access-report.component.css']
})
export class AccessReportComponent implements OnInit {
  loading: boolean = true; // Iniciar en true para mostrar el estado de carga
  isAdmin: boolean = false;
  totalAccesses: number = 0;
  accessStats: any[] = [];
  allVisitors: any[] = []; // Almacenar todos los visitantes para filtrar
  selectedPeriod: 'all' | 'day' | 'month' | 'year' = 'all';
  selectedType: 'all' | 'visitors' | 'providers' | 'events' = 'all';

  // Pie Chart configuration
  public pieChartType: 'pie' = 'pie';
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: '#1a1a1a',
      borderWidth: 2
    }]
  };

  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#2a2a2a',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#007bff',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Bar Chart configuration
  public barChartType: 'bar' = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Cantidad',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 2
    }]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Barras horizontales
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#2a2a2a',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#007bff',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const label = context.label || '';
            const value = (context.parsed as any).x || 0;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: '#ffffff',
          font: {
            size: 12
          },
          stepSize: 1
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#ffffff',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  // Colores para cada tipo de acceso
  private accessTypeColors: { [key: string]: string } = {
    'visitors': '#20b2aa',
    'visitantes': '#20b2aa',
    'visitor': '#20b2aa',
    'one-time': '#20b2aa',
    'providers': '#ff9800',
    'proveedores': '#ff9800',
    'provider': '#ff9800',
    'events': '#d4a574',
    'eventos': '#d4a574',
    'event': '#d4a574',
    'residentes': '#007bff',
    'residents': '#007bff',
    'resident': '#007bff'
  };

  // Iconos SVG para cada tipo
  private accessTypeIcons: { [key: string]: string } = {
    'visitors': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'visitantes': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'visitor': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'one-time': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'providers': 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    'proveedores': 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    'provider': 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    'events': 'M3 4h18M3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4M3 4l0 0M8 2v4M16 2v4',
    'eventos': 'M3 4h18M3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4M3 4l0 0M8 2v4M16 2v4',
    'event': 'M3 4h18M3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4M3 4l0 0M8 2v4M16 2v4'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private historyService: HistoryService,
    private visitorService: VisitorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const profile = this.authService.getCachedProfile();
    const role = profile?.role?.toLowerCase();
    
    // Permitir acceso a admin y guard
    this.isAdmin = role === 'admin' || role === 'guard';
    
    if (!this.isAdmin) {
      // Si no es admin ni guard, redirigir según el rol
      if (role === 'resident') {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/dashboard']);
      }
      return;
    }
    
    this.loadAccessData();
  }

  loadAccessData(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    const profile = this.authService.getCachedProfile();
    
    if (!currentUser && !profile) {
      this.loading = false;
      this.accessStats = [];
      this.totalAccesses = 0;
      this.updateChart();
      return;
    }

    // Verificar si el usuario es admin o guard
    const role = profile?.role?.toLowerCase();
    const isAdmin = role === 'admin' || role === 'guard';
    
    // Si es admin o guard, no pasar user_id para obtener todos los registros
    // Si no es admin ni guard, obtener solo los registros del usuario
    const params: any = {};
    
    if (!isAdmin) {
      const userId = currentUser?.id || profile?.id;
      
      if (!userId) {
        this.loading = false;
        this.accessStats = [];
        this.totalAccesses = 0;
        this.updateChart();
        return;
      }

      // Convertir el ID a número si es necesario (created_by es INT en la BD)
      const userIdNumber = typeof userId === 'string' ? parseInt(userId) : userId;
      params.user_id = userIdNumber.toString();
    }

    // Cargar visitantes (todos si es admin, solo del usuario si no es admin)
    this.visitorService.getVisitors(params).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Respuesta del servicio getVisitors:', response);
        
        if (response.visitors || response.data) {
          const visitors = response.visitors || response.data || [];
          console.log('Visitantes obtenidos:', visitors);
          console.log('Cantidad de visitantes:', visitors.length);
          // Guardar todos los visitantes
          this.allVisitors = visitors;
          // Procesar según los filtros seleccionados
          this.applyFilters();
        } else {
          console.warn('No se encontraron visitantes en la respuesta');
          this.allVisitors = [];
          this.accessStats = [];
          this.totalAccesses = 0;
          this.updateChart();
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cargar datos de accesos:', err);
        this.accessStats = [];
        this.totalAccesses = 0;
        this.updateChart();
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
    if (!this.allVisitors || this.allVisitors.length === 0) {
      this.accessStats = [];
      this.totalAccesses = 0;
      this.updateChart();
      return;
    }

    let filteredVisitors = [...this.allVisitors];

    // Filtrar por período
    if (this.selectedPeriod !== 'all') {
      const now = new Date();
      filteredVisitors = filteredVisitors.filter((visitor: any) => {
        if (!visitor.created_at) return false;
        
        const visitorDate = new Date(visitor.created_at);
        
        if (this.selectedPeriod === 'day') {
          // Mismo día
          return visitorDate.toDateString() === now.toDateString();
        } else if (this.selectedPeriod === 'month') {
          // Mismo mes y año
          return visitorDate.getMonth() === now.getMonth() && 
                 visitorDate.getFullYear() === now.getFullYear();
        } else if (this.selectedPeriod === 'year') {
          // Mismo año
          return visitorDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    // Filtrar por tipo
    if (this.selectedType !== 'all') {
      filteredVisitors = filteredVisitors.filter((visitor: any) => {
        const mappedType = this.mapVisitorTypeToRecordType(visitor.type);
        return mappedType === this.selectedType;
      });
    }

    this.processAccessData(filteredVisitors);
  }

  processAccessData(visitors: any[]): void {
    console.log('Procesando datos de visitantes:', visitors);
    
    if (!visitors || visitors.length === 0) {
      console.log('No hay visitantes para procesar');
      this.accessStats = [];
      this.totalAccesses = 0;
      this.updateChart();
      return;
    }
    
    // Agrupar por tipo de acceso usando el mismo mapeo que el historial
    const accessCounts: { [key: string]: number } = {};
    
    visitors.forEach((visitor: any) => {
      console.log('Procesando visitante:', visitor.name, 'Tipo:', visitor.type);
      // Usar el mismo mapeo que el historial
      const type = this.mapVisitorTypeToRecordType(visitor.type);
      accessCounts[type] = (accessCounts[type] || 0) + 1;
    });

    console.log('Conteos por tipo:', accessCounts);

    // Crear estadísticas
    this.accessStats = [];
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    Object.keys(accessCounts).forEach(type => {
      const count = accessCounts[type];
      const label = this.getTypeLabel(type);
      const color = this.accessTypeColors[type] || '#6c757d';
      const iconPath = this.accessTypeIcons[type] || 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

      this.accessStats.push({
        label,
        count,
        color,
        iconPath
      });

      labels.push(label);
      data.push(count);
      colors.push(color);
    });

    this.totalAccesses = visitors.length;
    console.log('Total de accesos:', this.totalAccesses);
    console.log('Estadísticas creadas:', this.accessStats);
    console.log('Labels:', labels, 'Data:', data, 'Colors:', colors);
    
    this.updateChart(labels, data, colors);
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  mapVisitorTypeToRecordType(visitorType: string): string {
    // Mapear tipos de visitantes a tipos de registros (igual que en historial)
    const typeMap: { [key: string]: string } = {
      'visitor': 'visitors',
      'one-time': 'visitors',
      'provider': 'providers',
      'event': 'events'
    };
    return typeMap[visitorType] || 'visitors';
  }


  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'visitors': 'Visitantes',
      'visitantes': 'Visitantes',
      'providers': 'Proveedores',
      'proveedores': 'Proveedores',
      'events': 'Eventos',
      'eventos': 'Eventos',
      'residents': 'Residentes',
      'residentes': 'Residentes'
    };
    return labels[type] || type;
  }

  updateChart(labels: string[] = [], data: number[] = [], colors: string[] = []): void {
    this.updateCharts(labels, data, colors);
  }

  updateCharts(labels: string[] = [], data: number[] = [], colors: string[] = []): void {
    console.log('updateCharts llamado con:', { labels, data, colors });
    
    // Asegurar que siempre haya al menos un elemento para que la gráfica se renderice
    if (labels.length === 0 || data.length === 0) {
      console.warn('No hay datos para la gráfica');
      // No mostrar gráfica si no hay datos
      this.pieChartData = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: '#1a1a1a',
          borderWidth: 2
        }]
      };
      this.barChartData = {
        labels: [],
        datasets: [{
          label: 'Cantidad',
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 2
        }]
      };
      this.cdr.detectChanges();
      return;
    }
    
    // Crear nuevas referencias para forzar la detección de cambios de Angular
    // Pie Chart
    this.pieChartData = {
      labels: [...labels],
      datasets: [{
        data: [...data],
        backgroundColor: colors.length > 0 ? [...colors] : ['#6c757d'],
        borderColor: '#1a1a1a',
        borderWidth: 2
      }]
    };
    
    // Bar Chart
    this.barChartData = {
      labels: [...labels],
      datasets: [{
        label: 'Cantidad',
        data: [...data],
        backgroundColor: colors.length > 0 ? [...colors] : ['#6c757d'],
        borderColor: colors.length > 0 ? [...colors] : ['#6c757d'],
        borderWidth: 2
      }]
    };
    
    console.log('Datos de gráficas actualizados:', this.pieChartData, this.barChartData);
    console.log('totalAccesses:', this.totalAccesses);
    console.log('accessStats:', this.accessStats);
    console.log('accessStats.length:', this.accessStats.length);
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  goBack(): void {
    const profile = this.authService.getCachedProfile();
    const role = profile?.role?.toLowerCase();
    
    // Redirigir según el rol
    if (role === 'guard') {
      this.router.navigate(['/guard-dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
