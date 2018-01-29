import { Component } from '@angular/core';
import { WorkspaceitemDataService } from '../core/submission/workspaceitem-data.service';
import { CollectionDataService } from '../core/data/collection-data.service';
import { SubmissionRestService } from '../submission/submission-rest.service';
import { Workspaceitem } from '../core/submission/models/workspaceitem.model';
import { isNotEmpty } from '../shared/empty.util';

@Component({
  selector: 'ds-home-page',
  styleUrls: [ './home-page.component.scss' ],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {
  constructor(private service: SubmissionRestService) {
  }

  ngOnInit() {
    this.service.postToEndpoint('workspaceitems', {})
      .map((workspaceitems) => workspaceitems[0])
      .subscribe((workspaceitems: Workspaceitem) => {
        const id = workspaceitems.id;
        let body = [{
          op: 'add',
          path: '/sections/traditionalpageone/dc.title',
          value: [{
            value:'test update 1'
          }]
        }];
        this.service.patchToEndpoint('workspaceitems', body, id)
          .filter((rw) => isNotEmpty(rw))
          .take(1)
          .map((rw) => rw[0])
          .subscribe((rw) => {
            console.log('update_1', rw.sections.traditionalpageone);
            body = [{
              op: 'add',
              path: '/sections/traditionalpageone/dc.title',
              value: [{
                value:'test update 2'
              }]
            }];
            setTimeout(() => {
            this.service.patchToEndpoint('workspaceitems', body, id)
              .filter((rrw) => isNotEmpty(rrw))
              .take(1)
              .map((rrw) => rrw[0])
              .subscribe((rrw) => {
                console.log('update_2', rrw.sections.traditionalpageone);
              })}, 1000)
          })
      })
  }
}
