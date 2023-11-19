import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms'
import { AppRoutingModule } from './components/modules/app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './components/app/app.component';
import { QueryComponent } from './components/query/query.component';

import { NgxLoadingModule } from 'ngx-loading';
import { ToastrModule } from 'ngx-toastr';
import { QuerySaveComponent } from './components/query-save/query-save.component';
import { QuerySaveToTextPipe } from './utils/pipe/query-save-to-text.pipe';

@NgModule({
  declarations: [
    AppComponent,
    QueryComponent,
    QuerySaveComponent,
    QuerySaveToTextPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxLoadingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      maxOpened: 2,
      timeOut: 3000,
      closeButton: true,
      newestOnTop: true,
      countDuplicates:true,
      preventDuplicates: true,
      resetTimeoutOnDuplicate: true
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
