import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SchedulesDTO } from 'src/app/models/schedules-dto';
import { BigQueryService } from 'src/app/services/big-query.service';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit {

  // Expresion regular para números
  regNumero = '[0-9]+'
  // Expresion regular para duracion en minutos segundos (mm:ss)
  regDuracion = '^([1-9]|[1-5][0-9]):[0-5][0-9]$'
  //Expresion regular para años entre 1900 y 2023
  regAnio = '^(1900|19[1-9][0-9]|20[0-1][0-9]|202[0-2]|2023)$'

  // Valores predeterminados para pag y sizePag
  pag = 0;
  sizePag = 10;
  // variables para el maneja de paginación
  esPrimero = true;
  esUltimo = true;
  totalPaginas: number[] = [];
  totalElements: number = 0;

  // variable que activa la animación de carga
  cargando = false;

  // Lista de los datos retornados por la api BigQuery de Google
  schedulesList: SchedulesDTO[];

  // Formulario de filtro para BigQuery
  filtrarForm = new FormGroup({
    gameNumber: new FormControl('', Validators.pattern(this.regNumero)),
    dayNight: new FormControl(''),
    duration: new FormControl('', Validators.pattern(this.regDuracion)),
    status: new FormControl(''),
    year: new FormControl('', Validators.pattern(this.regAnio)),
    conditiaonal: new FormControl('')
  });

  constructor(
    private bigQueryService: BigQueryService,
    private toastr: ToastrService
  ) {
    this.schedulesList = [];
  }

  ngOnInit(): void {
    this.cargando = true;
    setTimeout(() => {
      this.cargando = false;
    }, 2000);
  }

  // Método que ejecuta la consulta y solicita a la api Bigquery
  ejecutarConsultar() {

    this.cargando = true;

    const gameNumber = this.filtrarForm.controls['gameNumber'].value;
    const dayNight = this.filtrarForm.controls['dayNight'].value;
    const duration = this.filtrarForm.controls['duration'].value;
    const status = this.filtrarForm.controls['status'].value;
    const year = this.filtrarForm.controls['year'].value;
    const conditiaonal = this.filtrarForm.controls['conditiaonal'].value;

    this.bigQueryService.runQuery(gameNumber, dayNight, duration, status, year, conditiaonal, this.pag, this.sizePag).subscribe(resp => {
      this.schedulesList = resp.data.content;
      if (resp.success) {
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
    this.filtrarForm.get('dayNight')?.setValue('');
    this.filtrarForm.get('status')?.setValue('');
    this.filtrarForm.get('conditiaonal')?.setValue('');

    this.ejecutarConsultar();
  }

  // Método encargado de cargar una página anterior y verifica si es la primer página
  rebobinar(primero?: any) {
    if (primero) {
      this.pag = 0;
    } else {
      if (!this.esPrimero) {
        this.pag--;
      }
    }
    this.ejecutarConsultar();
  }

  // Método encargado de cargar una página seguiente y verifica si es la última página
  avanzar(ultimo?: any) {
    if (ultimo) {
      this.pag = this.totalPaginas.length - 1;
    } else {
      if (!this.esUltimo) {
        this.pag++;

      }
    }
    this.ejecutarConsultar();
  }

  // Método encargado de cambiar el valor de la página actual
  setearPag(pag: number): void {
    this.pag = pag;
    this.ejecutarConsultar();
  }

  // Método encargado de cambiar la cantidad de elementos por página
  setearCant(cant: any): void {
    if (this.totalElements > 0) {
      this.sizePag = cant;
      this.pag = 0;
      this.ejecutarConsultar();
    }
  }

  // Método encargado de mostrar solo 5 paginaciones siguientes o anteriores en caso de existir muchas
  mostrarPaginas(i: any): boolean {
    const pagesToShow = 5;
    const start = Math.max(0, this.pag - Math.floor(pagesToShow / 2));
    const end = Math.min(this.totalPaginas.length, start + pagesToShow - 1);

    if (i >= start && i <= end) {
      return true;
    }

    return false;
  }

}
