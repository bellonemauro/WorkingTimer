import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { SettingsPopoverComponent } from 'src/app/COMPONENTS/settingspopover/settings-popover/settings-popover.component';
import { AlertService } from 'src/app/SERVICE/Alert/alert.service';
import { StorageService } from 'src/app/SERVICE/Storage/storage.service';
import { TimerService } from 'src/app/SERVICE/Timer/timer.service';
import { TimeList, LABELS, DEFAULT_VAL } from '../../MODELS/Interfaces';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {


  private _startStopTxt: string = LABELS.START;
  private _isRunning: boolean = false;
  private time: string;
  private stopped: Date[] = [];
  private started: Date[] = [];
  private timeList: TimeList = new TimeList();
  
  private offset;  // time offset between current time and alarm time

  private clickCounter: number = 0; // count the number of click on Start/Stop timer button

  /**
   * CONSTRUCTOR
   */
  constructor(
    private timerService: TimerService,
    private popoverController: PopoverController,
    private storageService: StorageService,
    public alertController: AlertController,
    public alert: AlertService
  ) { 
    // ToDo
    // let User manage the offset
    this.offset = 15;
  }

  /**
   * Start/Stop timer function
   */
  async OnFabTimerClick() {
    
    // check for alarm
    let alarm = this.storageService.getAlarm(this.clickCounter);
    let currentTime = this.timerService.getCurrentTimeAsIndex();

    
    if (alarm) {

      let msg = null;

      console.log("Alarm: ", alarm);
      console.log("Scheduled: ", alarm.index);
      console.log("Current: ", currentTime);
      // check if it is too late for today working day
      if (currentTime > (this.storageService.getLastAlarm().index)) {
        msg = "You are out of your working hours!";
      }

      if (currentTime < (alarm.index - this.offset))
      {
        msg =  "Not time yet!";
      }

      await this.alert.presentConfirmAlert(msg)
      .then( res => {
        if (res) {
          console.log('Confirmed');
          this.StartStopTimer();
        } else {
          console.log('Canceled')
        }
      })


    } else {
      // this.StartStopTimer();
      let subheader = "You are done for today!";
      let msg = "Do you want to reset timer?"
      await this.alert.presentConfirmAlert(msg, subheader)
      .then( res => {
        if (res) {
          console.log('Confirmed');
          this.Reset();
        } else {
          console.log('Canceled')
        }
      })
    }
  }


  /**
   * Sart or Stop timer,
   * and increment click counter
   */
  StartStopTimer() {
    if (this._isRunning) 
    {
      this._startStopTxt = LABELS.START;
      this.timerService.stop();
    } 
    else 
    {
      this._startStopTxt = LABELS.STOP;
      this.timerService.start();
    }
    this.timeList = this.timerService.GetTimeList();
    this._isRunning = !this._isRunning;
    this.clickCounter++;
  }

  /**
   * Reset timer and click counter
   */
  Reset() {
    console.log("Resetting...");
    this.timerService.reset();
    this.timeList = this.timerService.GetTimeList();
    // console.log(this.timeList)
    this._isRunning = false;
    this.clickCounter = 0;
  }



  /**
   * Open Setings pop-up
   */
  async showSettings() {
    const popover = await this.popoverController.create({
      component: SettingsPopoverComponent,
      translucent: true
    });
    await popover.present();
    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

}
