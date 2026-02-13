import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { FlightInfoPayload, FlightLeg } from '../models/flight-info';
import { FlightService } from './flight.service';
import { FlightValidationService } from '../services/flight-validation.service';

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selected = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected >= today ? null : { pastDate: true };
}

@Component({
  selector: 'app-flight-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatRadioModule,
  ],
  template: `
    @if (submissionState() === 'success') {
      <div class="result-container">
        <mat-card class="result-card">
          <div class="success-badge">
            <mat-icon class="success-check">check</mat-icon>
          </div>
          <h2>Flight Details Submitted</h2>
          <p class="result-summary">
            <strong>{{ submittedData()?.airline }} {{ submittedData()?.flightNumber }}</strong>
            arriving <strong>{{ submittedData()?.arrivalDate }}</strong>
            has been sent to the resort.
          </p>
          <div class="result-details">
            <div class="detail-chip">
              <mat-icon>schedule</mat-icon>
              {{ submittedData()?.arrivalTime }}
            </div>
            <div class="detail-chip">
              <mat-icon>group</mat-icon>
              {{ submittedData()?.numOfGuests }} guests
            </div>
          </div>
          <button mat-raised-button color="primary" (click)="resetForm()" class="reset-btn">
            <mat-icon>add</mat-icon>
            Submit Another Flight
          </button>
        </mat-card>
      </div>
    } @else if (submissionState() === 'error') {
      <div class="result-container">
        <mat-card class="result-card error-state">
          <div class="error-badge">
            <mat-icon>close</mat-icon>
          </div>
          <h2>Submission Failed</h2>
          <p class="result-summary">{{ submissionError() }}</p>
          <div class="error-actions">
            <button mat-raised-button color="primary" (click)="onSubmit()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
            <button mat-stroked-button (click)="submissionState.set('idle')">
              Edit Form
            </button>
          </div>
        </mat-card>
      </div>
    } @else {
      <div class="form-container">
        <mat-card class="form-card">
          <!-- Header -->
          <div class="form-header">
            <div class="header-icon-wrap">
              <mat-icon>flight</mat-icon>
            </div>
            <div>
              <h2 class="form-title">Flight Information</h2>
              <p class="form-subtitle">Enter your arrival details for the resort</p>
            </div>
          </div>

          <div class="form-divider"></div>

          <!-- Step Guide -->
          <div class="step-guide">
            <div class="step" [class.step-done]="flightForm.get('arrivalDate')?.valid">
              <div class="step-num">1</div>
              <span>Select your <strong>arrival date</strong></span>
            </div>
            <div class="step-connector"></div>
            <div class="step" [class.step-done]="flightVerified()">
              <div class="step-num">2</div>
              <span>Enter flight number & tap <strong>Verify</strong></span>
            </div>
            <div class="step-connector"></div>
            <div class="step" [class.step-done]="flightForm.valid">
              <div class="step-num">3</div>
              <span>Fill remaining details & <strong>submit</strong></span>
            </div>
          </div>

          <mat-card-content>
            <form [formGroup]="flightForm" (ngSubmit)="onSubmit()">

              <!-- Arrival Date -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Arrival Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="picker"
                  formControlName="arrivalDate"
                  [min]="today"
                />
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                @if (flightForm.get('arrivalDate')?.hasError('required') && flightForm.get('arrivalDate')?.touched) {
                  <mat-error>Arrival date is required</mat-error>
                }
                @if (flightForm.get('arrivalDate')?.hasError('pastDate')) {
                  <mat-error>Date must be today or in the future</mat-error>
                }
              </mat-form-field>

              <!-- Flight Number + Verify -->
              <div class="field-row">
                <mat-form-field appearance="outline" class="flex-field">
                  <mat-label>Flight Number</mat-label>
                  <input
                    matInput
                    formControlName="flightNumber"
                    placeholder="e.g. AA1234"
                  />
                  <mat-icon matPrefix>flight</mat-icon>
                  @if (flightVerified()) {
                    <mat-icon matSuffix class="verified-icon" matTooltip="Flight verified">verified</mat-icon>
                  }
                  @if (flightForm.get('flightNumber')?.hasError('required') && flightForm.get('flightNumber')?.touched) {
                    <mat-error>Flight number is required</mat-error>
                  }
                  @if (flightForm.get('flightNumber')?.hasError('minlength') || flightForm.get('flightNumber')?.hasError('maxlength')) {
                    <mat-error>Must be 2-10 characters</mat-error>
                  }
                </mat-form-field>

                <button
                  mat-raised-button
                  color="primary"
                  type="button"
                  class="verify-button"
                  (click)="verifyFlight()"
                  [disabled]="isVerifying() || !canVerify()"
                  [matTooltip]="!canVerify() ? 'Enter arrival date and flight number first' : ''"
                >
                  @if (isVerifying()) {
                    <mat-spinner diameter="18"></mat-spinner>
                  } @else {
                    <mat-icon>radar</mat-icon>
                    Verify
                  }
                </button>
              </div>

              @if (flightWarning()) {
                <div class="flight-warning">
                  <mat-icon>info</mat-icon>
                  <span>{{ flightWarning() }}</span>
                </div>
              }

              <!-- Leg Picker -->
              @if (availableLegs().length > 1) {
                <div class="leg-picker">
                  <p class="leg-picker-label">
                    <mat-icon>connecting_airports</mat-icon>
                    Multiple legs found — select your route:
                  </p>
                  <mat-radio-group (change)="onLegSelected($event.value)">
                    @for (leg of availableLegs(); track leg.arrivalIata; let i = $index) {
                      <mat-radio-button [value]="i" class="leg-option">
                        <div class="leg-info">
                          <span class="leg-route">
                            <span class="leg-iata">{{ leg.departureIata }}</span>
                            <mat-icon class="leg-arrow">east</mat-icon>
                            <span class="leg-iata">{{ leg.arrivalIata }}</span>
                          </span>
                          <span class="leg-details">
                            {{ leg.departureAirport }} to {{ leg.arrivalAirport }}
                          </span>
                          @if (leg.arrivalTime) {
                            <span class="leg-time">
                              <mat-icon class="leg-time-icon">schedule</mat-icon>
                              Arrives {{ leg.arrivalTime }}
                            </span>
                          }
                        </div>
                      </mat-radio-button>
                    }
                  </mat-radio-group>
                </div>
              }

              <!-- Airline -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Airline</mat-label>
                <input
                  matInput
                  formControlName="airline"
                  placeholder="e.g. Delta Airlines"
                />
                <mat-icon matPrefix>airlines</mat-icon>
                @if (flightForm.get('airline')?.hasError('required') && flightForm.get('airline')?.touched) {
                  <mat-error>Airline is required</mat-error>
                }
                @if (flightForm.get('airline')?.hasError('minlength')) {
                  <mat-error>Must be at least 2 characters</mat-error>
                }
              </mat-form-field>

              <!-- Arrival Time -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Arrival Time</mat-label>
                <input
                  matInput
                  type="time"
                  formControlName="arrivalTime"
                />
                <mat-icon matPrefix>schedule</mat-icon>
                @if (flightForm.get('arrivalTime')?.hasError('required') && flightForm.get('arrivalTime')?.touched) {
                  <mat-error>Arrival time is required</mat-error>
                }
              </mat-form-field>

              <!-- Number of Guests -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Number of Guests</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="numOfGuests"
                  min="1"
                  step="1"
                  placeholder="e.g. 2"
                />
                <mat-icon matPrefix>group</mat-icon>
                @if (flightForm.get('numOfGuests')?.hasError('required') && flightForm.get('numOfGuests')?.touched) {
                  <mat-error>Number of guests is required</mat-error>
                }
                @if (flightForm.get('numOfGuests')?.hasError('min')) {
                  <mat-error>Must be at least 1 guest</mat-error>
                }
                @if (flightForm.get('numOfGuests')?.hasError('pattern')) {
                  <mat-error>Must be a whole number</mat-error>
                }
              </mat-form-field>

              <!-- Comments -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Comments (optional)</mat-label>
                <textarea
                  matInput
                  formControlName="comments"
                  rows="3"
                  placeholder="Any special requests or notes for the resort"
                ></textarea>
                <mat-icon matPrefix>comment</mat-icon>
              </mat-form-field>

              <!-- Submit -->
              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="full-width submit-button"
                [disabled]="flightForm.invalid || submissionState() === 'submitting'"
              >
                @if (submissionState() === 'submitting') {
                  <mat-spinner diameter="20"></mat-spinner>
                  <span>Submitting...</span>
                } @else {
                  <mat-icon>send</mat-icon>
                  <span>Submit Flight Details</span>
                }
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: `
    /* ── Layout ── */
    .form-container,
    .result-container {
      display: flex;
      justify-content: center;
      padding: 32px 16px;
    }

    .form-card {
      width: 100%;
      max-width: 620px;
      padding: 36px;
      animation: cardSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes cardSlide {
      from { opacity: 0; transform: translateY(16px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Form Header ── */
    .form-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .header-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(0, 200, 83, 0.2), rgba(0, 200, 83, 0.05));
      border: 1px solid rgba(0, 200, 83, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .header-icon-wrap mat-icon {
      color: #00c853 !important;
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    .form-title {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 22px;
      color: #ffffff;
      margin: 0;
    }

    .form-subtitle {
      color: rgba(255, 255, 255, 0.45);
      font-size: 14px;
      margin: 4px 0 0;
    }

    .form-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 200, 83, 0.2), transparent);
      margin-bottom: 20px;
    }

    /* ── Step Guide ── */
    .step-guide {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 24px;
      padding: 16px 20px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .step {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.4);
      transition: all 0.3s ease;
    }

    .step strong {
      color: rgba(255, 255, 255, 0.55);
    }

    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .step-connector {
      width: 1px;
      height: 10px;
      background: rgba(255, 255, 255, 0.08);
      margin-left: 11px;
    }

    .step-done {
      color: #00c853;
    }

    .step-done strong {
      color: #00c853;
    }

    .step-done .step-num {
      background: rgba(0, 200, 83, 0.15);
      border-color: rgba(0, 200, 83, 0.4);
      color: #00c853;
      box-shadow: 0 0 12px rgba(0, 200, 83, 0.15);
    }

    /* ── Fields ── */
    .full-width {
      width: 100%;
    }

    .field-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .flex-field {
      flex: 1;
    }

    .verify-button {
      margin-top: 4px;
      height: 56px;
      white-space: nowrap;
      gap: 6px;
    }

    .verified-icon {
      color: #00c853 !important;
      animation: verifyPop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes verifyPop {
      0% { transform: scale(0); opacity: 0; }
      60% { transform: scale(1.3); }
      100% { transform: scale(1); opacity: 1; }
    }

    /* ── Flight Warning ── */
    .flight-warning {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      margin: -8px 0 16px;
      border-radius: 10px;
      background: rgba(255, 213, 79, 0.08);
      border: 1px solid rgba(255, 213, 79, 0.15);
      color: #ffd54f;
      font-size: 14px;
    }

    /* ── Leg Picker ── */
    .leg-picker {
      margin: -8px 0 16px;
      padding: 18px;
      border-radius: 14px;
      background: rgba(0, 200, 83, 0.04);
      border: 1px solid rgba(0, 200, 83, 0.12);
    }

    .leg-picker-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 14px;
      font-weight: 500;
      color: #00c853;
      font-size: 14px;
    }

    .leg-picker mat-radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .leg-option {
      display: block;
      padding: 14px 16px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .leg-option:hover {
      border-color: rgba(0, 200, 83, 0.3);
      background: rgba(0, 200, 83, 0.06);
      box-shadow: 0 4px 16px rgba(0, 200, 83, 0.1);
    }

    .leg-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .leg-route {
      font-weight: 600;
      font-size: 15px;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .leg-iata {
      background: rgba(0, 200, 83, 0.12);
      border: 1px solid rgba(0, 200, 83, 0.2);
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .leg-arrow {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: rgba(255, 255, 255, 0.3);
    }

    .leg-details {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.45);
    }

    .leg-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 500;
      color: #00c853;
    }

    .leg-time-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* ── Submit ── */
    .submit-button {
      margin-top: 12px;
      height: 52px;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    /* ── Result Cards ── */
    .result-card {
      width: 100%;
      max-width: 500px;
      padding: 48px 36px;
      text-align: center;
      animation: cardSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .result-card h2 {
      font-family: 'Poppins', sans-serif;
      color: #ffffff;
      font-size: 22px;
      margin: 20px 0 12px;
    }

    .success-badge {
      width: 72px;
      height: 72px;
      margin: 0 auto;
      border-radius: 50%;
      background: linear-gradient(135deg, #00c853, #00a844);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(0, 200, 83, 0.35);
      animation: badgePop 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .error-badge {
      width: 72px;
      height: 72px;
      margin: 0 auto;
      border-radius: 50%;
      background: linear-gradient(135deg, #ef5350, #c62828);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(239, 83, 80, 0.3);
    }

    .success-badge mat-icon,
    .error-badge mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: white;
    }

    @keyframes badgePop {
      0% { transform: scale(0) rotate(-45deg); }
      60% { transform: scale(1.15) rotate(0); }
      100% { transform: scale(1) rotate(0); }
    }

    .result-summary {
      font-size: 15px;
      line-height: 1.7;
      margin-bottom: 20px;
      color: rgba(255, 255, 255, 0.6);
    }

    .result-summary strong {
      color: #ffffff;
    }

    .result-details {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 28px;
    }

    .detail-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 10px;
      background: rgba(0, 200, 83, 0.08);
      border: 1px solid rgba(0, 200, 83, 0.15);
      color: #00c853;
      font-size: 14px;
      font-weight: 500;
    }

    .detail-chip mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #00c853 !important;
    }

    .reset-btn {
      gap: 6px;
    }

    .error-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    /* ── Responsive ── */
    @media (max-width: 480px) {
      .form-card {
        padding: 24px 16px;
      }

      .field-row {
        flex-direction: column;
      }

      .verify-button {
        width: 100%;
      }

      .header-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
      }

      .header-icon-wrap mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .result-details {
        flex-direction: column;
        align-items: center;
      }
    }
  `,
})
export class FlightFormComponent {
  readonly today = new Date();

  flightForm: FormGroup;
  submissionState = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  submissionError = signal('');
  submittedData = signal<FlightInfoPayload | null>(null);

  flightVerified = signal(false);
  flightWarning = signal('');
  isVerifying = signal(false);
  availableLegs = signal<FlightLeg[]>([]);

  constructor(
    private fb: FormBuilder,
    private flightService: FlightService,
    private flightValidationService: FlightValidationService,
  ) {
    this.flightForm = this.fb.group({
      arrivalDate: [null as Date | null, [Validators.required, futureDateValidator]],
      flightNumber: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      airline: ['', [Validators.required, Validators.minLength(2)]],
      arrivalTime: ['', Validators.required],
      numOfGuests: [null as number | null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      comments: [''],
    });
  }

  canVerify(): boolean {
    const flightControl = this.flightForm.get('flightNumber');
    const dateControl = this.flightForm.get('arrivalDate');
    return !!(flightControl?.valid && dateControl?.valid && dateControl.value);
  }

  async verifyFlight(): Promise<void> {
    const flightNumber = this.flightForm.get('flightNumber')?.value;
    const arrivalDate: Date = this.flightForm.get('arrivalDate')?.value;
    if (!flightNumber || !arrivalDate) return;

    this.isVerifying.set(true);
    this.flightWarning.set('');
    this.flightVerified.set(false);
    this.availableLegs.set([]);

    const dateStr = arrivalDate.toISOString().split('T')[0];

    try {
      const result = await this.flightValidationService.verifyFlight(flightNumber, dateStr);

      if (result.found && result.legs.length > 0) {
        if (result.legs.length === 1) {
          this.applyLeg(result.legs[0]);
          this.flightVerified.set(true);
        } else {
          this.availableLegs.set(result.legs);
        }
      } else {
        this.flightWarning.set(
          'Flight not found for this date. You can still submit — please fill in the details manually.'
        );
      }
    } catch {
      this.flightWarning.set(
        'Could not verify flight at this time. Please fill in the details manually.'
      );
    } finally {
      this.isVerifying.set(false);
    }
  }

  onLegSelected(index: number): void {
    const leg = this.availableLegs()[index];
    if (leg) {
      this.applyLeg(leg);
      this.flightVerified.set(true);
    }
  }

  private applyLeg(leg: FlightLeg): void {
    this.flightForm.get('airline')?.setValue(leg.airline);
    if (leg.arrivalTime) {
      this.flightForm.get('arrivalTime')?.setValue(leg.arrivalTime);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.flightForm.invalid) return;

    this.submissionState.set('submitting');

    const formValue = this.flightForm.value;
    const arrivalDate: Date = formValue.arrivalDate;

    const payload: FlightInfoPayload = {
      airline: formValue.airline,
      arrivalDate: arrivalDate.toISOString().split('T')[0],
      arrivalTime: formValue.arrivalTime,
      flightNumber: formValue.flightNumber,
      numOfGuests: Number(formValue.numOfGuests),
      ...(formValue.comments ? { comments: formValue.comments } : {}),
    };

    try {
      await this.flightService.submitFlightInfo(payload);
      this.submittedData.set(payload);
      this.submissionState.set('success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      this.submissionError.set(message);
      this.submissionState.set('error');
    }
  }

  resetForm(): void {
    this.flightForm.reset();
    this.submissionState.set('idle');
    this.submittedData.set(null);
    this.flightVerified.set(false);
    this.flightWarning.set('');
    this.availableLegs.set([]);
  }
}
