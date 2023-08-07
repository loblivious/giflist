import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { combineLatest, map, startWith } from 'rxjs';
import { SettingsComponentModule } from '../settings/settings.component';
import { RedditService } from '../shared/data-access/reddit.service';
import { SettingsService } from '../shared/data-access/settings.service';
import { Gif } from '../shared/interfaces';
import { HomeStore } from './data-access/home.store';
import { GifListComponentModule } from './ui/gif-list.component';
import { SearchBarComponentModule } from './ui/search-bar.component';

@Component({
  selector: 'app-home',
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <ion-header>
        <ion-toolbar color="primary">
          <app-search-bar
            [subredditFormControl]="store.subredditFormControl"
          ></app-search-bar>
          <ion-buttons slot="end">
            <ion-button
              id="settings-button"
              (click)="store.settingsModalIsOpen$.next(true)"
            >
              <ion-icon slot="icon-only" name="settings"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
        <ion-progress-bar
          color="light"
          *ngIf="vm.isLoading"
          type="indeterminate"
          reversed="true"
        ></ion-progress-bar>
      </ion-header>
      <ion-content>
        <app-gif-list
          *ngIf="vm.gifs"
          [gifs]="vm.gifs"
          (gifLoadStart)="store.setLoading($event)"
          (gifLoadComplete)="store.setLoadingComplete($event)"
        ></app-gif-list>

        <ion-infinite-scroll
          *ngIf="vm.gifs.length >= vm.settings.perPage"
          threshold="100px"
          (ionInfinite)="loadMore($event, vm.gifs)"
        >
          <ion-infinite-scroll-content
            loadingSpinner="bubbles"
            loadingText="Fetching gifs..."
          ></ion-infinite-scroll-content>
        </ion-infinite-scroll>
        <ion-popover
          trigger="settings-button"
          [isOpen]="vm.modalIsOpen"
          (ionPopoverDidDismiss)="store.settingsModalIsOpen$.next(false)"
        >
          <ng-template>
            <app-settings></app-settings>
          </ng-template>
        </ion-popover>
      </ion-content>
    </ng-container>
  `,
  styles: [
    `
      ion-infinite-scroll-content {
        margin-top: 20px;
      }

      ion-buttons {
        margin: auto 0;
      }
    `,
  ],
  providers: [HomeStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  vm$ = combineLatest([
    this.store.gifs$.pipe(startWith([])),
    this.settingsService.settings$,
    this.redditService.isLoading$,
    this.store.settingsModalIsOpen$,
  ]).pipe(
    map(([gifs, settings, isLoading, modalIsOpen]) => ({
      gifs,
      settings,
      isLoading,
      modalIsOpen,
    }))
  );

  constructor(
    protected store: HomeStore,
    private redditService: RedditService,
    private settingsService: SettingsService
  ) {}

  loadMore(ev: Event, currentGifs: Gif[]) {
    this.redditService.nextPage(ev, currentGifs[currentGifs.length - 1].name);
  }
}

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    IonicModule,
    GifListComponentModule,
    ReactiveFormsModule,
    SearchBarComponentModule,
    SettingsComponentModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
      },
    ]),
  ],
})
export class HomeComponentModule {}
