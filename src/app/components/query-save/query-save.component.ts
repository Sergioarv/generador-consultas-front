import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Query } from 'src/app/models/query';
import { Comment } from 'src/app/models/comment';
import { QueryService } from 'src/app/services/query.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-query-save',
  templateUrl: './query-save.component.html',
  styleUrls: ['./query-save.component.css']
})
export class QuerySaveComponent implements OnInit {

  // variable que activa la animación de carga
  cargando = false;

  //Variable para determina el cierre del Modal
  closeResult = '';

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
  commentList: Comment[];

  querySelC: Query;

  // Formulario de filtro para BigQuery
  filtrarForm = new FormGroup({
    name: new FormControl('', Validators.pattern(this.regTexto)),
    createby: new FormControl('', Validators.pattern(this.regTexto))
  });

  commentsForm = new FormGroup({
    name: new FormControl(''),
    createby: new FormControl(''),
    commentary: new FormControl('')
  });

  constructor(
    private toastr: ToastrService,
    private queryService: QueryService,
    private route: Router,
    private modalService: NgbModal,
    private config: NgbModalConfig,
    private authService: AuthService
  ) {
    this.queryList = [];
    this.commentList = [];
    this.querySelC = new Query();
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.filter();
  }

  // Método que ejecuta la consulta y solicita a la api Bigquery
  filter() {

    this.cargando = true;

    const name = this.filtrarForm.controls['name'].value;
    const createby = this.filtrarForm.controls['createby'].value;

    this.queryService.filter(name, createby, this.pag, this.sizePag).subscribe(resp => {
      this.queryList = resp.data.content;
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
    this.filter();
  }

  // Método encargado de limpiar formulario de comentarios
  limpiarFormComment() {
    this.commentsForm.reset();
    this.querySelC = new Query();
    this.modalService.dismissAll('Close click');
  }

  // Método encargado de abrir y mostar query cargada en BigQuery
  cargarQuery(querySave: any) {

    const queryLoad = JSON.stringify(querySave);
    console.log('Query a cargar', querySave);
    sessionStorage.setItem('querySave', queryLoad);

    this.route.navigate(['/home']);
  }

  // Método encargado de abrir modal con comentarios de la query seleccionada
  openCargarComentarios(query: any, contentComment?: any) {

    this.cargando = true;

    const querySel = query;
    this.querySelC = query;
    const name = querySel.name;
    const createby = querySel.createby;

    this.commentsForm.get('name')?.setValue(name);
    this.commentsForm.get('createby')?.setValue(createby);
    this.commentsForm.get('name')?.disable();
    this.commentsForm.get('createby')?.disable();

    this.commentList = querySel.comments;

    this.open(contentComment, 'xl');
    this.cargando = false;
  }

  //  Método encargado de agregar un comentario
  agregarComentario() {

    this.cargando = true;

    const newComentario = this.commentsForm.controls['commentary'].value;
    const userregister = this.authService.getUser();

    const newComment = new Comment();
    newComment.commentary = newComentario;
    newComment.userregister = userregister;

    this.querySelC.comments.push(newComment);

    this.queryService.updateQuery(this.querySelC).subscribe(resp => {
      if (resp.success) {
        this.limpiarFormComment();
        this.toastr.success(resp.message, 'Proceso exitoso');
        this.cargando = false;
      } else {
        this.toastr.warning(resp.message, 'Proceso fallido');
        this.cargando = false;
      }
    }, error => {
      this.toastr.error(error.message, 'Proceso fallido');
      this.cargando = false;
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
    this.filter();
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
    this.filter();
  }

  // Método encargado de cambiar el valor de la página actual
  setearPag(pag: number): void {
    this.pag = pag;
    this.filter();
  }

  // Método encargado de cambiar la cantidad de elementos por página
  setearCant(cant: any): void {
    if (this.totalElements > 0) {
      this.sizePag = cant;
      this.pag = 0;
      this.filter();
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
