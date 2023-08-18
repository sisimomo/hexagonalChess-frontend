import { FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, ElementRef, Inject, Input, OnDestroy, Optional, Self, ViewChild } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_FORM_FIELD, MatFormField, MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';

/** Data structure for holding the game friendlyId. */
export class GameFriendlyId {
  constructor(public first3: string, public last3: string) {}

  public toString(): string | undefined {
    if (this.first3 && this.last3) {
      return (this.first3 + '-' + this.last3).toUpperCase();
    }
    return undefined;
  }
}

@Component({
  selector: 'app-game-friendly-id-input',
  templateUrl: './game-friendly-id-input.component.html',
  styleUrls: ['./game-friendly-id-input.component.scss'],
  providers: [{ provide: MatFormFieldControl, useExisting: GameFriendlyIdInputComponent }],
  host: {
    '[class.floating]': 'shouldLabelFloat',
    '[id]': 'id',
  },
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
})
export class GameFriendlyIdInputComponent
  implements ControlValueAccessor, MatFormFieldControl<GameFriendlyId>, OnDestroy
{
  static nextId = 0;
  @ViewChild('first3') first3Input: HTMLInputElement;
  @ViewChild('last3') last3Input: HTMLInputElement;

  parts: FormGroup<{
    first3: FormControl<string | null>;
    last3: FormControl<string | null>;
  }>;
  stateChanges = new Subject<void>();
  focused = false;
  touched = false;
  controlType = 'app-game-friendly-id-input';
  id = `app-game-friendly-id-input-${GameFriendlyIdInputComponent.nextId++}`;
  onChange = (_: any) => {};
  onTouched = () => {};

  get empty() {
    const {
      value: { first3, last3 },
    } = this.parts;

    return !first3 && !last3;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input('aria-describedby') userAriaDescribedBy: string;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder: string;

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.parts.disable() : this.parts.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get value(): GameFriendlyId | null {
    if (this.parts.valid) {
      const {
        value: { first3, last3 },
      } = this.parts;
      return new GameFriendlyId(first3!, last3!);
    }
    return null;
  }
  set value(tel: GameFriendlyId | null) {
    const { first3, last3 } = tel || new GameFriendlyId('', '');
    this.parts.setValue({ first3, last3 });
    this.stateChanges.next();
  }

  get errorState(): boolean {
    return this.parts.invalid && this.touched;
  }

  constructor(
    formBuilder: FormBuilder,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    this.parts = formBuilder.group({
      first3: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(3), Validators.pattern('^[a-zA-Z0-9]{3}$')],
      ],
      last3: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(3), Validators.pattern('^[a-zA-Z0-9]{3}$')],
      ],
    });
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  onFocusOut(event: FocusEvent) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched = true;
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  autoFocusNext(control: AbstractControl, nextElement?: HTMLInputElement): void {
    if (!control.errors) {
      this.focusElement(nextElement);
    }
  }

  focusElement(element?: HTMLInputElement): void {
    if (element) {
      this._focusMonitor.focusVia(element, 'program');
      this.moveCursorToTheEnd(element);
    }
  }

  autoFocusPrev(control: AbstractControl, prevElement: HTMLInputElement): void {
    if (control.value.length < 1) {
      this._focusMonitor.focusVia(prevElement, 'program');
      this.moveCursorToTheEnd(prevElement);
    }
  }

  moveCursorToTheEnd(input: HTMLInputElement): void {
    const temp = input.value;
    input.value = '';
    input.value = temp;
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement.querySelector('.input-container')!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick() {
    if (this.parts.controls.first3.valid) {
      this._focusMonitor.focusVia(this.last3Input, 'program');
    } else if (this.parts.controls.last3.valid) {
      this._focusMonitor.focusVia(this.last3Input, 'program');
    } else {
      this._focusMonitor.focusVia(this.first3Input, 'program');
    }
  }

  writeValue(tel: GameFriendlyId | null): void {
    this.value = tel;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _handlePaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData!;
    let pastedText = clipboardData.getData('text').trim();
    if (pastedText.length <= 7) {
      event.preventDefault();
      this.value = new GameFriendlyId(pastedText.substring(0, 3), pastedText.substring(4, 7));
      this.focusElement(this.last3Input);
      this.onChange(this.value);
    }
  }

  _handleInput(control: AbstractControl, nextElement?: HTMLInputElement): void {
    this.autoFocusNext(control, nextElement);
    this.onChange(this.value);
  }
}
