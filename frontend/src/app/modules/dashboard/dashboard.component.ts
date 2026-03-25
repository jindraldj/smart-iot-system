import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SensorService } from '../../core/services/sensor.service';
import { Sensor } from '../../shared/models/sensor.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Holds the most recently fetched sensor data
  sensorData: Sensor | null = null;
  
  // Track subscription to cleanly unsubscribe when component is destroyed
  private sensorSub!: Subscription;
  
  // Track previous danger state so we only log when it changes
  private wasInDanger: boolean = false;

  constructor(private sensorService: SensorService) {}

  ngOnInit(): void {
    // Start polling the backend live
    this.sensorSub = this.sensorService.getLiveSensorData().subscribe({
      next: (data) => {
        this.sensorData = data;
        
        if (data) {
          // Log to console if system newly enters danger state
          if (data.danger && !this.wasInDanger) {
            console.warn('⚠️ WARNING: SYSTEM ENCOUNTERED DANGER CONDITIONS!');
          }
          this.wasInDanger = data.danger;
        } else {
          this.wasInDanger = false;
        }
      },
      error: (err) => {
        console.error('Error fetching sensor data:', err);
      }
    });
  }

  ngOnDestroy(): void {
    // Prevent memory leaks when navigating away
    if (this.sensorSub) {
      this.sensorSub.unsubscribe();
    }
  }
}
