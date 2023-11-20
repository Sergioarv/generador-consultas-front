import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const KEY = 'Auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router
  ) { }

  // Setea el usuario como llave
  setKey(key: string): void {
    sessionStorage.removeItem(KEY);
    sessionStorage.setItem(KEY, key);
  }

  // obtiene el usuario como llave
  getKey(): any {
    return sessionStorage.getItem(KEY);
  }

  // verifique si existe un usuario guardado o logueado
  isLogged(): boolean {
    if (this.getKey()) {
      return true;
    }
    return false;
  }

  // Se obtiene el nombre de Susuario
  getUser(): any {
    if (this.isLogged()) {
      return this.getKey()
    }
    return '';
  }

  // quitr el usuario
  logOut(): void {
    sessionStorage.removeItem(KEY);
    this.router.navigate(['/login'])
  }
}
