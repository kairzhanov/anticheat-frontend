import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { Exam } from 'src/app/models/exam.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from 'src/app/services/exam.service';
import { ExamSession } from 'src/app/models/exam-session.model';
import { ExamSessionService } from 'src/app/services/exam-session.service';
import * as facemesh from '@tensorflow-models/facemesh';
import * as tf from '@tensorflow/tfjs-core';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import { ResolvedStaticSymbol } from '@angular/compiler';
import {TRIANGULATION} from './triangulation';
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { timer } from "rxjs";


// TODO(annxingyuan): read version from tfjsWasm directly once
// https://github.com/tensorflow/tfjs/pull/2819 is merged.
// import {version} from '@tensorflow/tfjs-backend-wasm/dist/version';


@Component({
  selector: 'app-exam-session',
  templateUrl: './exam-session.component.html',
  styleUrls: ['./exam-session.component.css']
})
export class ExamSessionComponent implements OnInit {
  currentUser: User;
  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private examService: ExamService,
    private sessionService: ExamSessionService,
    private router: Router) { }
  exam: Exam;
  examSession: ExamSession;
  video: any;
  VIDEO_SIZE = 500;
  model;
  width: number = window.innerWidth;
  logs: string[] = [];

  // Booleans
  mobile: boolean = false;
  looked_away: boolean = false;
  smartphone_found: boolean = false;
  logFaceAdded: boolean = false;
  logPersonAdded: boolean = false;
  logPhoneAdded: boolean = false;
  isExamStarted: boolean = false;
  isLoading: boolean = true;

  // Elements
  @ViewChild('videoCamera', {static: true}) videoCamera: ElementRef;
  @ViewChild('canvasWrapper', {static: true}) canvasWrapper: ElementRef;
  @ViewChild('faceStatus', {static: true}) faceStatus: ElementRef;
  @ViewChild('objectStatus', {static: true}) objectStatus: ElementRef;
  @ViewChild('minutes', {static: true}) minutesLeft: ElementRef;
  @ViewChild('seconds', {static: true}) secondsLeft: ElementRef;

  // Counter
  duration: number = 0;
  timeLeft: number = 0;
  interval;

  startTimer() {
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft--;
        this.updateTime();
      } else {
        this.timeLeft = this.duration;
        this.finishExam();
      }
    }, 1000);
  }

  updateTime() {
    let time = this.getTime(this.timeLeft);
    this.minutesLeft.nativeElement.innerHTML = time[0];
    this.secondsLeft.nativeElement.innerHTML = time[1];
  }

  getTime(time: number): [number, number] {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    return [minutes, seconds];
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.examService.getExam(id).subscribe(exam => {
      this.exam = exam;
      this.duration = this.exam.duration * 60;
      this.timeLeft = this.duration;
      this.updateTime();
      console.log(this.exam);
    });
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this.examSession = new ExamSession();
    this.examSession.user_id = this.currentUser.id;
    this.examSession.exam_id = id;

    // console.log(this.width);
    this.VIDEO_SIZE = this.width * 0.20;
   
    this.webcam_init();
    this.load_model();
  }

  detectFrame(model) {
    model.estimateFaces(this.videoCamera.nativeElement).then(predictions => {
      this.renderPrediction(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(model);
        if (this.videoCamera.nativeElement.style.visibility != 'visible') 
          this.videoCamera.nativeElement.style.visibility = 'visible';
      });
    });
  }

  async renderPrediction(predictions) {
    if (predictions.length == 1) {
      predictions.forEach(prediction => {
        const keypoints = prediction.scaledMesh;
        // console.log(prediction.annotations.lipsLowerOuter[0], prediction.annotations.lipsUpperOuter[0]);
        // console.log(prediction.annotations.leftCheek[0]);
        var leftCheek = prediction.annotations.leftCheek[0];
        var midwayBetweenEyes = prediction.annotations.midwayBetweenEyes[0];
        var noseTip = prediction.annotations.noseTip[0];
        if (leftCheek[2] >= 18 || leftCheek[2] <= -18) {
          this.looked_away = true;
        } else if (midwayBetweenEyes[2] >= 5 || midwayBetweenEyes[2] <= -20 ) {
          this.looked_away = true;
        } else if (noseTip[2] > -18) {
          this.looked_away = true;
        } else {
          this.looked_away = false;
        }
  
        if (this.looked_away) {
          this.faceStatus.nativeElement.innerHTML = "Please, look at the screen!";
          this.faceStatus.nativeElement.style.color = "red";
          if (!this.logFaceAdded) {
            this.addToLogs("Person is looking away");
            this.logFaceAdded = true;
          }
        } else {
          this.faceStatus.nativeElement.innerHTML = "Good Luck!";
          this.faceStatus.nativeElement.style.color = "black";
          this.logFaceAdded = false;
        }
      });
      this.logPersonAdded = false;
    } else if (predictions.length > 1) {
      this.faceStatus.nativeElement.innerHTML = "More than one person found";
      this.faceStatus.nativeElement.style.color = "black";
      if (!this.logPersonAdded) {
        this.addToLogs("More than one person found!");
        this.logPersonAdded = true;
      }
    } else {
      this.faceStatus.nativeElement.innerHTML = "No face found!";
      this.faceStatus.nativeElement.style.color = "black";
      if (!this.logPersonAdded) {
        this.addToLogs("No person found!");
        this.logPersonAdded = true;
      }
    }
  
    // stats.end();
    // requestAnimationFrame(renderPrediction);
  };

  addToLogs(message: string) {
    if (this.isExamStarted) {
      let timePassed = this.duration - this.timeLeft;
      let time = this.getTime(timePassed);
      let messageToPush = "Time: "+time[0].toString()+":"+time[1].toString();
      messageToPush += " | " + message;
      this.logs.push(messageToPush);
    }
  }

  async load_model() {
    var model = await facemesh.load({maxFaces: 2});
    console.log(model);
    this.detectFrame(model);
    this.predictWithCocoModel();
  }

  async predictWithCocoModel()
  {
    var modelObject = await cocoSsd.load();
    this.detectCocoFrame(modelObject);
  }

  detectCocoFrame (modelObject) {
    this.isLoading = false;
    modelObject.detect(this.videoCamera.nativeElement).then(predictions => {
      this.renderCocoPrediction(predictions);
      requestAnimationFrame(() => {
        this.detectCocoFrame(modelObject);
      });
    });
  }

  renderCocoPrediction (predictions) {
    // console.log(predictions);
    predictions.forEach(prediction => {

      if (prediction.class == "cell phone") {
        this.smartphone_found = true;
      } else {
        this.smartphone_found = false;
      }
    });
    // predictions.forEach(prediction => {
      

    if (this.smartphone_found) {
      this.objectStatus.nativeElement.innerHTML = "Please, put down your phone.";
      this.objectStatus.nativeElement.style.color = "red";
      if (!this.logPhoneAdded) {
          this.addToLogs("Smartphone detected!");
          this.logPhoneAdded = true;
      }
    } else {
      this.objectStatus.nativeElement.innerHTML = "All your actions are recording.";
      this.objectStatus.nativeElement.style.color = "black";
      this.logPhoneAdded = false;
    }
  };

  webcam_init() {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: 'user',
      width: this.mobile ? undefined : this.VIDEO_SIZE,
      height: this.mobile ? undefined : this.VIDEO_SIZE }
    }).then(stream => {
      this.videoCamera.nativeElement.srcObject = stream;
      this.videoCamera.nativeElement.onloadedmetadata = () => {
        this.videoCamera.nativeElement.play();
      };
    });
  }

  startExam() {
    this.isExamStarted = true;
    this.sessionService.createExamSession(this.examSession).subscribe (session => {
      this.examSession._id = session['id'];
      this.startTimer();
      console.log(this.examSession);
    });
  }

  finishExam() {
    this.examSession.end_date = new Date();
    this.examSession.logs = this.logs;
    console.log(this.logs);
    console.log(this.examSession);
    this.sessionService.updateExamSession(this.examSession, this.examSession._id).subscribe (session => {
      console.log(session);
      alert("Thank you!");
      this.router.navigate(['/']);
    });
  }
}
