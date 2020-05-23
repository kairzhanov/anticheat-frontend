import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExamService } from 'src/app/services/exam.service';
import { Exam } from 'src/app/models/exam.model';
import { ExamSession } from 'src/app/models/exam-session.model';
import { ExamSessionService } from 'src/app/services/exam-session.service';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.css']
})
export class ExamComponent implements OnInit {
  exam: Exam;
  examSessions: ExamSession[];

  constructor(private route: ActivatedRoute, 
    private examService: ExamService,
    private sessionService: ExamSessionService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.examService.getExam(id).subscribe(exam => {
      this.exam = exam;
      console.log(this.exam);
    });
    this.sessionService.getExamSessions().subscribe(sessions => {
      this.examSessions = sessions;
    })
  }

}
