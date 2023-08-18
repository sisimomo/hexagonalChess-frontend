import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

export interface MenuRendererParams<TData = any> extends ICellRendererParams<TData, any, any> {
  items: MenuRendererParamsItem<TData>[];
  callback: (data: TData, id: string) => void;
}

export interface MenuRendererParamsItem<TData = any> {
  id: string;
  icon: string;
  text: string;
  condition?: (data: TData) => boolean;
}

@Component({
  selector: 'menu-cell',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatMenuModule,
  ],
  templateUrl: './menu-renderer.component.html',
  styleUrls: ['./menu-renderer.component.scss'],
})
export class MenuRendererComponent implements ICellRendererAngularComp {
  params!: MenuRendererParams;

  agInit(params: MenuRendererParams) {
    this.params = params;
  }

  refresh(params: MenuRendererParams) {
    this.params = params;
    return true;
  }
}
