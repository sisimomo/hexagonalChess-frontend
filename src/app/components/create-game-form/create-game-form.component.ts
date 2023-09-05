import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { ToastrService } from 'ngx-toastr';
import { onHttpError } from 'src/app/common/utils/errorUtils';
import { GameCreateDto } from 'src/app/service/game/dto/request/gameCreateDto';
import { RestGameService } from 'src/app/service/game/restGame.service';

// Source: https://material.angular.io/components/form-field/examples#form-field-custom-control

@Component({
  selector: 'app-create-game-form',
  templateUrl: './create-game-form.component.html',
  styleUrls: ['./create-game-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
  ],
})
export class CreateGameFormComponent {
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
      publicGame: new FormControl(true, Validators.required),
      password: new FormControl(null),
    });
    if (!this.authenticated) {
      this.form.disable();
    }
  }

  submit() {
    if (this.form.valid) {
      let publicGame = this.form.get('publicGame')!.value;
      let password = this.form.get('password')!.value;
      password = password !== '' && password !== null ? password : undefined;
      this.restGameService
        .createGame({
          publicGame,
          password: password,
        } as GameCreateDto)
        .subscribe({
          next: (gameDto) => {
            this.router.navigate(['game', gameDto.friendlyId]);
          },
          error: (err) => onHttpError(this.toastr, err, 'An error occurred while creating a game.'),
        });
    }
  }
}
