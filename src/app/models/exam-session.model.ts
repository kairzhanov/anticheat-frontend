export class ExamSession {
    _id: string;
    user_id: string;
    exam_id: string;
    start_date: Date;
    end_date: Date;
    duration: number;
    logs: any[];
}