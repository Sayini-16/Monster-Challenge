import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { FlightInfoPayload } from '../models/flight-info';

export interface CrmResponse {
  status: number;
  body: unknown;
}

@Injectable({ providedIn: 'root' })
export class FlightService {

  constructor(private http: HttpClient) { }

  async submitFlightInfo(payload: FlightInfoPayload): Promise<CrmResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      token: environment.flightApi.token,
      candidate: environment.flightApi.candidate,
    });

    try {
      const response = await firstValueFrom(
        this.http.post(environment.flightApi.url, payload, {
          headers,
          observe: 'response',
        }),
      );

      console.log('CRM Response Status:', response.status);
      console.log('CRM Response Body:', response.body);

      return {
        status: response.status,
        body: response.body,
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error) {
        const httpError = error as HttpResponse<unknown>;
        console.error('CRM Error Status:', httpError.status);
        console.error('CRM Error Body:', httpError.body);

        if (httpError.status === 0) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        if (httpError.status >= 500) {
          throw new Error('Server error. Please try again in a moment.');
        }
        if (httpError.status >= 400) {
          throw new Error(`Request failed (${httpError.status}). Please check your details and try again.`);
        }
      }
      throw new Error('Failed to submit flight details. Please try again.');
    }
  }
}
