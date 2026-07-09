import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ActivityLogResponse {
  date: string;
  completed: boolean;
  activity_type: string | null;
}

export interface StreakResponse {
  current_streak: number;
  longest_streak: number;
  last_7_days: ActivityLogResponse[];
  message: string;
}

export interface SegmentResponse {
  cluster_id: number;
  segment_label: string;
  recommended_activity: string;
  goal: string;
}

export interface ActivityHistoryItem {
  id: number;
  date: string;
  activity_type: string | null;
  is_recommended: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private http = inject(HttpClient);

  private _recommendedActivity = signal<string>('30-min Walk'); // Fallback
  public recommendedActivity = this._recommendedActivity.asReadonly();

  private _streakData = signal<StreakResponse | null>(null);
  public streakData = this._streakData.asReadonly();

  private _activityHistory = signal<ActivityHistoryItem[]>([]);
  public activityHistory = this._activityHistory.asReadonly();

  private _hasMoreHistory = signal<boolean>(true);
  public hasMoreHistory = this._hasMoreHistory.asReadonly();

  private _genericSuggestions = signal<string[]>(['30-min Walk', 'Yoga', '15-min Stretch']);
  public genericSuggestions = this._genericSuggestions.asReadonly();

  public currentStreak = computed(() => this._streakData()?.current_streak || 0);
  public last7Days = computed(() => this._streakData()?.last_7_days || []);
  public streakMessage = computed(() => this._streakData()?.message || 'Keep it up!');

  public hasCheckedInToday = computed(() => {
    const list = this.last7Days();
    if (!list || list.length === 0) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = list.find(l => l.date === todayStr);
    return todayLog ? todayLog.completed : false;
  });

  public loadStreak() {
    if (typeof window === 'undefined') return;
    this.http.get<StreakResponse>(`${environment.apiUrl}/activity/streak`).subscribe({
      next: (res) => this._streakData.set(res),
      error: (err) => console.error('Error fetching streak', err)
    });
  }

  public loadHistory(offset: number = 0, limit: number = 20, append: boolean = false) {
    if (typeof window === 'undefined') return;
    this.http.get<ActivityHistoryItem[]>(`${environment.apiUrl}/activity/history?offset=${offset}&limit=${limit}`).subscribe({
      next: (res) => {
        if (append) {
          this._activityHistory.update(current => [...current, ...res]);
        } else {
          this._activityHistory.set(res);
        }
        this._hasMoreHistory.set(res.length === limit);
      },
      error: (err) => console.error('Error fetching history', err)
    });
  }

  public loadSuggestions() {
    if (typeof window === 'undefined') return;
    this.http.get<string[]>(`${environment.apiUrl}/activity/suggestions`).subscribe({
      next: (res) => this._genericSuggestions.set(res),
      error: (err) => console.error('Error fetching suggestions', err)
    });
  }

  public loadRecommendation() {
    if (typeof window === 'undefined') return;
    // 1. Fetch latest prediction for this user
    this.http.get<any[]>(`${environment.apiUrl}/predictions/me`).pipe(
      switchMap((predictions) => {
        if (predictions && predictions.length > 0) {
          const p = predictions[0];
          // Use the prediction payload to get the segment
          const payload = {
            age_group: p.age_group,
            bmi: p.bmi,
            income_lpa: p.income_lpa,
            city_tier: p.city_tier,
            lifestyle_risk: p.lifestyle_risk,
            occupation: p.occupation // Optional
          };
          return this.http.post<SegmentResponse>(`${environment.apiUrl}/segment/predict`, payload);
        } else {
          // If no predictions, just use a default or empty payload (may fail depending on backend)
          return of(null);
        }
      })
    ).subscribe({
      next: (segmentRes) => {
        if (segmentRes && segmentRes.recommended_activity) {
          this._recommendedActivity.set(segmentRes.recommended_activity);
        }
      },
      error: (err) => console.error('Error fetching recommendation', err)
    });
  }

  public checkIn(activityType: string, isRecommended: boolean = false) {
    this.http.post(`${environment.apiUrl}/activity/checkin`, { activity_type: activityType, is_recommended: isRecommended }).subscribe({
      next: () => {
        // Reload everything to reflect check-in
        this.loadStreak();
        this.loadHistory();
        this.loadSuggestions();
      },
      error: (err) => console.error('Error checking in', err)
    });
  }
}
