import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Query } from 'src/app/models/query';
import { QueryService } from 'src/app/services/query.service';

@Component({
  selector: 'app-query-save',
  templateUrl: './query-save.component.html',
  styleUrls: ['./query-save.component.css']
})
export class QuerySaveComponent implements OnInit {

  // variable que activa la animación de carga
  cargando = false;

  // Expresion regular para letras
  regTexto = '^[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\u00f1\u00d1\u0020-\u003f\u00bf\u00a1]+[a-zA-ZÀ-ÿ]$';

  // Valores predeterminados para pag y sizePag
  pag = 0;
  sizePag = 10;
  // variables para el maneja de paginación
  esPrimero = true;
  esUltimo = true;
  totalPaginas: number[] = [];
  totalElements: number = 0;

  queryList: Query[];

  // Formulario de filtro para BigQuery
  filtrarForm = new FormGroup({
    name: new FormControl('', Validators.pattern(this.regTexto)),
    userregister: new FormControl('', Validators.pattern(this.regTexto))
  });

  constructor(
    private toastr: ToastrService,
    private queryService: QueryService
  ) { 
    this.queryList = [];
  }

  ngOnInit(): void {
    this.cargando = true;
    setTimeout(() => {
      this.cargando = false;
    }, 2000);
  }


  // Método que ejecuta la consulta y solicita a la api Bigquery
  filter() {

    this.cargando = true;

    const name = this.filtrarForm.controls['name'].value;
    const userregister = this.filtrarForm.controls['userregister'].value;

    this.queryService.filter(name, userregister, this.pag, this.sizePag).subscribe(resp => {
      this.queryList = resp.data.content;
      if (resp.success) {

        console.log(this.queryList);

        this.esPrimero = resp.data.first;
        this.esUltimo = resp.data.last;
        this.totalPaginas = new Array(resp.data['totalPages']);
        this.totalElements = resp.data.totalElements;

        this.cargando = false;

        this.toastr.success(resp.message, "Proceso exitoso");
      } else {
        this.cargando = false;
        this.toastr.warning(resp.message, "Proceso fallido");
      }
    }, error => {
      this.cargando = false;
      this.toastr.error(error.message, "Proceso fallido");
    });

  }

  // Método encargado de limpiar el formulario de filtro
  // quitando los filtros buscados anteriormente
  limpiarFormFilter() {
    this.filtrarForm.reset();
    this.filter();
  }

}
