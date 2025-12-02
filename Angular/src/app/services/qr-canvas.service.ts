import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class QRCanvasService {
  createCanvasWithQR(img: HTMLImageElement, eventData?: any, formatEventDate?: (d: string) => string, formatEventTime?: (t: string) => string, getLocationLabel?: (l: string) => string): HTMLCanvasElement {
    const qrSize = 400, padding = 40, isEvent = !!eventData;
    const infoHeight = isEvent ? 200 : 120, canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener contexto del canvas');
    canvas.width = qrSize + (padding * 2);
    canvas.height = qrSize + infoHeight + (padding * 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, padding, padding, qrSize, qrSize);
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    let yPos = qrSize + padding + 20;
    if (isEvent && eventData) {
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText(eventData.event_name || 'Evento', canvas.width / 2, yPos);
      yPos += 30;
      ctx.font = '14px Arial, sans-serif';
      const eventFields = [
        { key: 'event_date', label: 'Fecha', fn: formatEventDate },
        { key: 'event_time', label: 'Hora', fn: formatEventTime },
        { key: 'number_of_guests', label: 'Invitados' },
        { key: 'resident_name', label: 'Anfitrión' }
      ];
      eventFields.forEach(f => {
        if (eventData[f.key]) {
          const val = eventData[f.key];
          ctx.fillText(`${f.label}: ${f.fn ? f.fn(val) : val}`, canvas.width / 2, yPos);
          yPos += 20;
        }
      });
      if (eventData.resident_address && eventData.event_location === 'domicilio') {
        ctx.fillText(`Dirección: ${eventData.resident_address}`, canvas.width / 2, yPos);
      } else if (eventData.event_location && eventData.event_location !== 'domicilio' && getLocationLabel) {
        ctx.fillText(`Lugar: ${getLocationLabel(eventData.event_location)}`, canvas.width / 2, yPos);
      }
    } else {
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText('Acceso', canvas.width / 2, yPos);
      yPos += 30;
      ctx.font = '16px Arial, sans-serif';
      ['Escanea este código para ingresar de forma segura.', 'Uso exclusivo de personal autorizado.'].forEach(t => {
        ctx.fillText(t, canvas.width / 2, yPos);
        yPos += 20;
      });
    }
    return canvas;
  }
}
