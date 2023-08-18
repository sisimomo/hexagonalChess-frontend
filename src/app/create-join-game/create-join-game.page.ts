import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { CreateGameFormComponent } from '../components/create-game-form/create-game-form.component';
import { JoinGameFormComponent } from '../components/join-game-form/join-game-form.component';
import { RestGameService } from '../service/game/restGame.service';

@Component({
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    NgIf,
    MatButtonModule,
    MatIconModule,
    JoinGameFormComponent,
    CreateGameFormComponent,
  ],
  selector: 'app-create-join-game',
  templateUrl: './create-join-game.page.html',
  styleUrls: ['./create-join-game.page.scss'],
})
export class CreateJoinGamePage implements OnInit {
  protected authenticated: boolean;

  constructor(private keycloak: KeycloakService, private gameService: RestGameService, private router: Router) {}

  async ngOnInit() {
    this.authenticated = await this.keycloak.isLoggedIn();
  }
}
