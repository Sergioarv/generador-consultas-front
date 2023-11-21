import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Query } from 'src/app/models/query';
import { QuerySave } from 'src/app/models/query-save';
import { Comment } from 'src/app/models/comment';
import { SchedulesDTO } from 'src/app/models/schedules-dto';
import { BigQueryService } from 'src/app/services/big-query.service';
import { QueryService } from 'src/app/services/query.service';
import { ModalDismissReasons, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';
import { DatosFrecuency } from 'src/app/models/datos-frecuency';

declare const google: any;

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit {

  //Variable para determina el cierre del Modal
  closeResult = '';

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

  statusGameList: DatosFrecuency[];
  dayNightGames: DatosFrecuency[];
  durationFrequencyList: DatosFrecuency[];

  // Formulario de filtro para BigQuery
  filtrarForm = new FormGroup({
    gameNumber: new FormControl('', Validators.pattern(this.regNumero)),
    dayNight: new FormControl(''),
    duration: new FormControl('', Validators.pattern(this.regDuracion)),
    status: new FormControl(''),
    year: new FormControl('', Validators.pattern(this.regAnio)),
    conditiaonal: new FormControl('')
  });

  queryForm = new FormGroup({
    name: new FormControl(''),
    commentary: new FormControl('')
  });

  constructor(
    private bigQueryService: BigQueryService,
    private queryService: QueryService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private config: NgbModalConfig,
    private authService: AuthService
  ) {
    this.schedulesList = [];
    this.statusGameList = [];
    this.dayNightGames = [];
    this.durationFrequencyList = [];
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.verificarQueryLoad();
  }

  //  Método encargado de verifica storage en busca de una query a precargar en el formulario
  verificarQueryLoad() {
    this.cargando = true;
    setTimeout(() => {
      const queryLoad = sessionStorage.getItem('querySave');

      if (queryLoad != null) {
        const query = JSON.parse(queryLoad);

        this.filtrarForm.get('gameNumber')?.setValue(query.gamenumber ? query.gamenumber : '');
        this.filtrarForm.get('dayNight')?.setValue(query.daynight ? query.daynight : '');
        this.filtrarForm.get('duration')?.setValue(query.duration ? query.duration : '');
        this.filtrarForm.get('status')?.setValue(query.status ? query.status : '');
        this.filtrarForm.get('year')?.setValue(query.year ? query.year : '');

        sessionStorage.removeItem('querySave');
      }
      this.getDatosGraficas();
    }, 1000);
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

  // Método encargado de limpiar el formulario de guardar query
  limpiarFormQuery() {
    this.modalService.dismissAll('Close click');
    this.queryForm.reset();
  }

  // Método encargado de abrir el modal de guardar query
  openGuardarQuery(contentSave?: any) {
    const gameNumber = this.filtrarForm.controls['gameNumber'].value;
    const dayNight = this.filtrarForm.controls['dayNight'].value;
    const duration = this.filtrarForm.controls['duration'].value;
    const status = this.filtrarForm.controls['status'].value;
    const year = this.filtrarForm.controls['year'].value;

    if ((gameNumber !== null && gameNumber !== '') || (dayNight !== null && dayNight !== '')
      || (duration !== null && duration !== '') || (status !== null && status !== '')
      || (year !== null && year !== '')
    ) {
      this.open(contentSave, '');
    } else {
      this.cargando = false;
      this.toastr.warning("Por favor selecciona un campo de busqueda a guardar", "Proceso fallido");
    }
  }

  // Métdodo encargado de guardar la query
  guardarQuery() {
    this.cargando = true;

    const gameNumber = this.filtrarForm.controls['gameNumber'].value;
    const dayNight = this.filtrarForm.controls['dayNight'].value;
    const duration = this.filtrarForm.controls['duration'].value;
    const status = this.filtrarForm.controls['status'].value;
    const year = this.filtrarForm.controls['year'].value;

    const name = this.queryForm.controls['name'].value;
    const commentary = this.queryForm.controls['commentary'].value;

    if ((gameNumber !== null && gameNumber !== '') || (dayNight !== null && dayNight !== '')
      || (duration !== null && duration !== '') || (status !== null && status !== '')
      || (year !== null && year !== '')
    ) {

      const querySave = new QuerySave();
      const comment = new Comment();
      const query = new Query();

      querySave.gamenumber = gameNumber;
      querySave.daynight = dayNight;
      querySave.duration = duration;
      querySave.status = status;
      querySave.year = year;

      query.name = name;
      query.createby = this.authService.getUser();

      if (commentary) {
        comment.commentary = commentary;
        comment.userregister = this.authService.getUser();
        query.comments.push(comment);
      }

      query.querysave = querySave;
      this.queryService.saveQuery(query).subscribe(resp => {
        if (resp.success) {
          this.modalService.dismissAll('Save click');
          this.toastr.success(resp.message, "Proceso exitoso");
          this.cargando = false;
          this.limpiarFormQuery();
        } else {
          this.cargando = false;
          this.toastr.error(resp.message, "Proceso fallido");
        }
      }, error => {
        this.cargando = false;
        this.toastr.error(error.message, "Proceso fallido");
      });
    } else {
      this.cargando = false;
      this.toastr.warning("Por favor selecciona un campo de busqueda a guardar", "Proceso fallido");
    }
  }

  getDatosGraficas() {

    this.bigQueryService.graficas().subscribe(resp => {

      this.statusGameList = resp.data.statusGameList;
      this.dayNightGames = resp.data.dayNightGames;
      this.durationFrequencyList = resp.data.durationFrequencyList;

      if (resp.success) {
        this.drawChartUno();
        this.drawChartDos();
        this.drawChartTres();
        this.cargando = false;
      }
    }, error => {
      this.toastr.error(error.message, "Proceso fallido");
      this.cargando = false;
    });
  }
  
  // Métodos encargados de graficar
  drawChartUno() {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(() => {
      var data = new google.visualization.DataTable();

      data.addColumn('string', 'Estado de partido');
      data.addColumn('number', 'Cantidad de partidos');

      this.dayNightGames.forEach(element => {
        const verificarDato = element.frecuency >= 100 ? true : false;
        const optimizarDato = verificarDato ? element.frecuency/100 : element.frecuency;
        const repararLabel = verificarDato ? element.value.concat('(Dato dividido en 100 para visualización)') : element.value;
        data.addRows([
          [repararLabel, optimizarDato],
        ]);
      });

      var options = {
        title: 'Proporción de Juegos Diurnos/Nocturnos',
        hAxis: { title: 'Diurnos' },
        vAxis: { title: 'Nocturnos' },
        legend: 'none',
        is3D: true,
        slices: {
          0: { color: '#109618' },
          1: { color: '#FF9900' },
          2: { color: '#CCCCCC'}
        }
      };

      var chart = new google.visualization.PieChart(document.getElementById('chartUno_div'));
      chart.draw(data, options);
    });
  }
  
  drawChartDos() {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(() => {
      var data = new google.visualization.DataTable();

      data.addColumn('string', 'Ciclo');
      data.addColumn('number', 'Cantidad de partidos');

      this.statusGameList.forEach(element => {
        const verificarDato = element.frecuency >= 100 ? true : false;
        const optimizarDato = verificarDato ? element.frecuency/1000 : element.frecuency;
        const repararLabel = verificarDato ? element.value.concat('(Dato dividido en 1000 para visualización)') : element.value;
        data.addRows([
          [repararLabel, optimizarDato],
        ]);
      });

      var options = {
        title: 'Estado de los partidos',
        hAxis: { title: 'Estados' },
        vAxis: { title: 'Número de partidos' },
        legend: 'none',
        pieSliceText: 'label'
      };

      var chart = new google.visualization.ColumnChart(document.getElementById('chartDos_div'));
      chart.draw(data, options);
    });
  }

  drawChartTres() {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(() => {
      var data = new google.visualization.DataTable();

      data.addColumn('string', 'Duración');
      data.addColumn('number', 'Frecuencia');

      this.durationFrequencyList.forEach(element => {
        const verificarDato = element.frecuency >= 100 ? true : false;
        const optimizarDato = verificarDato ? element.frecuency/1000 : element.frecuency;
        const repararLabel = verificarDato ? element.value.concat('(Dato dividido en 1000 para visualización)') : element.value;
        data.addRows([
          [repararLabel, optimizarDato],
        ]);
      });

      var options = {
        title: 'Grafica duracion frecuencia',
        hAxis: { title: 'Duración' },
        vAxis: { title: 'Frecuencia' },
        legend: 'none'
      };

      var chart = new google.visualization.ScatterChart(document.getElementById('chartTres_div'));
      chart.draw(data, options);
    });
  }


  /** Funciones para abrir y cerrar modal ng **/
  open(content: any, tamaño: any) {

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: tamaño, backdropClass: 'light-blue-backdrop', centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
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
