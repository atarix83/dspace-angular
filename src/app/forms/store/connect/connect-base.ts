import { Input } from '@angular/core';

import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormArray,
  NgControl,
} from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

// import { Unsubscribe } from 'redux';

import 'rxjs/add/operator/debounceTime';

import { FormStore } from '../form-store';
import { FormState } from '../state';

export interface ControlPair {
  path: string[];
  control: AbstractControl;
}

export class ConnectBase {

  @Input('connect') connect: () => (string | number) | Array<string | number>;
  private stateSubscription: Subscription;

  private formSubscription: Subscription;
  protected store: FormStore;
  protected form: any;

  public get path(): string[] {
    const path = typeof this.connect === 'function'
      ? this.connect()
      : this.connect;

    switch (typeof path) {
      case 'object':
        if (FormState.empty(path)) {
          return [];
        }
        if (Array.isArray(path)) {
          return path as string[];
        }
        break;
      case 'string':
        return (path as string).split(/\./g);
      default: // fallthrough above (no break)
        throw new Error(`Cannot determine path to object: ${JSON.stringify(path)}`);
    }
  }

  ngOnDestroy() {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }

    if (this.stateSubscription) {
          this.stateSubscription.unsubscribe();
      }
    /*if (typeof this.stateSubscription === 'function') {
      this.stateSubscription(); // unsubscribe
    }*/
  }

  ngAfterContentInit() {
    Promise.resolve().then(() => {
      this.resetState();
      this.store.formInit(this.path, this.form, this.form.value);
      this.stateSubscription = this.store.subscribe(() => this.resetState());

      Promise.resolve().then(() => {
        this.formSubscription = (this.form.valueChanges as any)
          .debounceTime(0)
          .subscribe((values: any) => this.publish(values));
      });
    });
  }

  private descendants(path: string[], formElement: any): ControlPair[] {
    const pairs: ControlPair[] = [];

    if (formElement instanceof FormArray) {
      formElement.controls.forEach((c, index) => {
        for (const d of this.descendants((path as any).concat([index]), c)) {
          pairs.push(d);
        }
      })
    } else if (formElement instanceof FormGroup) {
      for (const k of Object.keys(formElement.controls)) {
        pairs.push({ path: path.concat([k]), control: formElement.controls[k] });
      }
    } else if (formElement instanceof NgControl || formElement instanceof FormControl) {
      return [{ path: path, control: formElement as any }];
    } else {
      throw new Error(`Unknown type of form element: ${formElement.constructor.name}`);
    }

    return pairs.filter((p) => (p.control as any)._parent === this.form.control);
  }

  private resetState() {
    let formElement;
    if (this.form.control === undefined) {
      formElement = this.form;
    } else {
      formElement = this.form.control;
    }

    const children = this.descendants([], formElement);

    children.forEach((c) => {
      const { path, control } = c;

      const value = FormState.get(this.getState(), this.path.concat(c.path));

      if (control.value !== value) {
        const phonyControl = { path: path } as any;

        this.form.updateModel(phonyControl, value);
      }
    });
  }

  private publish(value: any) {
    this.store.valueChanged(this.path, this.form, value);
  }

  private getState() {
    return this.store.getState();
  }
}
