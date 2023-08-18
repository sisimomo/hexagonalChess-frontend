import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-header-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    MatButtonModule,
    MatSidenavModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
    MatTooltipModule,
    FooterComponent,
  ],
  templateUrl: './header-navbar.component.html',
  styleUrls: ['./header-navbar.component.scss'],
})
export class HeaderNavbarComponent implements OnInit {
  @ViewChild('sidenav') sidenav: MatSidenav;
  protected isExpanded: boolean;

  constructor(private keycloak: KeycloakService, protected router: Router) {}

  protected authenticated: boolean;
  protected username: string;

  async ngOnInit() {
    this.isExpanded = localStorage.getItem('sidenavIsExpanded') === 'true';
    this.authenticated = await this.keycloak.isLoggedIn();
    if (this.authenticated) {
      await this.keycloak.loadUserProfile();
      this.username = this.keycloak.getUsername();
    }
  }

  protected getCurrentPath(): string {
    return window.location.pathname;
  }

  toggleNavbar() {
    this.isExpanded = !this.isExpanded;
    localStorage.setItem('sidenavIsExpanded', String(this.isExpanded));
    this.sidenav.toggle();
  }

  onClickAccount() {
    window.open(
      environment.identityProvider.baseURL + '/realms/' + environment.identityProvider.realm + '/account',
      '_blank'
    );
  }

  async onClickSignIn() {
    await this.keycloak.login({
      redirectUri: window.location.href,
    });
  }

  onClickLogout() {
    this.keycloak.logout();
  }
}
