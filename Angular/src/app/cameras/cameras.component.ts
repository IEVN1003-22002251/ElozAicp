import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  connectionType?: 'ip' | 'wifi' | 'usb';
  ipAddress?: string;
  wifiSSID?: string;
  wifiPassword?: string;
  usbDeviceName?: string;
  userId?: string;
  isCustom?: boolean;
}

@Component({
  selector: 'app-cameras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cameras.component.html',
  styleUrls: ['./cameras.component.css']
})
export class CamerasComponent implements OnInit, OnDestroy {
  @ViewChild('webcamVideo', { static: false }) webcamVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('expandedWebcamVideo', { static: false }) expandedWebcamVideo!: ElementRef<HTMLVideoElement>;
  
  cameras: Camera[] = [
    { id: '1', name: 'Entrada Principal', location: 'Puerta Principal', status: 'offline' },
    { id: '2', name: 'Entrada Vehicular', location: 'Portón Principal', status: 'offline' },
    { id: '3', name: 'Área Común', location: 'Zona de Recreación', status: 'offline' },
    { id: '4', name: 'Administración', location: 'Oficinas Principales', status: 'offline' }
  ];

  hiddenCameraIds: Set<string> = new Set();
  webcamStream: MediaStream | null = null;
  webcamError: string = '';
  expandedCamera: Camera | null = null;
  isResident: boolean = false;
  showConfigureModal: boolean = false;
  showDeviceSelectionModal: boolean = false;
  newCamera: Partial<Camera> = {
    name: '',
    location: '',
    connectionType: undefined,
    ipAddress: '',
    wifiSSID: '',
    wifiPassword: '',
    usbDeviceName: ''
  };
  currentUserId: string | null = null;
  availableDevices: MediaDeviceInfo[] = [];
  selectedDeviceId: string | null = null;
  cameraForDeviceSelection: Camera | null = null;
  cameraStreams: Map<string, MediaStream> = new Map();

  get totalCameras(): number {
    return this.cameras.length;
  }

  get activeCameras(): number {
    return this.cameras.filter(c => c.status === 'online').length;
  }

  get visibleCameras(): Camera[] {
    return this.cameras.filter(camera => !this.hiddenCameraIds.has(camera.id));
  }

  getCameraStatus(camera: Camera): 'online' | 'offline' {
    // La cámara "Entrada Principal" está en línea solo si hay stream de webcam
    if (camera.id === '1') {
      return this.webcamStream && !this.webcamError ? 'online' : 'offline';
    }
    // Las cámaras personalizadas están en línea si tienen un stream activo
    if (camera.isCustom) {
      return this.cameraStreams.has(camera.id) ? 'online' : 'offline';
    }
    // Las otras cámaras están fuera de línea por defecto (no tienen feed)
    return 'offline';
  }

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario es residente
    this.checkUserRole();
    
