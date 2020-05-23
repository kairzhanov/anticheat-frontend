import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Exam } from 'src/app/models/exam.model';
import { ExamService } from 'src/app/services/exam.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-exam-create',
  templateUrl: './exam-create.component.html',
  styleUrls: ['./exam-create.component.css']
})
export class ExamCreateComponent implements OnInit {
  createForm: FormGroup;
  currentUser: User;
  constructor(private fb: FormBuilder,
    private examService: ExamService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: [''], 
      duration: ['', Validators.required],
    });
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  onSubmit() {
    if (this.createForm.valid) {
      let exam = new Exam();
      exam.title = this.createForm.get('title').value;
      exam.description = this.createForm.get('description').value;
      exam.start_date = this.createForm.get('start_date').value;
      exam.end_date = this.createForm.get('end_date').value;
      exam.duration = this.createForm.get('duration').value;
      exam.is_active = true;
      exam.user_id = this.currentUser.id;
      this.examService.createExam(exam).subscribe(result => {
        alert("Exam successfully created");
        this.createForm.reset();
      }, error => {
        alert("Error on server side, please, try again later");
        console.log(error);
      });
    }
  }

}
