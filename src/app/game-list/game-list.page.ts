import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef, ModuleRegistry } from 'ag-grid-community';
import { KeycloakService } from 'keycloak-angular';
import { ToastrService } from 'ngx-toastr';
import { onError } from '../common/utils/errorUtils';
import { InfiniteScrollTableComponent } from '../components/ag-grid/infinite-scroll-table/infinite-scroll-table.component';
import { MenuRendererComponent, MenuRendererParams } from '../components/ag-grid/menu-renderer/menu-renderer.component';
import {
  StateRendererComponent,
  StateRendererParams,
} from '../components/ag-grid/state-renderer/state-renderer.component';
import { Direction } from '../service/common/dto/enumeration/direction';
import { GameDto } from '../service/game/dto/response/gameDto';
import { RestGameService } from '../service/game/restGame.service';

ModuleRegistry.registerModules([ServerSideRowModelModule]);

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, InfiniteScrollTableComponent],
  templateUrl: './game-list.page.html',
  styleUrls: ['./game-list.page.scss'],
})
export class GameListPage implements OnInit {
  private userUuid: string;
  protected columnDefs: ColDef[] = [
    {
      colId: 'friendlyId',
      field: 'friendlyId',
      headerName: 'Friendly Id',
      flex: 2,
    },
    {
      colId: 'userSide',
      headerName: 'Playing',
      cellRenderer: StateRendererComponent,
      cellRendererParams: <StateRendererParams<GameDto>>{
        items: [
          {
            color: 'var(--white-piece-inner)',
            backgroundColor: 'var(--white-piece-stroke)',
            icon: 'church',
            text: 'White',
            condition: (data) => (data !== undefined ? data.whiteUserUuid === this.userUuid : undefined),
          },
          {
            color: 'var(--black-piece-inner)',
            overwriteTextColor: 'var(--white-piece-inner)',
            backgroundColor: 'var(--black-piece-stroke)',
            icon: 'church',
            text: 'Black',
            condition: (data) => (data !== undefined ? data.blackUserUuid === this.userUuid : undefined),
          },
        ],
      },
      flex: 1,
    },
    {
      colId: 'publicGame',
      headerName: 'Public',
      cellRenderer: StateRendererComponent,
      cellRendererParams: <StateRendererParams<GameDto>>{
        items: [
          {
            color: '#98ff75',
            icon: 'public',
            text: 'Public',
            condition: (data) => data?.publicGame,
          },
          {
            color: '#ff8080',
            icon: 'public_off',
            text: 'Not Public',
            condition: (data) => !data?.publicGame,
          },
        ],
      },
      flex: 1,
    },
    {
      colId: 'buttonCol',
      suppressMovable: true,
      lockPosition: 'right',
      headerName: '',
      cellRenderer: MenuRendererComponent,
      cellRendererParams: <MenuRendererParams<GameDto>>{
        items: [
          {
            id: 'open',
            icon: 'login',
            text: 'Open',
            condition: (data) =>
              data !== undefined && (data.whiteUserUuid === undefined || data.blackUserUuid === undefined),
          },
          {
            id: 'delete',
            icon: 'delete_forever',
            text: 'Delete',
            condition: (data) =>
              data !== undefined && (data.whiteUserUuid === undefined || data.blackUserUuid === undefined),
          },
        ],
        callback: this.onMenuItemsClicked.bind(this),
      },
      maxWidth: 17 * 2 + 48,
    },
  ];
  @ViewChild('allLoggedInUserGames') public allLoggedInUserGamesTable: InfiniteScrollTableComponent<GameDto>;

  constructor(
    private keycloak: KeycloakService,
    private toastr: ToastrService,
    private router: Router,
    private restGameService: RestGameService
  ) {}

  async ngOnInit() {
    this.userUuid = (await this.keycloak.loadUserProfile()).id!;
  }

  onMenuItemsClicked(data: GameDto, buttonId: string) {
    if (buttonId === 'open') {
      this.router.navigate(['game', data.friendlyId]);
    }
    if (buttonId === 'delete') {
      this.restGameService.deleteGame(data.friendlyId).subscribe({
        next: () => {
          this.allLoggedInUserGamesTable.refreshAllRows();
        },
        error: (err) => onError(this.toastr, err, 'An error occurred while loading the game list.'),
      });
    }
  }

  getData(direction: Direction, maxResults: number, cursor?: string) {
    return this.restGameService.getAllLoggedInUserGames(maxResults, direction, cursor);
  }
}
