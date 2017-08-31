import {Iterable} from 'immutable';

// import {Action} from 'redux';
import { Action } from '@ngrx/store';

import { FormActionTypes } from './form-store';

import { FormState } from './state';

// Object.create(null) ensures the object has no default js properties (e.g. `__proto__`)
const initialFormState = Object.create(null);

// export const defaultFormReducer = <RootState>(initialState: RootState | Iterable.Keyed<string, any>) => {
export const defaultFormReducer = (state = initialFormState, action: Action & {payload?: any}) => {
  switch (action.type) {
    case FormActionTypes.FORM_INIT:
    case FormActionTypes.FORM_CHANGED:
      return FormState.assign(
        state,
        action.payload.path,
        action.payload.value);
    default:
      return state;
  }
}

  // return reducer;
// };
