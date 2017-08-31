import { combineReducers, ActionReducer } from '@ngrx/store';
import { routerReducer, RouterState } from '@ngrx/router-store';
import { storeFreeze } from 'ngrx-store-freeze';
import { compose } from '@ngrx/core';

import { headerReducer, HeaderState } from './header/header.reducer';
import { hostWindowReducer, HostWindowState } from './shared/host-window.reducer';
import { CoreState, coreReducer } from './core/core.reducers';

import { StoreActionTypes } from './store.actions';

import { ENV_CONFIG } from '../config';

import { defaultFormReducer } from './forms/store/form-reducer';
import { FormState } from './forms/store/state';

export interface AppState {
  core: CoreState;
  router: RouterState;
  hostWindow: HostWindowState;
  header: HeaderState;
  forms: FormState;
}

export const reducers = {
  core: coreReducer,
  router: routerReducer,
  hostWindow: hostWindowReducer,
  header: headerReducer,
  forms: defaultFormReducer
};

export function rootReducer(state: any, action: any) {
  switch (action.type) {
    case StoreActionTypes.REHYDRATE:
      state = Object.assign({}, state, action.payload);
      break;
    case StoreActionTypes.REPLAY:
      break;
    default:
  }
  let root: ActionReducer<any>;
  // TODO: attempt to not use InjectionToken GLOBAL_CONFIG over GlobalConfig ENV_CONFIG
  if (ENV_CONFIG.production) {
    root = combineReducers(reducers)(state, action);
  } else {
    root = compose(storeFreeze, combineReducers)(reducers)(state, action);
  }
  return root;
}
