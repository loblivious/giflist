import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, PopoverController } from '@ionic/angular';
import { SettingsService } from '../shared/data-access/settings.service';
import { Settings } from '../shared/interfaces';
import { SettingsFormComponentModule } from './ui/settings-form.component';

@Component({
  selector: 'app-settings',
  template: `
    <ion-header>
      <ion-toolbar color="light">
        <ion-buttons slot="end">
          <ion-button (click)="popoverControl.dismiss()">
            <ion-icon slot="icon-only" name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <app-settings-form
        [settingsForm]="settingsForm"
        (save)="handleSave()"
      ></app-settings-form>
    </ion-content>
  `,
  styles: [
    `
      :host {
        height: 100%;
      }

      ion-segment {
        --ion-background-color: #fff;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  settingsForm = this.fb.nonNullable.group<Settings>({
    sort: 'hot',
    perPage: 10,
  });

  constructor(
    private fb: FormBuilder,
    protected settingsService: SettingsService,
    protected popoverControl: PopoverController
  ) {}

  handleSave() {
    this.settingsService.save(this.settingsForm.getRawValue());
    this.popoverControl.dismiss();
  }
}

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    SettingsFormComponentModule,
  ],
  exports: [SettingsComponent],
})
export class SettingsComponentModule {}
