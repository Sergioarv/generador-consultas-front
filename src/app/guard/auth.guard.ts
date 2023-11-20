import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {

  }

  // Realiza el guard para verificar el login y 
  // privatizar las rutas
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isLogged()) {
      return true;
    } else {
      // Si el usuario no está autenticado, redirige a la página de inicio de sesión
      this.router.navigate(['/login']); // Ajusta la ruta según tu configuración de enrutamiento
      return false;
    }
  }

}
