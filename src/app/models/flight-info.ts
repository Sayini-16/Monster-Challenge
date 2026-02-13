export interface FlightInfoPayload {
  airline: string;
  arrivalDate: string;
  arrivalTime: string;
  flightNumber: string;
  numOfGuests: number;
  comments?: string;
}

export interface FlightLeg {
  airline: string;
  departureAirport: string;
  departureIata: string;
  arrivalAirport: string;
  arrivalIata: string;
  arrivalTime: string | null;
}

export interface FlightValidationResult {
  found: boolean;
  legs: FlightLeg[];
  flightNumber: string;
}
