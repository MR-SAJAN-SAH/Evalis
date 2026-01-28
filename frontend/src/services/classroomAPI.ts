import apiClient from './apiService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ClassroomSection {
  id: string;
  name: string;
}

export interface Classroom {
  id: string;
  name: string;
  description: string;
  subject: string;
  sections: ClassroomSection[];
  studentCount: number;
  status: 'active' | 'archived' | 'inactive';
  classCode: string;
  totalInvites: number;
  acceptedCount: number;
  pendingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClassroomInvitation {
  id: string;
  classroomId: string;
  classroomName?: string;
  candidateEmail: string;
  candidateName?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface AnnouncementAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface Announcement {
  id: string;
  classroomId: string;
  teacherId: string;
  teacherName: string;
  title: string;
  content: string;
  contentHtml?: string;
  attachments?: AnnouncementAttachment[];
  status: 'published' | 'draft' | 'archived';
  viewCount: number;
  viewedBy?: string[];
  coverImage?: string;
  metadata?: {
    isPinned?: boolean;
    pinnedAt?: Date;
    priority?: 'normal' | 'high' | 'urgent';
    tags?: string[];
    allowComments?: boolean;
    requiresAck?: boolean;
    comments?: Array<{ userName: string; text: string; createdAt: string }>;
    likes?: number;
  };
  createdAt: string;
  updatedAt: string;
  scheduledFor?: Date;
}

// Teacher Classroom API
export const classroomAPI = {
  // Create classroom
  async createClassroom(data: {
    name: string;
    description?: string;
    subject: string;
    sections?: string[];
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; data: Classroom; message: string }> {
    const response = await apiClient.post(`/api/classrooms`, data);
    return response.data;
  },

  // Get all teacher classrooms
  async getTeacherClassrooms(): Promise<{ success: boolean; data: Classroom[] }> {
    const response = await apiClient.get(`/api/classrooms/teacher/list`);
    return response.data;
  },

  // Get classroom details
  async getClassroomDetail(classroomId: string): Promise<{ success: boolean; data: Classroom }> {
    const response = await apiClient.get(`/api/classrooms/${classroomId}`);
    return response.data;
  },

  // Update classroom
  async updateClassroom(
    classroomId: string,
    data: any,
  ): Promise<{ success: boolean; data: Classroom; message: string }> {
    const response = await apiClient.put(
      `/api/classrooms/${classroomId}`,
      data,
    );
    return response.data;
  },

  // Delete classroom
  async deleteClassroom(classroomId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/classrooms/${classroomId}`);
    return response.data;
  },

  // Invite candidates
  async inviteCandidates(
    classroomId: string,
    emails: string[],
    message?: string,
  ): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await apiClient.post(
      `/api/classrooms/${classroomId}/invite`,
      { emails, message },
    );
    return response.data;
  },

  // Get classroom invitations
  async getClassroomInvitations(classroomId: string): Promise<{
    success: boolean;
    data: any[];
  }> {
    const response = await apiClient.get(
      `/api/classrooms/${classroomId}/invitations`,
    );
    return response.data;
  },

  // Get classroom enrollments
  async getClassroomEnrollments(classroomId: string): Promise<{
    success: boolean;
    data: any[];
  }> {
    const response = await apiClient.get(
      `/api/classrooms/${classroomId}/enrollments`,
    );
    return response.data;
  },

  // Pending invitations (for candidates)
  async getPendingInvitations(candidateEmail?: string): Promise<{
    success: boolean;
    data: any[];
  }> {
    const response = await apiClient.get(
      `/api/classrooms/invitations/pending`,
      { params: { candidateEmail } },
    );
    return response.data;
  },

  // Respond to invitation (accept/reject)
  async respondToInvitation(
    invitationId: string,
    status: 'accepted' | 'rejected',
  ): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.post(
      `/api/classrooms/invitations/${invitationId}/respond`,
      { status },
    );
    return response.data;
  },

  // Get candidate classrooms
  async getCandidateClassrooms(candidateEmail?: string): Promise<{ success: boolean; data: Classroom[] }> {
    const response = await apiClient.get(
      `/api/classrooms/candidate/list`,
      { params: { candidateEmail } },
    );
    return response.data;
  },

  // Create announcement
  async createAnnouncement(data: {
    classroomId: string;
    title: string;
    content: string;
    contentHtml?: string;
    attachments?: any[];
    metadata?: any;
  }): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.post(`/api/announcements`, data);
    return response.data;
  },

  // Get announcements by classroom
  async getAnnouncementsByClassroom(
    classroomId: string,
  ): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await apiClient.get(
      `/api/announcements/classroom/${classroomId}`,
    );
    return response.data;
  },

  // Get announcements for student
  async getStudentAnnouncements(
    classroomId: string,
  ): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await apiClient.get(
      `/api/announcements/student/classroom/${classroomId}`,
    );
    return response.data;
  },

  // Get single announcement
  async getAnnouncement(announcementId: string): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.get(
      `/api/announcements/${announcementId}`,
    );
    return response.data;
  },

  // Update announcement
  async updateAnnouncement(
    announcementId: string,
    data: any,
  ): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.put(
      `/api/announcements/${announcementId}`,
      data,
    );
    return response.data;
  },

  // Delete announcement
  async deleteAnnouncement(announcementId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/announcements/${announcementId}`);
    return response.data;
  },

  // Toggle pin
  async togglePin(announcementId: string): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.post(
      `/api/announcements/${announcementId}/pin`,
    );
    return response.data;
  },

  // Like announcement
  async likeAnnouncement(announcementId: string): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.post(
      `/api/announcements/${announcementId}/like`,
    );
    return response.data;
  },

