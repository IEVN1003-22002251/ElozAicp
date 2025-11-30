import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface Message {
  id: number;
  text: string;
  time: string;
  sent: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  activeTab: 'administration' | 'security' = 'administration';
  messages: Message[] = [];
  newMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/sing-in']);
      return;
    }
    // Initialize empty messages array
    // Messages will be loaded from service when implemented
  }

  selectTab(tab: 'administration' | 'security'): void {
    this.activeTab = tab;
    // Load messages for selected tab
    this.loadMessages(tab);
  }

  loadMessages(tab: 'administration' | 'security'): void {
    // TODO: Load messages from service based on selected tab
    this.messages = [];
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      text: this.newMessage.trim(),
      time: this.getCurrentTime(),
      sent: true
    };

    this.messages.push(message);
    this.newMessage = '';

    // TODO: Send message to backend
    // this.chatService.sendMessage(this.activeTab, message.text).subscribe(...)
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
<<<<<<< HEAD
=======

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
>>>>>>> origin/Alan
}


