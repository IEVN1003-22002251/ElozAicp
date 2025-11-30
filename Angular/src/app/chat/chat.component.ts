import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface Message {
  id: number;
  text: string;
  time: string;
  sent: boolean;
}

interface Resident {
  id: number;
  name: string;
  user_name?: string;
  email: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  activeTab: 'administration' | 'security' = 'administration';
  messages: Message[] = [];
  newMessage: string = '';
  isAdmin: boolean = false;
  profile: any = null;
  
  // Para admin
  residents: Resident[] = [];
  selectedResident: Resident | null = null;
  loadingResidents: boolean = false;
  
  // Para auto-refresh
  private refreshInterval: any;
  private readonly REFRESH_INTERVAL_MS = 3000; // 3 segundos

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }
    
    // Detectar si el usuario es administrador
    this.profile = this.authService.getCachedProfile();
    this.isAdmin = this.profile?.role === 'admin' || this.profile?.role === 'guard';
    
    // Si es admin, cargar lista de residentes
    if (this.isAdmin) {
      this.loadResidents();
    } else {
      // Para residentes, mantener la lógica de tabs
      this.loadMessages(this.activeTab);
    }
    
    // Iniciar auto-refresh de mensajes
    this.startAutoRefresh();
  }
  
  ngOnDestroy(): void {
    // Detener auto-refresh al destruir el componente
    this.stopAutoRefresh();
  }
  
  startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      if (this.isAdmin && this.selectedResident) {
        this.loadConversationMessages();
      } else if (!this.isAdmin) {
        this.loadMessages(this.activeTab);
      }
    }, this.REFRESH_INTERVAL_MS);
  }
  
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  loadResidents(): void {
    this.loadingResidents = true;
    this.http.get<any>(`${environment.apiUrl}/residents`).subscribe({
      next: (response) => {
        this.loadingResidents = false;
        if (response.success && response.data) {
          this.residents = response.data;
        } else {
          this.residents = [];
        }
      },
      error: (error) => {
        console.error('Error loading residents:', error);
        this.loadingResidents = false;
        this.residents = [];
      }
    });
  }

  selectResident(resident: Resident): void {
    this.selectedResident = resident;
    this.loadConversationMessages();
  }

  loadConversationMessages(): void {
    if (!this.selectedResident || !this.profile) return;
    
    // Cargar mensajes de la conversación con el residente seleccionado
    // sender_id = admin, receiver_id = residente
    this.http.get<any>(`${environment.apiUrl}/chat/messages?sender_id=${this.profile.id}&receiver_id=${this.selectedResident.id}`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.messages = response.data.map((msg: any) => ({
            id: msg.id,
            text: msg.text,
            time: msg.time,
            sent: msg.sent === true || msg.sent === 'true' || msg.sent === 1
          }));
        } else {
          this.messages = [];
        }
      },
      error: (error) => {
        console.error('Error loading conversation messages:', error);
        this.messages = [];
      }
    });
  }

  selectTab(tab: 'administration' | 'security'): void {
    this.activeTab = tab;
    this.loadMessages(tab);
  }

  loadMessages(tab: 'administration' | 'security'): void {
    if (!this.profile) return;
    
    // Cargar mensajes del tab activo (para residentes)
    this.http.get<any>(`${environment.apiUrl}/chat/messages?chat_type=${tab}&user_id=${this.profile.id}`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.messages = response.data.map((msg: any) => ({
            id: msg.id,
            text: msg.text,
            time: msg.time,
            sent: msg.sent
          }));
        } else {
          this.messages = [];
        }
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.messages = [];
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.profile) return;

    const messageText = this.newMessage.trim();
    const tempId = Date.now();
    
    // Crear mensaje temporal para mostrar inmediatamente
    const tempMessage: Message = {
      id: tempId,
      text: messageText,
      time: this.getCurrentTime(),
      sent: true
    };

    this.messages.push(tempMessage);
    this.newMessage = '';

    if (this.isAdmin && this.selectedResident) {
      // Enviar mensaje a un residente específico
      this.http.post<any>(`${environment.apiUrl}/chat/messages`, {
        sender_id: this.profile.id,
        receiver_id: this.selectedResident.id,
        message: messageText
      }).subscribe({
        next: (response) => {
          if (response.success) {
            // Reemplazar mensaje temporal con el real
            const index = this.messages.findIndex(m => m.id === tempId);
            if (index !== -1 && response.data) {
              this.messages[index] = {
                id: response.data.id || tempId,
                text: response.data.message || messageText,
                time: this.getCurrentTime(),
                sent: true
              };
            }
            // Recargar mensajes para obtener la versión actualizada del servidor
            this.loadConversationMessages();
          }
        },
        error: (error) => {
          console.error('Error sending message:', error);
          // Remover mensaje temporal si falla
          this.messages = this.messages.filter(m => m.id !== tempId);
        }
      });
    } else {
      // Enviar mensaje en el tab activo (residente)
      // Para residentes, el mensaje va a todos los admins en ese tab
      this.http.post<any>(`${environment.apiUrl}/chat/messages`, {
        sender_id: this.profile.id,
        chat_type: this.activeTab,
        message: messageText
      }).subscribe({
        next: (response) => {
          if (response.success) {
            // Reemplazar mensaje temporal con el real
            const index = this.messages.findIndex(m => m.id === tempId);
            if (index !== -1 && response.data) {
              this.messages[index] = {
                id: response.data.id || tempId,
                text: response.data.message || messageText,
                time: this.getCurrentTime(),
                sent: true
              };
            }
            // Recargar mensajes para obtener la versión actualizada del servidor
            this.loadMessages(this.activeTab);
          }
        },
        error: (error) => {
          console.error('Error sending message:', error);
          // Remover mensaje temporal si falla
          this.messages = this.messages.filter(m => m.id !== tempId);
        }
      });
    }
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}


