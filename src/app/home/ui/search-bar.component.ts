import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-search-bar',
  template: `
    <ion-searchbar
      [formControl]="subredditFormControl"
      animated
      placeholder="subreddit..."
      value=""
    ></ion-searchbar>
  `,
  styles: [
    `
      ion-searchbar {
        padding: 0 5px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent {
  @Input() subredditFormControl!: FormControl;
}

@NgModule({
  declarations: [SearchBarComponent],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  exports: [SearchBarComponent],
})
export class SearchBarComponentModule {}
