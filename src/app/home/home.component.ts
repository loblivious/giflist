import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { GifListComponentModule } from './ui/gif-list.component';
import { RedditService } from '../shared/data-access/reddit.service';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-home',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title> Home </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <app-gif-list
        *ngIf="gifs$ | async as gifs"
        [gifs]="gifs"
        (gifLoadStart)="setLoading($event)"
        (gifLoadComplete)="setLoadingComplete($event)"
      ></app-gif-list>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  currentlyLoadingGifs$ = new BehaviorSubject<string[]>([]);
  loadedGifs$ = new BehaviorSubject<string[]>([]);
  gifs$ = combineLatest([
    this.redditService.getGifs(),
    this.currentlyLoadingGifs$,
    this.loadedGifs$,
  ]).pipe(
    map(([gifs, currentlyLoadingGifs, loadedGifs]) =>
      gifs.map((gif) => ({
        ...gif,
        loading: currentlyLoadingGifs.includes(gif.permalink),
        dataLoaded: loadedGifs.includes(gif.permalink),
      }))
    )
  );

  constructor(private redditService: RedditService) {}

  setLoading(permalink: string) {
    // Add the gifs permalink to the laoding array
    this.currentlyLoadingGifs$.next([
      ...this.currentlyLoadingGifs$.value,
      permalink,
    ]);
  }

  setLoadingComplete(permalinkToComplete: string) {
    this.loadedGifs$.next([...this.loadedGifs$.value, permalinkToComplete]);

    this.currentlyLoadingGifs$.next([
      ...this.currentlyLoadingGifs$.value.filter(
        (permalink) => !this.loadedGifs$.value.includes(permalink)
      ),
    ]);
  }
}

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    IonicModule,
    GifListComponentModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
      },
    ]),
  ],
})
export class HomeComponentModule {}