    // Conectar a la webcam para la cámara "Entrada Principal"
    this.connectWebcam();
  }

  checkUserRole(): void {
    const profile = this.authService.getCachedProfile();
    const user = this.authService.getCurrentUser();
    
    if (profile) {
      const role = profile.role?.toLowerCase();
      this.isResident = role === 'resident' || role === 'residente';
    }

    if (user) {
      this.currentUserId = user.id;
    }

    // Cargar cámaras personalizadas del residente
    if (this.isResident && this.currentUserId) {
      this.loadUserCameras();
    }
  }

  loadUserCameras(): void {
    if (!this.currentUserId) return;

    const savedCameras = localStorage.getItem(`user_cameras_${this.currentUserId}`);
    if (savedCameras) {
      try {
        const userCameras: Camera[] = JSON.parse(savedCameras);
        // Agregar las cámaras del usuario a la lista
        userCameras.forEach(camera => {
          camera.isCustom = true;
          camera.userId = this.currentUserId || undefined;
          // Generar un ID único si no existe
          if (!camera.id) {
            camera.id = `user_${this.currentUserId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }
          this.cameras.push(camera);
        });
      } catch (error) {
        console.error('Error al cargar cámaras del usuario:', error);
      }
    }
  }

  saveUserCameras(): void {
    if (!this.currentUserId) return;

    const userCameras = this.cameras.filter(c => c.isCustom && c.userId === this.currentUserId);
    localStorage.setItem(`user_cameras_${this.currentUserId}`, JSON.stringify(userCameras));
  }

  ngOnDestroy(): void {
    // Detener el stream de la webcam al destruir el componente
    this.stopWebcam();
    // Detener todos los streams de cámaras personalizadas
    this.cameraStreams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    this.cameraStreams.clear();
  }

  async connectWebcam(): Promise<void> {
    try {
      // Solicitar acceso a la webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Para la cámara frontal, usar 'environment' para la trasera
        },
        audio: false
      });

      this.webcamStream = stream;
      this.webcamError = '';

      // Actualizar el estado de la cámara a online cuando se conecta
      const entradaPrincipal = this.cameras.find(c => c.id === '1');
      if (entradaPrincipal) {
        entradaPrincipal.status = 'online';
      }

      // Esperar a que el video esté listo y asignar el stream
      setTimeout(() => {
        if (this.webcamVideo && this.webcamVideo.nativeElement) {
          this.webcamVideo.nativeElement.srcObject = stream;
        }
        if (this.expandedWebcamVideo && this.expandedWebcamVideo.nativeElement) {
          this.expandedWebcamVideo.nativeElement.srcObject = stream;
        }
      }, 100);
    } catch (error: any) {
      console.error('Error al acceder a la webcam:', error);
      this.webcamError = 'No se pudo acceder a la webcam. Verifica los permisos.';
      
      // Actualizar el estado de la cámara a offline si hay error
      const entradaPrincipal = this.cameras.find(c => c.id === '1');
      if (entradaPrincipal) {
        entradaPrincipal.status = 'offline';
      }
    }
  }

  stopWebcam(): void {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => {
        track.stop();
      });
      this.webcamStream = null;
    }
  }

  goBack(): void {
    const profile = this.authService.getCachedProfile();
    const role = profile?.role?.toLowerCase();
    
    // Redirigir según el rol
    if (role === 'resident') {
      this.router.navigate(['/home']);
    } else if (role === 'guard') {
      this.router.navigate(['/guard-dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  openSettings(): void {
    console.log('Abrir configuración');
  }

  viewAll(): void {
    // Mostrar todas las cámaras (limpiar la lista de cámaras ocultas)
    this.hiddenCameraIds.clear();
  }

  configure(): void {
    if (this.isResident) {
      this.showConfigureModal = true;
      // Resetear el formulario
      this.newCamera = {
        name: '',
        location: '',
        connectionType: undefined,
        ipAddress: '',
        wifiSSID: '',
        wifiPassword: ''
      };
    } else {
      console.log('Configurar cámaras (solo para administradores)');
    }
  }

  closeConfigureModal(): void {
    this.showConfigureModal = false;
    this.newCamera = {
      name: '',
      location: '',
      connectionType: undefined,
      ipAddress: '',
      wifiSSID: '',
      wifiPassword: '',
      usbDeviceName: ''
    };
  }

  onConnectionTypeChange(): void {
    // Limpiar campos cuando cambia el tipo de conexión
    this.newCamera.ipAddress = '';
    this.newCamera.wifiSSID = '';
    this.newCamera.wifiPassword = '';
    this.newCamera.usbDeviceName = '';
  }

  isFormValid(): boolean {
    if (!this.newCamera.name || !this.newCamera.location || !this.newCamera.connectionType) {
      return false;
    }

    if (this.newCamera.connectionType === 'ip') {
      return !!this.newCamera.ipAddress && this.isValidIP(this.newCamera.ipAddress);
    }

    if (this.newCamera.connectionType === 'wifi') {
      return !!this.newCamera.wifiSSID;
    }

    if (this.newCamera.connectionType === 'usb') {
      return !!this.newCamera.usbDeviceName;
    }

    return false;
  }

  isValidIP(ip: string): boolean {
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip)) {
      return false;
    }
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  addCamera(): void {
    if (!this.isFormValid() || !this.currentUserId) return;

    const newCamera: Camera = {
      id: `user_${this.currentUserId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: this.newCamera.name || '',
      location: this.newCamera.location || '',
      status: 'offline', // Inicia como offline hasta que se conecte
      connectionType: this.newCamera.connectionType,
      ipAddress: this.newCamera.ipAddress,
      wifiSSID: this.newCamera.wifiSSID,
      wifiPassword: this.newCamera.wifiPassword,
      usbDeviceName: this.newCamera.usbDeviceName,
      userId: this.currentUserId,
      isCustom: true
    };

    this.cameras.push(newCamera);
    this.saveUserCameras();
    this.closeConfigureModal();
  }

  expandCamera(camera: Camera): void {
    this.expandedCamera = camera;
    
    // Si es la cámara de Entrada Principal y hay stream, asegurar que se muestre en la vista expandida
    if (camera.id === '1' && this.webcamStream) {
      setTimeout(() => {
        if (this.expandedWebcamVideo && this.expandedWebcamVideo.nativeElement) {
          this.expandedWebcamVideo.nativeElement.srcObject = this.webcamStream;
        }
      }, 100);
    }
  }

  closeExpandedView(): void {
    this.expandedCamera = null;
  }

  hideCamera(camera: Camera): void {
    // Si es una cámara personalizada del usuario, eliminarla completamente
    if (camera.isCustom && camera.userId === this.currentUserId) {
      // Detener el stream si existe
      const stream = this.cameraStreams.get(camera.id);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        this.cameraStreams.delete(camera.id);
      }
      
      this.cameras = this.cameras.filter(c => c.id !== camera.id);
      this.saveUserCameras();
      // Si la cámara eliminada está expandida, cerrar la vista expandida
      if (this.expandedCamera?.id === camera.id) {
        this.closeExpandedView();
      }
    } else {
      // Si es una cámara general, solo ocultarla
      this.hiddenCameraIds.add(camera.id);
      // Si la cámara oculta está expandida, cerrar la vista expandida
      if (this.expandedCamera?.id === camera.id) {
        this.closeExpandedView();
      }
    }
  }

  async selectDeviceForCamera(camera: Camera): Promise<void> {
    this.cameraForDeviceSelection = camera;
    this.selectedDeviceId = null;
    
    try {
      // Obtener lista de dispositivos de video disponibles
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (this.availableDevices.length === 0) {
        alert('No se encontraron dispositivos de video disponibles.');
        return;
      }
      
      this.showDeviceSelectionModal = true;
    } catch (error) {
      console.error('Error al obtener dispositivos:', error);
      alert('Error al obtener la lista de dispositivos de video.');
    }
  }

  selectDevice(device: MediaDeviceInfo): void {
    this.selectedDeviceId = device.deviceId;
  }

  async confirmDeviceSelection(): Promise<void> {
    if (!this.selectedDeviceId || !this.cameraForDeviceSelection) return;

    try {
      // Detener stream anterior si existe
      const oldStream = this.cameraStreams.get(this.cameraForDeviceSelection.id);
      if (oldStream) {
        oldStream.getTracks().forEach(track => track.stop());
      }

      // Obtener stream del dispositivo seleccionado
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: this.selectedDeviceId }
        },
        audio: false
      });

      // Guardar el stream
      this.cameraStreams.set(this.cameraForDeviceSelection.id, stream);
      
      // Actualizar el estado de la cámara a online
      const camera = this.cameras.find(c => c.id === this.cameraForDeviceSelection?.id);
      if (camera) {
        camera.status = 'online';
      }

      this.closeDeviceSelectionModal();
    } catch (error: any) {
      console.error('Error al conectar al dispositivo:', error);
      alert('Error al conectar al dispositivo seleccionado. Verifica los permisos.');
    }
  }

  closeDeviceSelectionModal(): void {
    this.showDeviceSelectionModal = false;
    this.cameraForDeviceSelection = null;
    this.selectedDeviceId = null;
    this.availableDevices = [];
  }

  getCameraStream(camera: Camera): MediaStream | null {
    if (camera.isCustom) {
      return this.cameraStreams.get(camera.id) || null;
    }
    return null;
  }
}
