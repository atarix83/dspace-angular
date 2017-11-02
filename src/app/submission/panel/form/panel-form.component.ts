import { Component, ViewChild } from '@angular/core';
import { PanelModelComponent } from '../panel.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilderService } from '../../../shared/form/builder/form-builder.service';
import { DynamicFormControlModel } from '@ng-dynamic-forms/core';
import { FormComponent } from '../../../shared/form/form.component';
import { SubmissionState } from '../../submission.reducers';
import { Store } from '@ngrx/store';
import { FormService } from '../../../shared/form/form.service';
import { PanelStatusChangeAction } from '../../objects/submission-objects.actions';

@Component({
  selector: 'ds-submission-section-form',
  styleUrls: ['./panel-form.component.scss'],
  templateUrl: './panel-form.component.html',
  /* The element here always has the state "in" when it
   * is present. We animate two transitions: From void
   * to in and from in to void, to achieve an animated
   * enter and leave transition. The element enters from
   * the left and leaves to the right using translateX.
   */
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0)'})),
      transition('void => *', [
        style({transform: 'translateX(-100%)'}),
        animate(200)
      ]),
      transition('* => void', [
        animate(200, style({transform: 'translateX(100%)'}))
      ])
    ])
  ]
})
export class FormPanelComponent extends PanelModelComponent {

  public formId;
  public formModel: DynamicFormControlModel[];

  @ViewChild('formRef') formRef: FormComponent;

  constructor(private formBuilderService: FormBuilderService,
              private formService: FormService,
              private store:Store<SubmissionState>
              ) {
    super();
  }

  ngOnInit() {
    const selected = this.formService.getFormConfiguration(this.sectionData.config);
    this.formModel = this.formBuilderService.modelFromConfiguration(selected);
  }

  ngAfterViewInit() {
    this.formService.isValid(this.formRef.getFormUniqueId())
      .subscribe((formState) => {
        this.store.dispatch(new PanelStatusChangeAction(this.sectionData.submissionId, this.sectionData.panelId, formState));
      });
  }
}