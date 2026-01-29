export class CandidateClassroom {
  id: string;
  classroomId?: string;
  candidateId?: string;
  status?: 'pending' | 'active' | 'left';
  createdAt?: Date;
}

export default CandidateClassroom;