  // Add comment
  async addComment(announcementId: string, comment: string): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.post(
      `/api/announcements/${announcementId}/comment`,
      { comment },
    );
    return response.data;
  },

  // Archive announcement
  async archiveAnnouncement(announcementId: string): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.post(
      `/api/announcements/${announcementId}/archive`,
    );
    return response.data;
  },

  // Upload file
  async uploadFile(
    file: File,
    classroomId: string,
  ): Promise<{ success: boolean; data: any; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `/api/announcements/upload/${classroomId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  // Get classroom students
  async getClassroomStudents(classroomId: string): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await apiClient.get(
      `/api/classrooms/${classroomId}/students`,
    );
    return response.data;
  },

  // Debug: Get teacher classrooms
  async debugGetTeacherClassrooms(): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await apiClient.get(
      `/api/teacher/announcements/debug/classrooms`,
    );
    return response.data;
  },

  // Upload material
  async uploadMaterial(classroomId: string, formData: FormData): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.post(
      `/api/classrooms/${classroomId}/materials/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },
} as const;
  // Create classroom
  async createClassroom(data: {
    name: string;
    description?: string;
    subject: string;
    sections?: string[];
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; data: Classroom; message: string }> {
    const response = await apiClient.post(`/api/classrooms`, data);
    return response.data;
  },

  // Get all teacher classrooms
  async getTeacherClassrooms(): Promise<{ success: boolean; data: Classroom[] }> {
    const response = await apiClient.get(`/api/classrooms/teacher/list`);
    return response.data;
  },

  // Get classroom details
  async getClassroomDetail(classroomId: string): Promise<{ success: boolean; data: Classroom }> {
    const response = await apiClient.get(`/api/classrooms/${classroomId}`);
    return response.data;
  },

  // Update classroom
  async updateClassroom(
    classroomId: string,
    data: Partial<Classroom>,
  ): Promise<{ success: boolean; data: Classroom; message: string }> {
    const response = await apiClient.put(
      `/api/classrooms/${classroomId}`,
      data,
    );
    return response.data;
  },

  // Delete classroom
  async deleteClassroom(classroomId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/classrooms/${classroomId}`);
    return response.data;
  },

  // Invite candidates
  async inviteCandidates(
    classroomId: string,
    emails: string[],
    message?: string,
  ): Promise<{ success: boolean; data: ClassroomInvitation[]; message: string }> {
    const response = await apiClient.post(
      `/api/classrooms/${classroomId}/invite`,
      { emails, message },
    );
    return response.data;
  },

  // Get classroom invitations
  async getClassroomInvitations(classroomId: string): Promise<{
    success: boolean;
    data: ClassroomInvitation[];
  }> {
    const response = await apiClient.get(
      `/api/classrooms/${classroomId}/invitations`,
    );
    return response.data;
  },

  // Get classroom enrollments
  async getClassroomEnrollments(classroomId: string): Promise<{
    success: boolean;
    data: any[];
  }> {
    const response = await apiClient.get(
      `/api/classrooms/${classroomId}/enrollments`,
    );
    return response.data;
  },
};

// Candidate Classroom API
export const candidateClassroomAPI = {
  // Get pending classroom invitations
  async getPendingInvitations(candidateEmail?: string): Promise<{
    success: boolean;
    data: ClassroomInvitation[];
  }> {
    const response = await apiClient.get(
      `/api/candidate/classrooms/pending-invitations`,
      {
        params: candidateEmail ? { email: candidateEmail } : {},
      }
    );
    return response.data;
  },

  // Respond to classroom invitation
  async respondToInvitation(
    invitationId: string,
    status: 'accepted' | 'rejected',
    message?: string,
  ): Promise<{ success: boolean; data: ClassroomInvitation; message: string }> {
    const response = await apiClient.post(
      `/api/candidate/classrooms/invitations/${invitationId}/respond`,
      { status, message },
    );
    return response.data;
  },

  // Get candidate's classrooms
  async getCandidateClassrooms(candidateEmail?: string): Promise<{ success: boolean; data: Classroom[] }> {
    const response = await apiClient.get(
      `/api/candidate/classrooms/list`,
      {
        params: candidateEmail ? { email: candidateEmail } : {},
      }
    );
    return response.data;
  },
};

// Announcement API
export const announcementAPI = {
  // Create announcement
  async createAnnouncement(data: {
    classroomId: string;
    title: string;
    content: string;
    contentHtml?: string;
    attachments?: AnnouncementAttachment[];
    status?: 'published' | 'draft';
    coverImage?: string;
    scheduledFor?: Date;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; data: Announcement; message: string }> {
    const response = await apiClient.post(`/api/teacher/announcements/create`, data);
    return response.data;
  },

  // Get announcements for classroom
  async getAnnouncementsByClassroom(
    classroomId: string,
    options?: { take?: number; skip?: number; pinnedOnly?: boolean }
  ): Promise<{ success: boolean; data: Announcement[]; message: string }> {
    const response = await apiClient.get(
      `/api/teacher/announcements/classroom/${classroomId}`,
      { params: options }
    );
    return response.data;
  },

  // Get announcements for student
  async getStudentAnnouncements(
    classroomId: string,
    options?: { take?: number; skip?: number; pinnedOnly?: boolean }
  ): Promise<{ success: boolean; data: Announcement[]; message: string }> {
    const response = await apiClient.get(
      `/api/teacher/announcements/student/classroom/${classroomId}`,
      { params: options }
    );
    return response.data;
  },

  // Get single announcement
  async getAnnouncement(announcementId: string): Promise<{ success: boolean; data: Announcement; message: string }> {
    const response = await apiClient.get(`/api/teacher/announcements/${announcementId}`);
    return response.data;
  },

  // Update announcement
  async updateAnnouncement(
    announcementId: string,
    data: Partial<Announcement>
  ): Promise<{ success: boolean; data: Announcement; message: string }> {
    const response = await apiClient.put(`/api/teacher/announcements/${announcementId}`, data);
    return response.data;
  },

  // Delete announcement
  async deleteAnnouncement(announcementId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/teacher/announcements/${announcementId}`);
    return response.data;
  },

  // Toggle pin
  async togglePin(announcementId: string): Promise<{ success: boolean; data: Announcement; message: string }> {
    const response = await apiClient.post(
      `/api/teacher/announcements/${announcementId}/pin`
    );
    return response.data;
  },

  // Like announcement
  async likeAnnouncement(announcementId: string): Promise<{ success: boolean; data: Announcement; message: string }> {
    const response = await apiClient.post(
      `/api/teacher/announcements/${announcementId}/like`
    );
    return response.data;
  },

  // Add comment
  async addComment(announcementId: string, comment: string): Promise<{ success: boolean; data: Announcement; message: string }> {
    const response = await apiClient.post(
      `/api/teacher/announcements/${announcementId}/comment`,
      { comment }
    );
    return response.data;
  },

  // Archive announcement
  async archiveAnnouncement(announcementId: string): Promise<{ success: boolean; data: Announcement; message: string }> {
    const response = await apiClient.post(
      `/api/teacher/announcements/${announcementId}/archive`
    );
    return response.data;
  },

  // Upload file
  async uploadFile(
    file: File,
    classroomId: string
  ): Promise<{ success: boolean; data: AnnouncementAttachment; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `/api/teacher/announcements/upload/${classroomId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // Get classroom students
  async getClassroomStudents(classroomId: string): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await apiClient.get(
      `/api/teacher/announcements/classroom/${classroomId}/students`
    );
    return response.data;
  },

  // Debug: Get teacher classrooms
  async debugGetTeacherClassrooms(): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await apiClient.get(
      `/api/teacher/announcements/debug/classrooms`
    );
    return response.data;
  },

  // Upload material
  async uploadMaterial(classroomId: string, formData: FormData): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.post(
      `/api/classrooms/${classroomId}/materials/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};
