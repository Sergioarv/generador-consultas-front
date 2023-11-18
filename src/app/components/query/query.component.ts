import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
    private bigQueryService: BigQueryService
  ) { 
    this.schedulesList = [];
  }

  ngOnInit(): void {
  }

  // Método que ejecuta la consulta y solicita a la pai Bigquery
  ejecutarConsultar() {

    this.bigQueryService.runQuery(null, null, null, null, null, null, this.pag, this.sizePag).subscribe(resp => {
      this.schedulesList = resp.data.content;
      
    });

  }

}
