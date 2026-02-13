import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { FlightValidationResult, FlightLeg } from '../models/flight-info';

interface AeroDataBoxFlight {
  number: string;
  status: string;
  airline: {
    name: string;
    iata?: string;
  };
  departure: {
    airport: {
      name: string;
      iata: string;
    };
    scheduledTime?: {
      utc: string;
      local: string;
    };
  };
  arrival: {
    airport: {
      name: string;
      iata: string;
    };
    scheduledTime?: {
      utc: string;
      local: string;
    };
    estimatedTime?: {
      utc: string;
      local: string;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class FlightValidationService {

  constructor(private http: HttpClient) { }

  async verifyFlight(flightNumber: string, flightDate: string): Promise<FlightValidationResult> {
    const headers = new HttpHeaders({
      'X-RapidAPI-Key': environment.aeroDataBox.apiKey,
      'X-RapidAPI-Host': environment.aeroDataBox.host,
    });

    const url = `${environment.aeroDataBox.baseUrl}/flights/number/${flightNumber.toUpperCase()}/${flightDate}`;

    try {
      const response = await firstValueFrom(
        this.http.get<AeroDataBoxFlight[]>(url, { headers }),
      );

      if (response && response.length > 0) {
        const legs: FlightLeg[] = response.map((f) => {
          let arrivalTime: string | null = null;
          const arrivalDatetime =
            f.arrival.estimatedTime?.local ?? f.arrival.scheduledTime?.local;
          if (arrivalDatetime) {
            const dt = new Date(arrivalDatetime);
            arrivalTime = dt.toTimeString().slice(0, 5); // "14:30"
          }

          return {
            airline: f.airline.name,
            departureAirport: f.departure.airport.name,
            departureIata: f.departure.airport.iata,
            arrivalAirport: f.arrival.airport.name,
            arrivalIata: f.arrival.airport.iata,
            arrivalTime,
          };
        });

        return {
          found: true,
          legs,
          flightNumber: flightNumber.toUpperCase(),
        };
      }

      return { found: false, legs: [], flightNumber };
    } catch {
      throw new Error('Flight verification service unavailable');
    }
  }
}
