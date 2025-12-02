import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class QRHelperService {
  extractQRData(qrUrl: string): any | null {
    try {
      const qrDataParam = new URL(qrUrl).searchParams.get('data');
      if (!qrDataParam) return null;
      return JSON.parse(decodeURIComponent(qrDataParam));
    } catch {
      return null;
    }
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'p.m.' : 'a.m.'}`;
    } catch {
      return timeString;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  }

  getLocationLabel(location: string, locationMap: { [key: string]: string }): string {
    if (!location) return '';
    return locationMap[location] || location;
  }
}
