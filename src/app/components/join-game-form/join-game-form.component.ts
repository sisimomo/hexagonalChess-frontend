import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GameFriendlyIdInputComponent } from '../game-friendly-id-input/game-friendly-id-input.component';

import { NgIf } from '@angular/common';
import { forwardRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { ToastrService } from 'ngx-toastr';
import { onError } from 'src/app/common/utils/errorUtils';
import { GameJoinUpdateDto } from 'src/app/service/game/dto/request/gameJoinUpdateDto';
import { RestGameService } from 'src/app/service/game/restGame.service';

// Source: https://material.angular.io/components/form-field/examples#form-field-custom-control

@Component({
  selector: 'app-join-game-form',
  templateUrl: './join-game-form.component.html',
  styleUrls: ['./join-game-form.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    forwardRef(() => GameFriendlyIdInputComponent),
    MatIconModule,
    NgIf,
  ],
})
export class JoinGameFormComponent {
  protected form: FormGroup;
  protected authenticated: boolean;
  passwordHidden = true;

  get passwordInput() {
    return this.form.get('password');
  }

  constructor(
    private toastr: ToastrService,
    private keycloak: KeycloakService,
    private restGameService: RestGameService,
    private router: Router
  ) {
    this.init();
  }

  async init() {
    this.authenticated = await this.keycloak.isLoggedIn();
    this.form = new FormGroup({
      gameFriendlyId: new FormControl(null, Validators.required),
      password: new FormControl(null),
    });
    if (!this.authenticated) {
      this.form.disable();
    }
  }

  submit() {
    if (this.form.valid) {
      const gameFriendlyId = this.form.get('gameFriendlyId')!.value.toString();
      let password = this.form.get('password')!.value;
      password = password !== '' && password !== null ? password : undefined;
      this.restGameService.joinGame(gameFriendlyId, new GameJoinUpdateDto(password)).subscribe({
        next: (gameDto) => {
          // TODO: pass gameDto to game page
          this.router.navigate(['game', gameFriendlyId]);
        },
        error: (err) => onError(this.toastr, err, 'An error occurred while joining a game.'),
      });
    }
  }
}
