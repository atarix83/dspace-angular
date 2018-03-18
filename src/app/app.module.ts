import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserTransferStateModule } from '@angular/platform-browser';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { EffectsModule } from '@ngrx/effects';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { META_REDUCERS, MetaReducer, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { TranslateModule } from '@ngx-translate/core';

import { storeFreeze } from 'ngrx-store-freeze';

import { ASSETS_PATH, ENV_CONFIG, GLOBAL_CONFIG, GlobalConfig } from '../config';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { appEffects } from './app.effects';
import { appMetaReducers, debugMetaReducers } from './app.metareducers';
import { appReducers, AppState } from './app.reducer';

import { CoreModule } from './core/core.module';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';

import { DSpaceRouterStateSerializer } from './shared/ngrx/dspace-router-state-serializer';

export function getConfig() {
  return ENV_CONFIG;
}

export function getBase() {
  return ENV_CONFIG.ui.nameSpace;
}

export function getAssetsPath() {
  return ASSETS_PATH;
}

export function getMetaReducers(config: GlobalConfig): Array<MetaReducer<AppState>> {
  const metaReducers: Array<MetaReducer<AppState>> = config.production ? appMetaReducers : [...appMetaReducers, storeFreeze];
  return config.debug ? [...metaReducers, ...debugMetaReducers] : metaReducers;
}

const DEV_MODULES: any[] = [];

if (!ENV_CONFIG.production) {
  DEV_MODULES.push(StoreDevtoolsModule.instrument({ maxAge: 500 }));
}

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule.forRoot(),
    NgbModule.forRoot(),
    TranslateModule.forRoot(),
    EffectsModule.forRoot(appEffects),
    StoreModule.forRoot(appReducers),
    StoreRouterConnectingModule,
    ...DEV_MODULES
  ],
  providers: [
    {
      provide: GLOBAL_CONFIG,
      useFactory: (getConfig)
    },
    {
      provide: APP_BASE_HREF,
      useFactory: (getBase)
    },
    {
      provide: META_REDUCERS,
      useFactory: getMetaReducers,
      deps: [GLOBAL_CONFIG]
    },
    {
      provide: ASSETS_PATH,
      useFactory: (getAssetsPath)
    },
    {
      provide: RouterStateSerializer,
      useClass: DSpaceRouterStateSerializer
    }
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    PageNotFoundComponent
  ],
  exports: [AppComponent]
})
export class AppModule {

}
