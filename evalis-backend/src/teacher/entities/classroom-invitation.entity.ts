export class ClassroomInvitation {
  id: string;
  classroomId?: string;
  email?: string;
  invitedBy?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  createdAt?: Date;
}

export default ClassroomInvitation;
