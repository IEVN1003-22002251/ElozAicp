import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccessReportService {
  private visitorsUrl = `${environment.apiUrl}/visitors`;
  private profilesUrl = `${environment.apiUrl}/profiles`;

  constructor(private http: HttpClient) {}

  getAccessStats(): Observable<any> {
    // Obtener visitantes, residentes y proveedores en paralelo
    const visitors$ = this.http.get<any>(this.visitorsUrl).pipe(
      catchError(() => of({ exito: false, visitors: [] }))
    );
    const residents$ = this.http.get<any>(`${this.profilesUrl}?role=resident`).pipe(
      catchError(() => of({ exito: false, profiles: [] }))
    );
    const providers$ = this.http.get<any>(`${this.profilesUrl}?role=guard`).pipe(
      catchError(() => of({ exito: false, profiles: [] }))
    );

    return forkJoin({
      visitors: visitors$,
      residents: residents$,
      providers: providers$
    }).pipe(
      map(({ visitors, residents, providers }) => {
        const allAccesses: any[] = [];

        // Agregar visitantes
        if (visitors && visitors.exito && visitors.visitors) {
          visitors.visitors.forEach((v: any) => {
            allAccesses.push({
              ...v,
              accessType: 'visitor',
              type: v.type || 'visitor'
            });
          });
        }

        // Agregar residentes
        if (residents && residents.exito && residents.profiles) {
          residents.profiles.forEach((r: any) => {
            allAccesses.push({
              ...r,
              accessType: 'resident',
              type: 'resident',
              status: r.status || 'active'
            });
          });
        }

        // Agregar proveedores (guards)
        if (providers && providers.exito && providers.profiles) {
          providers.profiles.forEach((p: any) => {
            allAccesses.push({
              ...p,
              accessType: 'provider',
              type: 'provider',
              status: p.status || 'active'
            });
          });
        }

        return this.calculateStats(allAccesses);
      })
    );
  }

  private calculateStats(accesses: any[]): any {
    const stats = {
      total: accesses.length,
      byType: {} as any,
      byAccessType: {} as any, // visitor, resident, provider
      byStatus: {} as any,
      byDate: {} as any,
      byHour: {} as any
    };

    accesses.forEach(access => {
      // Por tipo de acceso (visitor, resident, provider)
      const accessType = access.accessType || 'unknown';
      stats.byAccessType[accessType] = (stats.byAccessType[accessType] || 0) + 1;

      // Por tipo (visitor, resident, provider, frequent, one-time, etc.)
      const type = access.type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Por estado
      const status = access.status || 'unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // Por fecha
      const dateField = access.created_at || access.updated_at;
      if (dateField) {
        const date = new Date(dateField);
        const dateKey = date.toISOString().split('T')[0];
        stats.byDate[dateKey] = (stats.byDate[dateKey] || 0) + 1;
      }

      // Por hora
      if (dateField) {
        const date = new Date(dateField);
        const hour = date.getHours();
        stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
      }
    });

    return stats;
  }

  private getEmptyStats(): any {
    return {
      total: 0,
      byType: {},
      byAccessType: {},
      byStatus: {},
      byDate: {},
      byHour: {}
    };
  }
}
