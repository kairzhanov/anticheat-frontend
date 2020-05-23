import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExamSession } from '../models/exam-session.model';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ExamSessionService {

  constructor(private http: HttpClient) { }

  createExamSession(session: ExamSession): Observable<ExamSession> {
    return this.http.post<ExamSession>(`${environment.apiUrl}/sessions/`, session);
  }

  updateExamSession(session: ExamSession, id: string): Observable<ExamSession> {
    return this.http.patch<ExamSession>(`${environment.apiUrl}/sessions/${id}`, session);
  }

  getExamSessions(): Observable<ExamSession[]> {
    return this.http.get<ExamSession[]>(`${environment.apiUrl}/sessions/`);
  }
}
