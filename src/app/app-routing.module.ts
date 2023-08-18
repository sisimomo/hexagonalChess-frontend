import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'create_join_game',
    loadComponent: () => import('./create-join-game/create-join-game.page').then((m) => m.CreateJoinGamePage),
  },
  {
    path: 'game_rules',
    loadComponent: () => import('./game-rules/game-rules.page').then((m) => m.GameRulesPage),
  },
  {
    path: 'game/:gameFriendlyId',
    pathMatch: 'full',
    loadComponent: () => import('./game/game.page').then((m) => m.GamePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'game_list',
    loadComponent: () => import('./game-list/game-list.page').then((m) => m.GameListPage),
    canActivate: [AuthGuard],
  },
  {
    path: '404',
    loadComponent: () => import('./page-not-found/page-not-found.page').then((m) => m.PageNotFoundPage),
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'assets/silent-check-sso.html', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
