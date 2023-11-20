import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  cargando = false;

  // Formulario para el login y verificar el usuario
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required)
  });


  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  // verifica si esta logiado y asi no solicitar un login nuevamente
  ngOnInit(): void {
    if (this.authService.isLogged()) {
      this.router.navigate(['']);
    }
  }

  login() {

    // guarda al usuario logueado
    this.cargando = true;

    const user = this.loginForm.controls['username'].value;
    this.authService.setKey(user);
    this.router.navigate(['home']);
    this.cargando = false;
  }

}
