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
  mobile: false;
  VIDEO_SIZE = 500;
  model;
  looked_away;
  

  @ViewChild('videoCamera', {static: true}) videoCamera: ElementRef;
  @ViewChild('canvas', {static: true}) canvas: ElementRef;
  @ViewChild('faceStatus', {static: true}) faceStatus: ElementRef;


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.examService.getExam(id).subscribe(exam => {
      this.exam = exam;
      console.log(this.exam);
    });
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this.examSession = new ExamSession();
    this.examSession.user_id = this.currentUser.id;
    this.examSession.exam_id = id;
    // this.sessionService.createExamSession(this.examSession).subscribe (session => {
    //   this.examSession = session;
    //   console.log(session);
    // });
    this.webcam_init();
    this.videoCamera.nativeElement.style.visibility = 'visible';
    this.load_model();
  }

  detectFrame(model) {
    model.estimateFaces(this.videoCamera.nativeElement).then(predictions => {
      this.renderPrediction(predictions);
      requestAnimationFrame(() => {
      this.detectFrame(model);});
      });
  }

  async renderPrediction(predictions) {
    // stats.begin();
  
    // const predictions = await this.model.estimateFaces(this.video);
    console.log(predictions);
    // ctx.drawImage(
        // video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
  
    // var faceStatus = document.querySelector('#face-status');
  
    if (predictions.length > 0) {
      predictions.forEach(prediction => {
        const keypoints = prediction.scaledMesh;
        // console.log(prediction.annotations.lipsLowerOuter[0], prediction.annotations.lipsUpperOuter[0]);
        // console.log(prediction.annotations.leftCheek[0]);
        var leftCheek = prediction.annotations.leftCheek[0];
        var midwayBetweenEyes = prediction.annotations.midwayBetweenEyes[0];
        var noseTip = prediction.annotations.noseTip[0];
        if (leftCheek[2] >= 18 || leftCheek[2] <= -18) {
          this.looked_away = true;
          // console.log("Please, look at the camera!");
        } else if (midwayBetweenEyes[2] >= 5 || midwayBetweenEyes[2] <= -20 ) {
          this.looked_away = true;
          // console.log("Please, look at the camera2!");
        } else if (noseTip[2] > -18) {
          this.looked_away = true;
          // console.log("Please, look at the camera3!");
        } else {
          this.looked_away = false;
        }
  
        if (this.looked_away) {
          this.faceStatus.nativeElement.innerHTML = "Person is looking away!";
          this.faceStatus.nativeElement.style.color = "red";
        } else {
          this.faceStatus.nativeElement.innerHTML = "Person is looking at the display.";
          this.faceStatus.nativeElement.style.color = "black";
        }
  
        // if (state.triangulateMesh) {
        //   for (let i = 0; i < TRIANGULATION.length / 3; i++) {
        //     const points = [
        //       TRIANGULATION[i * 3], TRIANGULATION[i * 3 + 1],
        //       TRIANGULATION[i * 3 + 2]
        //     ].map(index => keypoints[index]);
  
        //     drawPath(ctx, points, true);
        //   }
        // } else {
        //   for (let i = 0; i < keypoints.length; i++) {
        //     const x = keypoints[i][0];
        //     const y = keypoints[i][1];
  
        //     ctx.beginPath();
        //     ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
        //     ctx.fill();
        //   }
        // }
      });
  
      // if (renderPointcloud && state.renderPointcloud && scatterGL != null) {
      //   const pointsData = predictions.map(prediction => {
      //     let scaledMesh = prediction.scaledMesh;
      //     return scaledMesh.map(point => ([-point[0], -point[1], -point[2]]));
      //   });
  
      //   let flattenedPointsData = [];
      //   for (let i = 0; i < pointsData.length; i++) {
      //     flattenedPointsData = flattenedPointsData.concat(pointsData[i]);
      //   }
      //   const dataset = new ScatterGL.Dataset(flattenedPointsData);
  
      //   if (!scatterGLHasInitialized) {
      //     scatterGL.render(dataset);
      //   } else {
      //     scatterGL.updateDataset(dataset);
      //   }
      //   scatterGLHasInitialized = true;
      // }
    } else {
      this.faceStatus.nativeElement.innerHTML = "No face found!";
      this.faceStatus.nativeElement.style.color = "black";
    }
  
    // stats.end();
    // requestAnimationFrame(renderPrediction);
  };

  async load_model() {
    var model = await facemesh.load({maxFaces: 2});
    console.log(model);
    this.detectFrame(model);
  }

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

  finishExam() {
    this.examSession.end_date = new Date();
    // this.sessionService.updateExamSession(this.examSession, this.examSession._id).subscribe (session => {
      // console.log(session);
      alert("Thank you!");
      this.router.navigate(['/']);
    // });
  }

}
