import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap, map, retry, shareReplay } from 'rxjs/operators';
import { Sensor, ApiResponse } from '../../shared/models/sensor.model';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private readonly apiUrl = 'http://localhost:3000/api/sensor/latest';

  constructor(private http: HttpClient) {}

  /**
   * getLiveSensorData
   * Polls the backend every 1000ms for the latest sensor reading.
   * Auto-retries on error and shares the subscription among all subscribers
   * to avoid multiple HTTP requests per second.
   */
  getLiveSensorData(): Observable<Sensor | null> {
    // timer(0, 1000) emits immediately (0) then every 1000ms
    return timer(0, 1000).pipe(
      switchMap(() => this.http.get<ApiResponse<Sensor>>(this.apiUrl)),
      // Extract the nested 'data' from our standardized API response
      map(response => {
        if (!response.success) {
          throw new Error('API request failed');
        }
        return response.data || null; // Return null gracefully if DB is empty
      }),
      // Retry in case of transient network errors
      retry(),
      // Ensure multiple async pipes in HTML don't trigger duplicate HTTP calls
      shareReplay(1)
    );
  }
}
