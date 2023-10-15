import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-nomina',
  templateUrl: './nomina.component.html',
  styleUrls: ['./nomina.component.css']
})
export class NominaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  nominaDataSource: MatTableDataSource<any>;
  empleados: { [id: number]: string } = {};
  nominas: any[] = [];

  router = new Router();

  columns = ['id', 'nombre', 'apellido', 'fechaInicio', 'fechaFin', 'dias', 'horas', 'bonificacion', 'igss', 'irtra', 'total', 'actions'];

  constructor(private http: HttpClient){
    this.nominaDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarNomina();
       this.cargarEmpleados();
    } else {
      this.router.navigate(['login']);
  }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.nominaDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarNomina(){
    const urlEstados = 'http://localhost:9200/nomina';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.nominas = response;
        this.nominaDataSource.data = this.nominas;
        this.nominaDataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error al cargar la nomina', error);
      }
    );
  }

  cargarEmpleados(){
    const urlempleados = 'http://localhost:9200/empleado';

    this.http.get<any[]>(urlempleados).subscribe(
      (response) => {
        const empleadosMap: Record<number, string> = {};

        response.forEach(empleado => {
          empleadosMap[empleado.id_empleado] = `${empleado.nombre} ${empleado.apellido} salario: ${empleado.puesto.salario_mensual}`;
        });
        this.empleados = empleadosMap;
      },
      (error) => {
        console.error('Error al cargar empleados', error);
      }
    );
  }


  getempleadosOptions() {
    this.cargarEmpleados();
    return Object.keys(this.empleados).map(id => {
      const numericId = parseInt(id);
      return `<option value="${numericId}">${this.empleados[numericId]}</option>`;
    }).join('');
  }

  openRegisterDialog(){
    Swal.fire({
      title: 'Registrar nueva Nomina',
      html: `
          <label for="empleados">Seleccione un empleado:</label>
          <select id="empleado" class="swal2-select custom-input">
            ${this.getempleadosOptions()}
          </select><br><br>
          <label for="fechas">Fecha de inicio:</label><br>
          <input type="date" id="fechaInicio" #startInput class="swal2-input custom-input"/><br><br>
          <label for="fechas">Fecha fin:</label><br>
          <input type="date" id="fechaFin" #startInput class="swal2-input custom-input"/><br><br>
          <label for="horaExtra">Horas extras:</label><br>
          <input type="number" id="horaExtra" class="swal2-input" placeholder="Horas" required><br>
          <label for="horaExtra">Bonificaciones:</label><br>
          <input type="number" id="bonificacion" class="swal2-input" value="250" required><br>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      customClass: 'custom-input',
      preConfirm: async () => {
        const empleado = (document.getElementById('empleado') as HTMLInputElement).value;
        const fechaInicio = (document.getElementById('fechaInicio') as HTMLInputElement).value;
        const fechaInicioConHora = new Date(fechaInicio + 'T00:00:00');
        const fechaFin = (document.getElementById('fechaFin') as HTMLInputElement).value;
        const fechaFinConHora = new Date(fechaFin + 'T00:00:00');
        const horaExtra = (document.getElementById('horaExtra') as HTMLInputElement).value;
        const bonificacion = (document.getElementById('bonificacion') as HTMLInputElement).value;
        return this.registerAsignacion(parseInt(empleado), fechaInicioConHora, fechaFinConHora, parseInt(horaExtra), parseFloat(bonificacion));
      }
    });
  }

  async registerAsignacion(empleado: number, fechaInicio: Date, fechaFin: Date, horaExtra: number, bonificacion: number) {
    const urlCreate = `http://localhost:9200/nomina`;
    const token = localStorage.getItem('token');

    const salario = parseFloat(await this.obtenerSalario(empleado));
    const dias = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
    const salarioxdia =salario / 30;
    const salarioMensual = dias * salarioxdia
    const salarioHora = salarioxdia / 7;
    const SalarioHoraExtra = (salarioHora / 2) + salarioHora;
    const horasExtras = horaExtra * SalarioHoraExtra;
    const igss = salario * 0.0483;
    const irtra = salario * 0.01
    const totalPagar = (salarioMensual + horasExtras + bonificacion) - (igss + irtra);


    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });


    const body = {
        id_empleado: empleado,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        diasLaborados: dias,
        horasExtras: horasExtras,
        bonificaciones: bonificacion,
        igss: igss,
        irtra: irtra,
        totalPagar: totalPagar
    };

    // console.log(body)
    // return true
    return this.http.post(urlCreate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Nomina creada correctamente', 'success');
        this.cargarNomina();
        this.cargarEmpleados();
        return true;
      })
      .catch((error) => {
        console.error('Error al crear la nomina', error);
        Swal.fire('Error', 'No se pudo registrar la asignacion', 'error');
        return false;
      });
  }

  async obtenerSalario(empleado: number) {
    const urlGet = `http://localhost:9200/empleado/${empleado}`;
    try {
      const response: any = await this.http.get<any>(urlGet).toPromise();
      const salario = response.puesto.salario_mensual;
      return salario;
    } catch (error) {
      console.error('Error al obtener el salario:', error);
      return null;
    }
  }

  formatFechaHora(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
  }

  // edit(id: any) {
  //   Swal.fire({
  //     title: 'Editar nomina',
  //     html: `
  //         <p><strong>${id.empleado.nombre} ${id.empleado.apellido}</strong></p><br>
  //         <label for="horaExtra">Horas extras:</label><br>
  //         <input type="number" id="horaExtra" class="swal2-input" placeholder="Horas" required><br>
  //         <label for="horaExtra">Bonificaciones:</label><br>
  //         <input type="number" id="bonificacion" class="swal2-input" value="250" required><br>
  //     `,
  //     showCancelButton: true,
  //     confirmButtonText: 'Guardar',
  //     preConfirm: () => {
  //       const equipo = (document.getElementById('equipo') as HTMLInputElement).value;
  //       return this.editAsignacionEpp(id.id_asignacion_epp, equipo);
  //     }
  //   });
  // }

  // editAsignacionEpp(id: number, equipo: string) {
  //   const urlUpdate = `http://localhost:9200/nomina/${id}`;
  //   const token = localStorage.getItem('token');

  //   if (!token) {
  //     console.warn('No se encontró el token en el Local Storage.');
  //     return false;
  //   }

  //   const headers = new HttpHeaders({
  //     Authorization: `${token}`
  //   });

  //   const body = {
  //     id_epp: equipo
  //   };

  //   return this.http.patch(urlUpdate, body, { headers }).toPromise()
  //     .then(() => {
  //       Swal.fire('Éxito', 'Asignacion actualizada correctamente', 'success');
  //       this.cargarNomina();
  //       return true;
  //     })
  //     .catch((error) => {
  //       console.error('Error al actualizar la asignacion', error);
  //       Swal.fire('Error', 'No se pudo actualizar la asignacion', 'error');
  //       return false;
  //     });
  // }

  view(id: any): void {
    const urlGet = `http://localhost:9200/nomina/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (Details: any) => {
        Swal.fire({
          title: 'Detalles de la nomina',
          html: `
            <p><strong>ID:</strong> ${Details.id_nomina}</p>
            <p><strong>Nombre:</strong> ${Details.empleado.nombre}</p>
            <p><strong>Apellido:</strong> ${Details.empleado.apellido}</p>
            <p><strong>Fecha Inicio:</strong> ${this.formatFechaHora(Details.fecha_inicio)}</p>
            <p><strong>Fecha Fin:</strong> ${this.formatFechaHora(Details.fecha_fin)}</p>
            <p><strong>Dias laborados:</strong> ${Details.diasLaborados}</p>
            <p><strong>Horas extras:</strong> Q ${Details.horasExtras}</p>
            <p><strong>Bonificaciones:</strong> Q ${Details.bonificaciones}</p>
            <p><strong>IGSS:</strong> Q ${Details.igss}</p>
            <p><strong>IRTRA:</strong> Q ${Details.irtra}</p>
            <p><strong>Total a pagar:</strong> Q ${Details.totalPagar}</p>
          `,
          icon: 'success'
        });
      },
      (error) => {
        console.error('Error al obtener los detalles del item', error);
        Swal.fire('Error', 'No se pudieron obtener los detalles del item', 'error');
      }
    );
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/nomina/${id.id_nomina}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar la nomina?',
        text: id.empleado.nombre +' '+ id.empleado.apellido,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Sí, bórralo!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.http.delete(urlDelete, { headers }).subscribe(
            () => {
              Swal.fire('Éxito', 'Nomina eliminada correctamente', 'success');
              this.cargarNomina();
            },
            (err) => {
              console.error('Error al eliminar la nomina', err);
              Swal.fire('Error', 'No se pudo eliminar la nomina', 'error');
            }
          );
        }
      })

    }
  }

  generatePDF() {
    const docDefinition : any = {
      content: [
        {
          text: 'Nomina mes en curso',
          style: 'header'
        },
        {
          table: {
            headerRows: 2,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['ID', 'Nombre', 'Apellido', 'Fecha Inicio', 'Fecha Fin', 'Dias laborados', 'Horas extras', 'Bonificacion', 'IGSS', 'IRTRA', 'Total a pagar'],
              ...this.nominas.map(row => [
                row.id_nomina,
                row.empleado.nombre,
                row.empleado.apellido,
                this.formatFechaHora(row.fecha_inicio),
                this.formatFechaHora(row.fecha_fin),
                row.diasLaborados,
                row.horasExtras,
                row.bonificaciones,
                row.igss,
                row.irtra,
                row.totalPagar
              ])
            ]
          }
        }
      ],
      pageOrientation: 'landscape'
    };
    const pdf = pdfMake.createPdf(docDefinition);
    pdf.open();
  }
}
