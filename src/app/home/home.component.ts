import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { GifListComponentModule } from './ui/gif-list.component';
import { RedditService } from '../shared/data-access/reddit.service';

@Component({
  selector: 'app-home',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title> Home </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <app-gif-list *ngIf="gifs$ | async as gifs" [gifs]="gifs"></app-gif-list>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  gifs$ = this.redditService.getGifs();

  constructor(private redditService: RedditService) {}
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
