import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  private apiUrl = `${environment.apiUrl}/visitors`;

  constructor(private http: HttpClient) {}

  getVisitors(params?: {
    user_id?: string;
    status?: string;
    type?: string;
    search?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params]) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!);
        }
      });
    }

    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getVisitor(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createVisitor(visitor: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, visitor);
  }

  updateVisitor(id: string, visitor: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, visitor);
  }

  deleteVisitor(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getVisitorStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
