/*import {
  Action,
  Store,
} from '@ngrx/store';
import { AbstractStore, FormStore } from './store/form-store';

/// Use this function in your providers list if you are not using @angular-redux/core.
/// This will allow you to provide a preexisting store that you have already
/// configured, rather than letting @angular-redux/core create one for you.
/*

export const provideForms = <T>() => {
  const store: Store<any> = new Store(undefined, undefined, undefined);
  const abstractStore = wrap(store);

  return [
    {provide: FormStore, useValue: new FormStore(abstractStore as any)}
  ];
};

const wrap = <T>(store: Store<T> | any): AbstractStore<T> => {
  const dispatch = (action: Action) => store.dispatch(action);

  const getState = () => store.getState() as T;

  const subscribe =
    (fn: (state: T) => void) => store.subscribe(() => fn(store.getState()));

  return {dispatch, getState, subscribe};
};

// Object.create(null) ensures the object has no default js properties (e.g. `__proto__`)
const initialFormState = Object.create(null);

export function FormFactory() {
  const abstractStore = wrap(new Store(undefined, undefined, initialFormState));
  return  new FormStore(abstractStore as any);
}

export const dynamicFormStore = [
  {provide: FormStore, useFactory: FormFactory}
];
*/
