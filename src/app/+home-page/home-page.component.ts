import { Component } from '@angular/core';
import { CollectionDataService } from '../core/data/collection-data.service';

@Component({
  selector: 'ds-home-page',
  styleUrls: ['./home-page.component.scss'],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {
  constructor(private service: CollectionDataService) {
  }

  testTimeout() {
    this.service.findAll()
      .filter((r) => !r.isResponsePending)
      .subscribe((r) => {
        console.log(r);
      })
  }
}
