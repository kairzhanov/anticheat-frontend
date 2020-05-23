import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './_components/login/login.component';
import { HomeComponent } from './_components/home/home.component';
import { AuthGuard } from './_helpers/auth.guard';
import { ExamComponent } from './_components/exam/exam.component';
import { ExamCreateComponent } from './_components/exam-create/exam-create.component';
import { ExamSessionComponent } from './_components/exam-session/exam-session.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'exam/:id', component: ExamComponent, canActivate: [AuthGuard] },
  { path: 'exam', component: ExamCreateComponent, canActivate: [AuthGuard]},
  { path: 'exam/:id/start', component: ExamSessionComponent, canActivate: [AuthGuard]}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
