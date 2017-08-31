import {Injectable} from '@angular/core';

import {NgForm} from '@angular/forms';

// import {NgRedux} from '@angular-redux/store';
import { Store } from '@ngrx/store';

// import {Action, Unsubscribe} from 'redux';
import { Action } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { type } from '../../shared/ngrx/type';

export interface AbstractStore<RootState> {
  /// Dispatch an action
  dispatch(action: Action & {payload: any}): void;

  /// Retrieve the current application state
  getState(): RootState;

  /// Subscribe to changes in the store
  subscribe(fn: (state: RootState) => void): Subscription;
}

export const FormActionTypes = {
  FORM_INIT: type('dspace/form/FORM_INIT'),
  FORM_CHANGED: type('dspace/form/FORM_CHANGED')
};

@Injectable()
export class FormStore {
  /// NOTE(cbond): The declaration of store is misleading. This class is
  /// actually capable of taking a plain Redux store or an NgRedux instance.
  /// But in order to make the ng dependency injector work properly, we
  /// declare it as an NgRedux type, since the @angular-redux/store use case involves
  /// calling the constructor of this class manually (from configure.ts),
  /// where a plain store can be cast to an NgRedux. (For our purposes, they
  /// have almost identical shapes.)
  constructor(private store: Store<any>) {}

  getState() {
      let state: any;
      this.store.take(1).subscribe((s) => state = s);
      return state;
  }

  subscribe(fn: (state: any) => void): Subscription {
    return this.store.subscribe(() => fn(this.getState()));
  }

  formInit<T>(path: string[], form: NgForm, value: T) {
    this.store.dispatch({
      type: FormActionTypes.FORM_INIT,
      payload: {
        path,
        valid: form.valid === true,
        value
      }
    });
  }

  valueChanged<T>(path: string[], form: NgForm, value: T) {
    this.store.dispatch({
      type: FormActionTypes.FORM_CHANGED,
      payload: {
        path,
        valid: form.valid === true,
        value
      }
    });
  }
}
