import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { FlightInfoPayload } from '../models/flight-info';

@Injectable({ providedIn: 'root' })
export class FlightService {

  constructor(private http: HttpClient) { }

  async submitFlightInfo(payload: FlightInfoPayload): Promise<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      token: environment.flightApi.token,
      candidate: environment.flightApi.candidate,
    });

    try {
      console.log('CRM Payload:', JSON.stringify(payload, null, 2));
      console.log('CRM Headers:', { token: environment.flightApi.token, candidate: environment.flightApi.candidate });
      await firstValueFrom(
        this.http.post(environment.flightApi.url, payload, { headers }),
      );
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status === 0) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        if (status >= 500) {
          throw new Error('Server error. Please try again in a moment.');
        }
        if (status >= 400) {
          throw new Error('Invalid request. Please check your details and try again.');
        }
      }
      throw new Error('Failed to submit flight details. Please try again.');
    }
  }
}
