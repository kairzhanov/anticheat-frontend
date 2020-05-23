import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exam } from '../models/exam.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamService {

  constructor(private http: HttpClient) { }

  getExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${environment.apiUrl}/exams/`);
  }

  getExam(id: string): Observable<Exam> {
    return this.http.get<Exam>(`${environment.apiUrl}/exams/${id}`);
  }

  createExam(exam: Exam): Observable<Exam> {
    return this.http.post<Exam>(`${environment.apiUrl}/exams/`, exam);
  }
}
