import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.scss'],
  standalone: false,
})
export class GaleriaComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  segmentChanged(){
    console.log('Segment changed');
  }

  onSearchChange(){
    console.log('Search changed');
  }

}
