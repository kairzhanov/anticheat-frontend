import { TestBed } from '@angular/core/testing';

import { ExamSessionService } from './exam-session.service';

describe('ExamSessionService', () => {
  let service: ExamSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
