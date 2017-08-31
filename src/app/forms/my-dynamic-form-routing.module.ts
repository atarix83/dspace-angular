import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MyDynamicFormComponent } from './my-dynamic-form.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: 'forms', pathMatch: 'full', component: MyDynamicFormComponent }
        ])
    ]
})
export class MyDynamicFormRoutingModule {
}
