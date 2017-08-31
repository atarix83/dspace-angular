import { NgModule } from '@angular/core';
import { BaseRequestOptions } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { LocationStrategy, HashLocationStrategy, CommonModule } from '@angular/common';
import { ReactiveFormsModule, NG_VALIDATORS, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { DynamicFormsCoreModule } from '@ng2-dynamic-forms/core';

import { DynamicFormsBootstrapUIModule } from '@ng2-dynamic-forms/ui-bootstrap';
import { DynamicFormsNGBootstrapUIModule } from '@ng2-dynamic-forms/ui-ng-bootstrap';

import { ValidationMessageComponent } from './validation-message/validation-message.component';
import { customValidator } from './app.validators';
import { MyDynamicFormComponent } from './my-dynamic-form.component';
import { SharedModule } from '../shared/shared.module';
import { MyDynamicFormRoutingModule } from './my-dynamic-form-routing.module';
import { RouterModule } from '@angular/router';
import { DynamicFormService } from '@ng2-dynamic-forms/core/src/service/dynamic-form.service';
import { DynamicFormValidationService } from '@ng2-dynamic-forms/core/src/service/dynamic-form-validation.service';
import { NgReduxFormModule } from './store/module';
import { FormStore } from './store/form-store';
import { Store } from '@ngrx/store';
import { provideReduxForms } from './store/configure';
// import { dynamicFormStore } from './my-dynamic-form.store';

@NgModule({

  imports: [
    MyDynamicFormRoutingModule,
    BrowserModule,
    ReactiveFormsModule,
    NgbDatepickerModule.forRoot(),
    NgbTimepickerModule.forRoot(),
    DynamicFormsCoreModule.forRoot(),
    DynamicFormsBootstrapUIModule,
    DynamicFormsNGBootstrapUIModule,
    CommonModule,
    RouterModule,
    SharedModule,
    NgReduxFormModule
  ],
  declarations: [
    MyDynamicFormComponent,
    ValidationMessageComponent,
  ],
  providers: [
    BaseRequestOptions,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    {
      provide: NG_VALIDATORS,
      useValue: customValidator,
      multi: true
    },
    DynamicFormService,
    DynamicFormValidationService,
  ]
})
export class MyDynamicFormModule {
}
