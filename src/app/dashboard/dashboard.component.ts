import { Component, OnInit, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{
  private breakpointObserver = inject(BreakpointObserver);
  router = new Router();
  public chart: any;

  constructor(){}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['login']);
    }

    this.createCharts();
  }

  createCharts(): void {
    const xValues = ['Multiperfiles', 'Bayer', 'Unipharm', 'Pepsi', 'Toledo'];
    const yValues = [12000, 12500, 12500, 3000, 1000];
    const xValuesM = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    const myChart = new Chart("myChart", {
      type: 'bar',
      data: {
          labels: ["Multiperfiles", "Bayer", "Unipharm", "Pepsi", "Toledo"],
          datasets: [{
              label: '# usuarios',
              data: [12, 19, 3, 5, 2, 3],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          },
          plugins: {
            legend: {display: false}
          }
      }
    });

    const myChart2 = new Chart("myChart2", {
      type: "line",
      data: {
        labels: xValues,
        datasets: [{
          backgroundColor:"rgba(0,0,255,1.0)",
          borderColor: "rgba(0,0,255,0.1)",
          data: yValues
        }]
      },
      options:{
        scales: {
          y: {
              beginAtZero: true
          }
        },
        plugins: {
          legend: {display: false}
        }
      }
    });

    const myChart3 = new Chart("myChart3", {
      type: "line",
      data: {
        labels: xValuesM,
        datasets: [{
          data: [860,1140,1060,1060,1070,1110,1330,2210,7830,2478],
          borderColor: "red",
          fill: false
        },{
          data: [1600,1700,1700,1900,2000,2700,4000,5000,6000,7000],
          borderColor: "green",
          fill: false
        },{
          data: [300,700,2000,5000,6000,4000,2000,1000,200,100],
          borderColor: "blue",
          fill: false
        }]
      },
      options: {
        plugins: {
          legend: {display: false}
        }
      }
    });


  }
}
