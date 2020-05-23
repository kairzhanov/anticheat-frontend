import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamSessionComponent } from './exam-session.component';

describe('ExamSessionComponent', () => {
  let component: ExamSessionComponent;
  let fixture: ComponentFixture<ExamSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExamSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
