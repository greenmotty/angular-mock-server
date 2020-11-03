import { Component, OnInit } from '@angular/core';
import {ExampleService} from "../../services/example.service";
import {Dummy} from "../../models/dummy";
import {interval, Subscription, timer} from "rxjs";
import {Observable} from "rxjs/src/internal/Observable";

@Component({
  selector: 'app-show-server-data',
  templateUrl: './show-server-data.component.html',
  styleUrls: ['./show-server-data.component.scss']
})
export class ShowServerDataComponent implements OnInit {
  public response: Dummy;
  public time: any;
  private numbers: number;
  private subscription: Subscription;

  constructor(private exampleService: ExampleService) { }

  ngOnInit() {
  }

  getServerData() {
    const id = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
    this.exampleService.getServerDate(id).subscribe((response)=> {
      this.response = response;
    });
  }

  public startTimer() {
    const secondsCounter = interval(1000);
    // Subscribe to begin publishing values
    this.subscription = secondsCounter.subscribe(n => this.numbers = n );
  }

  public stopTimer() {
    if (this.subscription){
      this.subscription.unsubscribe();
    }
  }
}
