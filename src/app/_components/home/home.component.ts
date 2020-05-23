import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ExamService } from 'src/app/services/exam.service';
import { Exam } from 'src/app/models/exam.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User;
  exams: Exam[];
  constructor(private authService: AuthService,
    private examService: ExamService) {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    })
   }

  ngOnInit(): void {
    this.examService.getExams().subscribe(exams => {
      this.exams = exams;
      // console.log(exams);
    });
  }

  isTeacher() {
    if (this.currentUser && this.currentUser.role == "teacher") 
      return true;
    return false;
  }

  isStudent() {
    if (this.currentUser && this.currentUser.role == "student") 
      return true;
    return false;
  }

}
