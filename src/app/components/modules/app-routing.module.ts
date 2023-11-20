import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QueryComponent } from '../query/query.component';
import { QuerySaveComponent } from '../query-save/query-save.component';
import { LoginComponent } from '../login/login.component';
import { AuthGuard } from 'src/app/guard/auth.guard';

const routes: Routes = [
  { path: 'querys', component: QuerySaveComponent, canActivate: [AuthGuard] },
  { path: 'home', component: QueryComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
