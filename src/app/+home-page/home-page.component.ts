import { Component } from '@angular/core';
import { WorkspaceitemDataService } from '../core/submission/workspaceitem-data.service';
import { SubmissionService } from '../submission/submission.service';
import { SubmissionRestService } from '../submission/submission-rest.service';
import { isNotUndefined } from '../shared/empty.util';

@Component({
  selector: 'ds-home-page',
  styleUrls: [ './home-page.component.scss' ],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {
  constructor(private service: WorkspaceitemDataService, private subService: SubmissionRestService) {}

  ngOnInit() {
    this.service.findById('1251')
      .filter((rd) => isNotUndefined(rd))
      .subscribe((rd) => {
        console.log(rd)
      });
    /*this.subService.getDataById('1251')
      .filter((rd) => isNotUndefined(rd))
      .subscribe((rd) => {
        console.log(rd)
      });*/
  }
}
