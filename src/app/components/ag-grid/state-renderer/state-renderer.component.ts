import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

export interface StateRendererParams<TData = any> extends ICellRendererParams<TData, any, any> {
  items: StateRendererParamsItem<TData>[];
}

export interface StateRendererParamsItem<TData = any> {
  color?: string;
  overwriteTextColor?: string;
  backgroundColor?: string;
  icon?: string;
  text?: string;
  condition?: (data: TData) => boolean;
}

@Component({
  selector: 'state-cell',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './state-renderer.component.html',
  styleUrls: ['./state-renderer.component.scss'],
})
export class StateRendererComponent<TData> implements ICellRendererAngularComp {
  protected params: StateRendererParams;

  protected item: StateRendererParamsItem<TData> | undefined;

  agInit(params: StateRendererParams) {
    this.params = params;
    if (params.items) {
      let item = params.items.find((item) => (item.condition !== undefined ? item.condition(params.data) : false));
      if (item === undefined) {
        item = params.items.find((item) => typeof item.condition === 'undefined');
      }
      this.item = item;
    }
  }

  refresh(params: StateRendererParams) {
    this.agInit(params);
    return true;
  }
}
