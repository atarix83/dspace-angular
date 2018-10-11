import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { hasValue, isNotEmpty } from '../../shared/empty.util';
import { SubmissionObjectEntry } from '../objects/submission-objects.reducer';
import { WorkspaceitemSectionsObject } from '../../core/submission/models/workspaceitem-sections.model';
import { SubmissionDefinitionsModel } from '../../core/shared/config/config-submission-definitions.model';
import { Workspaceitem } from '../../core/submission/models/workspaceitem.model';
import { SubmissionService } from '../submission.service';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../core/auth/auth.service';
import { Observable } from 'rxjs/Observable';
import { SectionDataObject } from '../sections/models/section-data.model';
import { UploaderOptions } from '../../shared/uploader/uploader-options.model';
import { HALEndpointService } from '../../core/shared/hal-endpoint.service';

@Component({
  selector: 'ds-submission-submit-form',
  styleUrls: ['./submission-form.component.scss'],
  templateUrl: './submission-form.component.html',
})
export class SubmissionFormComponent implements OnChanges, OnDestroy {
  @Input() collectionId: string;
  @Input() sections: WorkspaceitemSectionsObject;
  @Input() selfUrl: string;
  @Input() submissionDefinition: SubmissionDefinitionsModel;
  @Input() submissionId: string;

  public definitionId: string;
  public test = true;
  public loading: Observable<boolean> = Observable.of(true);
  public submissionSections: Observable<any>;
  public uploadFilesOptions: UploaderOptions = {
    url: '',
    authToken: null,
    disableMultipart: false,
    itemAlias: null
  };

  protected isActive: boolean;
  protected subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private halService: HALEndpointService,
    private submissionService: SubmissionService) {
    this.isActive = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.collectionId && this.submissionId) {
      this.isActive = true;
      this.submissionSections = this.submissionService.getSubmissionObject(this.submissionId)
        .filter(() => this.isActive)
        .map((submission: SubmissionObjectEntry) => submission.isLoading)
        .map((isLoading: boolean) => isLoading)
        .distinctUntilChanged()
        .flatMap((isLoading: boolean) => {
          if (!isLoading) {
            return this.getSectionsList();
          } else {
            return Observable.of([])
          }
        });

      this.loading = this.submissionService.getSubmissionObject(this.submissionId)
        .filter(() => this.isActive)
        .map((submission: SubmissionObjectEntry) => submission.isLoading)
        .map((isLoading: boolean) => isLoading)
        .distinctUntilChanged();

      this.subs.push(
        this.halService.getEndpoint('workspaceitems')
          .filter((href: string) => isNotEmpty(href))
          .distinctUntilChanged()
          .subscribe((endpointURL) => {
            this.uploadFilesOptions.authToken = this.authService.buildAuthHeader();
            this.uploadFilesOptions.url = endpointURL.concat(`/${this.submissionId}`);
            this.definitionId = this.submissionDefinition.name;
            this.submissionService.dispatchInit(
              this.collectionId,
              this.submissionId,
              this.selfUrl,
              this.submissionDefinition,
              this.sections,
              null);
            this.changeDetectorRef.detectChanges();
          })
      );
      this.submissionService.startAutoSave(this.submissionId);
    }
  }

  ngOnDestroy() {
    this.isActive = false;
    this.submissionService.stopAutoSave();
    this.submissionService.resetAllSubmissionObjects();
    this.subs
      .filter((subscription) => hasValue(subscription))
      .forEach((subscription) => subscription.unsubscribe());
  }

  onCollectionChange(workspaceItemObject: Workspaceitem) {
    this.collectionId = workspaceItemObject.collection[0].id;
    if (this.definitionId !== workspaceItemObject.submissionDefinition[0].name) {
      this.sections = workspaceItemObject.sections;
      this.submissionDefinition = workspaceItemObject.submissionDefinition[0];
      this.definitionId = this.submissionDefinition.name;
      this.submissionService.resetSubmissionObject(
        this.collectionId,
        this.submissionId,
        workspaceItemObject.self,
        this.submissionDefinition,
        this.sections);
    } else {
      this.changeDetectorRef.detectChanges();
    }
  }

  isLoading(): Observable<boolean> {
    // return isUndefined(this.loading) || this.loading === true;
    return this.loading;
  }

  protected getSectionsList(): Observable<any> {
    return this.submissionService.getSubmissionSections(this.submissionId)
      .filter((sections: SectionDataObject[]) => isNotEmpty(sections))
      .map((sections: SectionDataObject[]) => sections);
  }
}
