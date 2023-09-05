import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, IGetRowsParams, ModuleRegistry, RowModelType } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { onHttpError } from 'src/app/common/utils/errorUtils';
import { Direction } from 'src/app/service/common/dto/enumeration/direction';
import { WindowDto } from 'src/app/service/common/dto/windowDto';

ModuleRegistry.registerModules([ServerSideRowModelModule]);

@Component({
  selector: 'app-infinite-scroll-table',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './infinite-scroll-table.component.html',
  styleUrls: ['./infinite-scroll-table.component.scss'],
})
export class InfiniteScrollTableComponent<TData> {
  @Input() public getData: (direction: Direction, maxResults: number, cursor?: string) => Observable<WindowDto<TData>>;
  @Input() public columnDefs: ColDef[];
  private api: GridApi<TData>;

  protected defaultColDef: ColDef = {
    sortable: false,
    flex: 1,
    minWidth: 100,
  };
  protected rowModelType: RowModelType = 'infinite';
  protected cacheBlockSize = 10;
  protected maxConcurrentDatasourceRequests = 1;

  private requestHistory: { params: IGetRowsParams; cursor?: string }[] = [];

  private window: WindowDto<TData> | undefined;
  protected rowData: TData[];

  constructor(private toastr: ToastrService) {}

  onGridReady(params: GridReadyEvent<TData>) {
    this.api = params.api!;
    this.api.setDatasource({
      getRows: this.getRows.bind(this),
    });
  }

  public refreshAllRows() {
    this.api.purgeInfiniteCache();
  }

  private getRows(params: IGetRowsParams) {
    const samePreviousRequest = this.requestHistory.find(
      (previousRequest) =>
        previousRequest.params.endRow === params.endRow && previousRequest.params.startRow === params.startRow
    );
    const maxResults = params.endRow - params.startRow;
    this.getData(
      Direction.FORWARD,
      maxResults,
      samePreviousRequest !== undefined ? samePreviousRequest.cursor : this.window?.endCursor
    ).subscribe({
      next: (window) => {
        if (samePreviousRequest === undefined) {
          this.requestHistory.push({ params, cursor: this.window?.endCursor });
        }
        this.window = window;
        params.successCallback(
          window.content,
          !window.hasNextPage ? params.endRow - (maxResults - window.content.length) : undefined
        );
      },
      error: (err) => {
        params.failCallback();
        onHttpError(this.toastr, err, 'An error occurred while loading games.');
      },
    });
  }
}
