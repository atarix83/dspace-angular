import { Component, Inject } from '@angular/core';
import { ASSETS_PATH } from '../../../config';

@Component({
  selector: 'ds-home-news',
  styleUrls: ['./home-news.component.scss'],
  templateUrl: './home-news.component.html'
})
export class HomeNewsComponent {

  constructor(@Inject(ASSETS_PATH) protected assetsPath: string) {
  }
}
