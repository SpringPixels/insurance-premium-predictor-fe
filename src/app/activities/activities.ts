import { Component, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivityService } from './activity.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-activities',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule
  ],
  templateUrl: './activities.html',
})
export class Activities implements OnInit {
  private activityService = inject(ActivityService);
  private fb = inject(FormBuilder);

  public currentStreak = this.activityService.currentStreak;
  public hasCheckedInToday = this.activityService.hasCheckedInToday;
  public recommendedActivity = this.activityService.recommendedActivity;
  public streakMessage = this.activityService.streakMessage;
  public last7Days = this.activityService.last7Days;
  public activityHistory = this.activityService.activityHistory;
  public genericSuggestions = this.activityService.genericSuggestions;

  public checkInForm = this.fb.group({
    activityType: ['', Validators.required]
  });

  constructor() {}

  ngOnInit() {
    this.activityService.loadStreak();
    this.activityService.loadRecommendation();
    this.activityService.loadHistory();
    this.activityService.loadSuggestions();
  }

  // UI mapping for the calendar
  public calendarDays = computed(() => {
    const list = this.last7Days();
    return list.map(item => {
      const d = new Date(item.date);
      return {
        dateStr: item.date,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: item.completed
      };
    });
  });

  public thisMonthCount = computed(() => {
    const list = this.activityHistory();
    const currentMonth = new Date().getMonth();
    return list.filter(c => new Date(c.created_at).getMonth() === currentMonth).length;
  });

  public hasMoreHistory = this.activityService.hasMoreHistory;

  public groupedHistory = computed(() => {
    const list = this.activityHistory();
    const groups: { date: string, items: any[] }[] = [];
    
    list.forEach(item => {
      const dateStr = item.date;
      let group = groups.find(g => g.date === dateStr);
      if (!group) {
        group = { date: dateStr, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    });
    
    return groups;
  });

  loadMore() {
    this.activityService.loadHistory(this.activityHistory().length, 20, true);
  }

  logSuggestion(activity: string, isRecommended: boolean = true) {
    this.activityService.checkIn(activity, isRecommended);
  }

  submitCheckIn() {
    if (this.checkInForm.valid) {
      this.activityService.checkIn(this.checkInForm.value.activityType!, false);
      this.checkInForm.reset();
    }
  }
}
