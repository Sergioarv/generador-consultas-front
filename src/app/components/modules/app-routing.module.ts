import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QueryComponent } from '../query/query.component';
import { QuerySaveComponent } from '../query-save/query-save.component';

const routes: Routes = [
  { path: 'querys', component: QuerySaveComponent },
  { path: 'home', component: QueryComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
