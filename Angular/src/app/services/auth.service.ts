import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  profile: Profile;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar usuario desde localStorage si existe
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.exito || response.success) {
            // Guardar usuario y perfil
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('profile', JSON.stringify(response.profile));
            this.currentUserSubject.next(response.user);
            
            // Guardar token si viene en la respuesta
            if (response.token) {
              localStorage.setItem('token', response.token);
            } else if (response.data?.token) {
              localStorage.setItem('token', response.data.token);
            }
          }
        })
      );
  }

  getProfile(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/profile?user_id=${userId}`);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('profile');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCachedProfile(): Profile | null {
    const profile = localStorage.getItem('profile');
    return profile ? JSON.parse(profile) : null;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}

