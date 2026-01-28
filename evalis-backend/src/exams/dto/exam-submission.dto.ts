export class ExamSubmissionDto {
  examId: string;
  candidateId: string;
  answers: Record<string, string | null>;
}

export class ExamSubmissionResponseDto {
  id: string;
  examId: string;
  candidateId: string;
  evaluatorEmail: string;
  isRandomlyAssigned: boolean;
  submittedAt: Date;
  evaluationStatus: 'pending' | 'in-progress' | 'completed';
}
