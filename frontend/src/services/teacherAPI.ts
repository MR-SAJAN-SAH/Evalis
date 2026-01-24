import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

interface SubjectOption {
  id: string;
  title: string;
  description: string;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  options: SubjectOption[];
  totalInvites: number;
  acceptedCount: number;
  pendingCount: number;
  createdAt: string;
}

interface Invitation {
  id: string;
  subjectId: string;
  subjectName: string;
  candidateEmail: string;
  candidateName?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  invitationToken?: string;
}

interface Notification {
  id: string;
  type: 'accepted' | 'rejected' | 'pending';
  subjectId: string;
  subjectName: string;
  candidateEmail: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const teacherAPI = {
  // Subject Management
  async createSubject(data: {
    name: string;
    description: string;
    options: SubjectOption[];
    organizationId: string;
  }): Promise<Subject> {
    const response = await axios.post(`${API_BASE_URL}/teacher/subjects`, data);
    return response.data;
  },

  async getTeacherSubjects(): Promise<Subject[]> {
    const response = await axios.get(`${API_BASE_URL}/teacher/subjects`);
    return response.data;
  },

  async getSubjectDetail(subjectId: string): Promise<Subject> {
    const response = await axios.get(
      `${API_BASE_URL}/teacher/subjects/${subjectId}`,
    );
    return response.data;
  },

  async updateSubject(
    subjectId: string,
    data: {
      name?: string;
      description?: string;
      options?: SubjectOption[];
    },
  ): Promise<Subject> {
    const response = await axios.put(
      `${API_BASE_URL}/teacher/subjects/${subjectId}`,
      data,
    );
    return response.data;
  },

  async deleteSubject(subjectId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/teacher/subjects/${subjectId}`);
  },

  // Invitations
  async inviteCandidates(
    subjectId: string,
    emails: string[],
  ): Promise<Invitation[]> {
    const response = await axios.post(
      `${API_BASE_URL}/teacher/subjects/${subjectId}/invite`,
      { emails },
    );
    return response.data;
  },

  async getInvitations(): Promise<Invitation[]> {
    const response = await axios.get(`${API_BASE_URL}/teacher/invitations`);
    return response.data;
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const response = await axios.get(`${API_BASE_URL}/teacher/notifications`);
    return response.data;
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await axios.put(
      `${API_BASE_URL}/teacher/notifications/${notificationId}/read`,
    );
  },
};

// Candidate endpoints
export const candidateAPI = {
  async getPendingInvitations(): Promise<Invitation[]> {
    const response = await axios.get(
      `${API_BASE_URL}/candidate/invitations/pending`,
    );
    return response.data;
  },

  async respondToInvitation(
    invitationId: string,
    status: 'accepted' | 'rejected',
  ): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/candidate/invitations/${invitationId}/respond`,
      { status },
    );
  },

  async getCandidateSubjects(): Promise<Subject[]> {
    const response = await axios.get(`${API_BASE_URL}/candidate/subjects`);
    return response.data;
  },

  async getNotifications(): Promise<Notification[]> {
    const response = await axios.get(`${API_BASE_URL}/candidate/notifications`);
    return response.data;
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await axios.put(
      `${API_BASE_URL}/candidate/notifications/${notificationId}/read`,
    );
  },
};
