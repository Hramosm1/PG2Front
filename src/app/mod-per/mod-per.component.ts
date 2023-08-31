import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mod-per',
  templateUrl: './mod-per.component.html',
  styleUrls: ['./mod-per.component.css']
})
export class ModPerComponent implements OnInit {
  router = new Router();

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['login']);
    }
  }
}
