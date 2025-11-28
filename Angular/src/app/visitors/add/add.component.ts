import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VisitorService } from '../../services/visitor.service';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {
  selectedRegistrationType: string = '';
  
  // Datos para visitante frecuente
  visitor: any = {
    name: '',
    email: '',
    phone: '',
    type: 'visitor',
    status: 'active',
    entryDate: ''
  };
  
  // Datos para proveedor
  providerData: any = {
    company: '',
    serviceDate: ''
  };
  
  // Datos para registro solo una vez
  oneTimeData: any = {
    name: '',
    entryDate: ''
  };
  
  // Datos para registro de eventos
  eventData: any = {
    name: '',
    eventDate: '',
    eventTime: '',
    numberOfGuests: ''
  };
  
  loading = false;
  error = '';

  constructor(
    private visitorService: VisitorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar si hay un query parameter para seleccionar automáticamente el tipo
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.selectRegistrationType(params['type']);
      }
    });
  }

  onSubmit(): void {
    // Método genérico que redirige según el tipo seleccionado
    if (!this.selectedRegistrationType) {
      // Si no hay tipo seleccionado, usar el formulario de visitante frecuente por defecto
      this.onSubmitFrequentVisitor();
      return;
    }

    switch (this.selectedRegistrationType) {
      case 'frequent':
        this.onSubmitFrequentVisitor();
        break;
      case 'provider':
        this.onSubmitProvider();
        break;
      case 'one-time':
        this.onSubmitOneTime();
        break;
      case 'event':
        this.onSubmitEvent();
        break;
      default:
        this.onSubmitFrequentVisitor();
    }
  }

  selectRegistrationType(type: string): void {
    this.selectedRegistrationType = type;
    this.error = '';
  }

  onSubmitProvider(): void {
    if (this.loading) return;
    
    if (!this.providerData.company) {
      this.error = 'El nombre de la empresa es requerido';
      return;
    }

    this.loading = true;
    this.error = '';

    // Preparar datos del proveedor
    const providerVisitor = {
      name: this.providerData.company,
      email: '',
      phone: '',
      type: 'provider',
      status: 'active',
      serviceDate: this.providerData.serviceDate
    };

    this.visitorService.createVisitor(providerVisitor).subscribe({
      next: (response) => {
        if (response.exito) {
          this.router.navigate(['/visitors/list']);
        } else {
          this.error = response.mensaje || 'Error al registrar proveedor';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  onSubmitFrequentVisitor(): void {
    if (this.loading) return;

    if (!this.visitor.name) {
      this.error = 'El nombre completo es requerido';
      return;
    }

    this.loading = true;
    this.error = '';

    const frequentVisitor = {
      name: this.visitor.name,
      email: this.visitor.email || '',
      phone: this.visitor.phone || '',
      type: 'visitor',
      status: 'active',
      entryDate: this.visitor.entryDate || null
    };

    this.visitorService.createVisitor(frequentVisitor).subscribe({
      next: (response) => {
        if (response.exito) {
          this.router.navigate(['/visitors/list']);
        } else {
          this.error = response.mensaje || 'Error al registrar visitante frecuente';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    if (this.selectedRegistrationType) {
      // Regresar a la vista de pre-registro
      this.router.navigate(['/pre-register']);
    } else {
      this.router.navigate(['/visitors/list']);
    }
  }

  get hasDate(): boolean {
    return !!this.providerData.serviceDate;
  }

  get hasEntryDate(): boolean {
    return !!this.visitor.entryDate;
  }

  onSubmitOneTime(): void {
    if (this.loading) return;

    if (!this.oneTimeData.name) {
      this.error = 'El nombre completo es requerido';
      return;
    }

    this.loading = true;
    this.error = '';

    const oneTimeVisitor = {
      name: this.oneTimeData.name,
      email: '',
      phone: '',
      type: 'one-time',
      status: 'active',
      entryDate: this.oneTimeData.entryDate || null
    };

    this.visitorService.createVisitor(oneTimeVisitor).subscribe({
      next: (response) => {
        if (response.exito) {
          this.router.navigate(['/visitors/list']);
        } else {
          this.error = response.mensaje || 'Error al registrar visitante';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  get hasOneTimeDate(): boolean {
    return !!this.oneTimeData.entryDate;
  }

  onSubmitEvent(): void {
    if (this.loading) return;

    if (!this.eventData.name) {
      this.error = 'El nombre del evento es requerido';
      return;
    }

    this.loading = true;
    this.error = '';

    // Preparar datos del evento
    const eventVisitor = {
      name: this.eventData.name,
      email: '',
      phone: '',
      type: 'event',
      status: 'active',
      eventDate: this.eventData.eventDate || null,
      eventTime: this.eventData.eventTime || null,
      numberOfGuests: this.eventData.numberOfGuests || null
    };

    this.visitorService.createVisitor(eventVisitor).subscribe({
      next: (response) => {
        if (response.exito) {
          this.router.navigate(['/visitors/list']);
        } else {
          this.error = response.mensaje || 'Error al registrar evento';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  get hasEventDate(): boolean {
    return !!this.eventData.eventDate;
  }
}

