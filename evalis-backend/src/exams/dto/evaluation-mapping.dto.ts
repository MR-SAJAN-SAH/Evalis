export class UploadEvaluationMappingDto {
  examId: string;
  mappings: {
    [evaluatorEmail: string]: string[];
  };
}

export class EvaluationMappingResponseDto {
  id: string;
  examId: string;
  evaluatorEmail: string;
  candidateEmails: string[];
  createdAt: Date;
  updatedAt: Date;
}
