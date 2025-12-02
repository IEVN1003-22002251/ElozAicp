import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface Message { id: number; text: string; time: string; sent: boolean; }
interface Resident { id: number; name: string; user_name?: string; email: string; }

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
  newMessage = '';
  isAdmin = false;
  profile: any = null;
  residents: Resident[] = [];
  selectedResident: Resident | null = null;
  loadingResidents = false;
  private refreshInterval: any;
  private readonly REFRESH_INTERVAL_MS = 3000;

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }
    this.profile = this.authService.getCachedProfile();
    this.isAdmin = this.profile?.role === 'admin' || this.profile?.role === 'guard';
    if (this.isAdmin) this.loadResidents();
    else this.loadMessages(this.activeTab);
    this.startAutoRefresh();
  }
  
  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }
  
  startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      if (this.isAdmin && this.selectedResident) this.loadConversationMessages();
      else if (!this.isAdmin) this.loadMessages(this.activeTab);
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
      next: (res) => {
        this.loadingResidents = false;
        this.residents = (res.success && res.data) ? res.data : [];
      },
      error: () => { this.loadingResidents = false; this.residents = []; }
    });
  }

  selectResident(resident: Resident): void {
    this.selectedResident = resident;
    this.loadConversationMessages();
  }

  loadConversationMessages(): void {
    if (!this.selectedResident || !this.profile) return;
    this.http.get<any>(`${environment.apiUrl}/chat/messages?sender_id=${this.profile.id}&receiver_id=${this.selectedResident.id}`).subscribe({
      next: (res) => {
        this.messages = (res.success && res.data) ? res.data.map((msg: any) => ({
          id: msg.id, text: msg.text, time: msg.time,
          sent: msg.sent === true || msg.sent === 'true' || msg.sent === 1
        })) : [];
      },
      error: () => this.messages = []
    });
  }

  selectTab(tab: 'administration' | 'security'): void {
    this.activeTab = tab;
    this.loadMessages(tab);
  }

  loadMessages(tab: 'administration' | 'security'): void {
    if (!this.profile) return;
    this.http.get<any>(`${environment.apiUrl}/chat/messages?chat_type=${tab}&user_id=${this.profile.id}`).subscribe({
      next: (res) => {
        this.messages = (res.success && res.data) ? res.data.map((msg: any) => ({
          id: msg.id, text: msg.text, time: msg.time, sent: msg.sent
        })) : [];
      },
      error: () => this.messages = []
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.profile) return;
    const messageText = this.newMessage.trim();
    const tempId = Date.now();
    const tempMessage: Message = { id: tempId, text: messageText, time: this.getCurrentTime(), sent: true };
    this.messages.push(tempMessage);
    this.newMessage = '';
    const payload = this.isAdmin && this.selectedResident
      ? { sender_id: this.profile.id, receiver_id: this.selectedResident.id, message: messageText }
      : { sender_id: this.profile.id, chat_type: this.activeTab, message: messageText };
    this.http.post<any>(`${environment.apiUrl}/chat/messages`, payload).subscribe({
      next: (res) => {
        if (res.success) {
          const idx = this.messages.findIndex(m => m.id === tempId);
          if (idx !== -1 && res.data) {
            this.messages[idx] = { id: res.data.id || tempId, text: res.data.message || messageText, time: this.getCurrentTime(), sent: true };
          }
          if (this.isAdmin && this.selectedResident) this.loadConversationMessages();
          else this.loadMessages(this.activeTab);
        }
      },
      error: () => this.messages = this.messages.filter(m => m.id !== tempId)
    });
  }

  getCurrentTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  goBack(): void {
    const role = this.authService.getCachedProfile()?.role?.toLowerCase();
    if (role === 'guard') this.router.navigate(['/guard-dashboard']);
    else if (role === 'resident') this.router.navigate(['/home']);
    else this.router.navigate(['/dashboard']);
  }
}


