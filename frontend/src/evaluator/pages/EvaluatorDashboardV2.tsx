import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { classroomAPI, announcementAPI, type Announcement } from '../../services/classroomAPI';
import type { Classroom } from '../../services/classroomAPI';
import AnnouncementForm from '../../components/AnnouncementForm';
import AnnouncementFeed from '../../components/AnnouncementFeed';
import MaterialUploadForm from '../components/MaterialUploadForm';
import {
  FaHome, FaFileAlt, FaUsers, FaChalkboard, FaSignOutAlt,
  FaBars, FaTimes, FaClock, FaCheckCircle, FaTimesCircle,
  FaHourglassHalf, FaSearch, FaFilter, FaSort, FaStar,
  FaEye, FaEdit, FaPaperPlane, FaBook, FaCalendar, FaUser,
  FaPlus, FaUpload, FaDownload, FaComments, FaNewspaper,
  FaBell, FaCog, FaChevronDown, FaFolder, FaFile, FaImage,
  FaVideo, FaLink, FaPaperclip, FaThumbtack, FaTrash,
  FaReply, FaHeart, FaChevronRight, FaGraduationCap,
  FaChartBar, FaPercentage, FaAward, FaLightbulb, FaArrowLeft, FaSpinner
} from 'react-icons/fa';
import './EvaluatorDashboardV2.css';

interface TabType {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ClassroomPost {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  attachments: Array<{ name: string; type: string }>;
  comments: ClassroomComment[];
  isPinned: boolean;
}

interface ClassroomComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
}

interface ClassroomClass {
  id: string;
  name: string;
  description: string;
  students: number;
  sections: ClassroomSection[];
}

interface ClassroomSection {
  id: string;
  name: string;
  posts: ClassroomPost[];
  assignments: ClassroomAssignment[];
}

interface ClassroomAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  submitted: number;
  total: number;
  attachments: Array<{ name: string; type: string }>;
}

interface Exam {
  id: string;
  name: string;
  code: string;
  subject: string;
  totalCandidates: number;
  evaluated: number;
  pending: number;
  averageScore: number;
  status: string;
}

const EvaluatorDashboardV2: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userEmail, accessToken, logout } = useAuth();

  // Get active tab from URL
  const getActiveTabFromUrl = (): string => {
    const pathname = location.pathname;
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    
    const validTabs = ['dashboard', 'evaluations', 'classroom', 'analytics'];
    return validTabs.includes(lastSegment) ? lastSegment : 'dashboard';
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassroomClass[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [classroomActiveTab, setClassroomActiveTab] = useState('stream');
  const [inviteEmails, setInviteEmails] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Announcement states
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  // Material upload states
  const [showMaterialUpload, setShowMaterialUpload] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);

  // Create Class Modal States
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [classSubject, setClassSubject] = useState('Mathematics');
  const [createClassLoading, setCreateClassLoading] = useState(false);
  const [createClassError, setCreateClassError] = useState('');
  const [createClassSuccess, setCreateClassSuccess] = useState(false);

  // Loading states
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Dashboard stats
  const stats = {
    totalExams: exams.length,
    totalEvaluated: exams.reduce((sum, e) => sum + e.evaluated, 0),
    totalPending: exams.reduce((sum, e) => sum + e.pending, 0),
    averageScore: exams.length > 0
      ? (exams.reduce((sum, e) => sum + e.averageScore, 0) / exams.length).toFixed(1)
      : 0,
    totalClasses: classes.length,
    totalStudents: classes.reduce((sum, c) => sum + c.students, 0),
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Sync activeTab with URL changes
  useEffect(() => {
    const tabFromUrl = getActiveTabFromUrl();
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname]);

  // Fetch exams
  useEffect(() => {
    if (activeTab === 'evaluations') {
      fetchExams();
    }
  }, [activeTab]);

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const response = await fetch('/api/exams', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        const formattedExams = data.map((exam: any) => ({
          id: exam.id,
          name: exam.name,
          code: exam.code || 'N/A',
          subject: exam.subject || 'General',
          totalCandidates: exam.totalCandidates || 0,
          evaluated: Math.floor(Math.random() * 50) + 20,
          pending: Math.floor(Math.random() * 30),
          averageScore: (Math.random() * 100).toFixed(1),
          status: exam.status || 'PUBLISHED',
        }));
        setExams(formattedExams);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoadingExams(false);
    }
  };

  // Load announcements for the selected classroom
  const loadAnnouncements = async () => {
    if (!activeClass) return;

    try {
      setLoadingAnnouncements(true);
      console.log(`📥 Loading announcements for classroom: ${activeClass}`);

      const response = await announcementAPI.getAnnouncementsByClassroom(activeClass, {
        take: 20,
        skip: 0,
      });

      if (response.success && response.data) {
        setAnnouncements(response.data);
        console.log(`✅ Loaded ${response.data.length} announcements`);
      }
    } catch (error) {
      console.error('❌ Error loading announcements:', error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Handle announcement creation
  const handleAnnouncementCreated = (announcement: Announcement) => {
    console.log(`✅ Announcement created: ${announcement.id}`);
    setAnnouncements([announcement, ...announcements]);
    setShowAnnouncementForm(false);
    setNewPostContent('');
  };

  // Handle announcement deletion
  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      await announcementAPI.deleteAnnouncement(announcementId);
      setAnnouncements(announcements.filter(a => a.id !== announcementId));
      console.log(`✅ Announcement deleted: ${announcementId}`);
    } catch (error) {
      console.error('❌ Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  // Handle toggle pin
  const handleTogglePin = async (announcementId: string) => {
    try {
      const response = await announcementAPI.togglePin(announcementId);
      if (response.success && response.data) {
        setAnnouncements(
          announcements.map(a => (a.id === announcementId ? response.data : a))
        );
        console.log(`✅ Announcement pin toggled`);
      }
    } catch (error) {
      console.error('❌ Error toggling pin:', error);
      alert('Failed to toggle pin');
    }
  };

  // Handle material upload
  const handleMaterialUpload = async (data: { name: string; description: string; files: File[] }) => {
    if (!activeClass) return;

    try {
      // Upload each file and collect responses
      const uploadedFiles = [];
      
      for (const file of data.files) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const response = await classroomAPI.uploadMaterial(activeClass, formData);
          if (response.success && response.data) {
            uploadedFiles.push(response.data);
          }
        } catch (fileError) {
          console.error(`❌ Error uploading file ${file.name}:`, fileError);
          // Continue with next file
        }
      }

      if (uploadedFiles.length === 0) {
        throw new Error('Failed to upload any files');
      }

      // Add material to list
      const newMaterial = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        description: data.description,
        files: uploadedFiles,
        uploadedAt: new Date(),
        uploadedBy: userEmail,
      };

      setMaterials(prev => [newMaterial, ...prev]);
      setShowMaterialUpload(false);
      alert(`✅ Material uploaded successfully! ${uploadedFiles.length}/${data.files.length} files uploaded.`);
    } catch (error) {
      console.error('❌ Error uploading material:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload material');
    }
  };

  // Load announcements when classroom tab is active
  useEffect(() => {
    if (activeTab === 'classroom' && activeClass && classroomActiveTab === 'stream') {
      loadAnnouncements();
    }
  }, [activeClass, activeTab, classroomActiveTab]);

  // Create Class Handler
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    setCreateClassError('');
    if (!className.trim()) {
      setCreateClassError('Class name is required');
      return;
    }
    if (className.trim().length < 3) {
      setCreateClassError('Class name must be at least 3 characters');
      return;
    }
    if (!classSubject.trim()) {
      setCreateClassError('Subject is required');
      return;
    }

    setCreateClassLoading(true);
    try {
      // Call actual API
      const response = await classroomAPI.createClassroom({
        name: className,
        description: classDescription,
        subject: classSubject,
        metadata: {},
      });

      if (response.success && response.data) {
        const createdClassroom = response.data;

        // Create ClassroomClass format for frontend state
        const newClass: ClassroomClass = {
          id: createdClassroom.id,
          name: createdClassroom.name,
          description: createdClassroom.description || `${createdClassroom.subject} class`,
          students: createdClassroom.studentCount || 0,
          sections: (createdClassroom.sections || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            posts: s.name === 'Stream' ? [
              {
                id: '1',
                title: 'Welcome to class!',
                content: `Welcome to ${createdClassroom.name}! This is your main discussion forum.`,
                author: 'You',
                timestamp: 'Just now',
                attachments: [],
                isPinned: true,
                comments: [],
              },
            ] : [],
            assignments: [],
          })),
        };

        // Add to classes list
        setClasses([newClass, ...classes]);
        setActiveClass(newClass.id);

        // Show success and reset form
        setCreateClassSuccess(true);
        setClassName('');
        setClassDescription('');
        setClassSubject('Mathematics');

        // Close modal after brief success message
        setTimeout(() => {
          setShowCreateClassModal(false);
          setCreateClassSuccess(false);
        }, 1500);
      } else {
        setCreateClassError('Failed to create classroom');
      }
    } catch (error: any) {
      console.error('Failed to create class:', error);
      setCreateClassError(
        error.response?.data?.message ||
        error.message ||
        'Failed to create class. Please try again.'
      );
    } finally {
      setCreateClassLoading(false);
    }
  };

  // Load teacher classrooms from API
  useEffect(() => {
    if (activeTab === 'classroom') {
      loadTeacherClassrooms();
    }
  }, [activeTab]);

  // Load enrolled students when peoples tab is active
  useEffect(() => {
    if (classroomActiveTab === 'peoples' && activeClass) {
      loadEnrolledStudents();
    }
  }, [classroomActiveTab, activeClass]);

  const loadTeacherClassrooms = async () => {
    setLoadingClasses(true);
    try {
      const response = await classroomAPI.getTeacherClassrooms();
      if (response.success && response.data) {
        // Convert API classroom format to frontend format
        const convertedClasses: ClassroomClass[] = response.data.map((classroom: Classroom) => ({
          id: classroom.id,
          name: classroom.name,
          description: classroom.description || classroom.subject,
          students: classroom.studentCount,
          sections: (classroom.sections || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            posts: [],
            assignments: [],
          })),
        }));
        setClasses(convertedClasses);
        if (convertedClasses.length > 0 && !activeClass) {
          setActiveClass(convertedClasses[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load classrooms:', error);
      // Fallback to mock data if API fails
      setClasses([
        {
          id: '1',
          name: 'Advanced Mathematics - Section A',
          description: 'Complex Analysis and Calculus',
          students: 45,
          sections: [
            {
              id: '1-1',
              name: 'Stream',
              posts: [
                {
                  id: '1',
                  title: 'Welcome to class!',
                  content: 'Hello everyone, this is our main discussion forum. Feel free to ask questions and share resources.',
                  author: 'You',
                  timestamp: 'Today at 9:00 AM',
                  attachments: [],
                  isPinned: true,
                  comments: [
                    {
                      id: '1',
                      author: 'John Doe',
                      text: 'Looking forward to this class!',
                      timestamp: '5 hours ago',
                      likes: 2,
                    },
                  ],
                },
              ],
              assignments: [
                {
                  id: '1',
                  title: 'Chapter 1-2 Problem Set',
                  description: 'Solve problems 1-50 from the textbook',
                  dueDate: '2026-01-31',
                  submitted: 40,
                  total: 45,
                  attachments: [{ name: 'Problem_Set.pdf', type: 'pdf' }],
                },
              ],
            },
            {
              id: '1-2',
              name: 'Materials',
              posts: [],
              assignments: [],
            },
            {
              id: '1-3',
              name: 'Grades',
              posts: [],
              assignments: [],
            },
          ],
        },
      ]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadEnrolledStudents = async () => {
    setLoadingStudents(true);
    try {
      // Get both enrollments and invitations
      const [enrollmentsRes, invitationsRes] = await Promise.all([
        classroomAPI.getClassroomEnrollments(activeClass!),
        classroomAPI.getClassroomInvitations(activeClass!),
      ]);

      console.log('Enrollments Response:', enrollmentsRes);
      console.log('Invitations Response:', invitationsRes);

      // Convert enrollments to student format
      const enrolledStudents = (enrollmentsRes.data || []).map((enrollment: any) => ({
        id: enrollment.id,
        name: enrollment.candidate?.name || enrollment.candidateName || enrollment.candidateEmail?.split('@')[0] || 'Unknown',
        email: enrollment.candidate?.email || enrollment.candidateEmail || 'N/A',
        status: 'accepted',
        joinedDate: enrollment.enrolledAt 
          ? new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : null,
      }));

      // Convert pending invitations to student format
      const pendingStudents = (invitationsRes.data || [])
        .filter((inv: any) => inv.status === 'pending')
        .map((inv: any) => ({
          id: inv.id,
          name: inv.candidate?.name || inv.candidateName || inv.candidateEmail?.split('@')[0] || 'Unknown',
          email: inv.candidate?.email || inv.candidateEmail || 'N/A',
          status: 'pending',
          joinedDate: null,
        }));

      // Combine both lists
      const allStudents = [...enrolledStudents, ...pendingStudents];
      console.log('All Students:', allStudents);
      setEnrolledStudents(allStudents);
    } catch (error) {
      console.error('Failed to load enrolled students:', error);
      setEnrolledStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSendInvitations = async () => {
    console.log('📨 handleSendInvitations called');
    console.log('   activeClass:', activeClass);
    console.log('   inviteEmails:', inviteEmails.slice(0, 50) + '...');
    
    if (!inviteEmails.trim() || !activeClass) {
      alert('Please enter email addresses and select a classroom');
      return;
    }

    try {
      setCreateClassLoading(true);
      const emails = inviteEmails
        .split('\n')
        .map(email => email.trim())
        .filter(email => email.length > 0 && email.includes('@'));

      if (emails.length === 0) {
        alert('Please enter valid email addresses');
        return;
      }

      console.log('Sending invitations to:', emails);
      console.log('Classroom ID:', activeClass);
      console.log('Type of activeClass:', typeof activeClass);

      // Get enrolled students to check who has already joined
      const enrolledStudentsResponse = await classroomAPI.getClassroomEnrollments(activeClass);
      const enrolledEmails = enrolledStudentsResponse.data?.map((s: any) => s.candidateEmail?.toLowerCase()) || [];
      
      // Filter out emails that have already joined
      const emailsToInvite = emails.filter(email => 
        !enrolledEmails.includes(email.toLowerCase())
      );
      
      if (emailsToInvite.length === 0) {
        alert('All students have already joined this classroom.');
        setInviteEmails('');
        return;
      }
      
      if (emailsToInvite.length < emails.length) {
        const alreadyJoinedCount = emails.length - emailsToInvite.length;
        alert(`${alreadyJoinedCount} student(s) have already joined. Sending invitations to ${emailsToInvite.length} student(s).`);
      }

      // Call the API to send invitations
      const response = await classroomAPI.inviteCandidates(activeClass, emailsToInvite);
      
      if (response.success) {
        alert(`Invitations sent successfully to ${emailsToInvite.length} students!`);
        setInviteEmails('');
        // Reload students to see pending invitations
        await loadEnrolledStudents();
        // Reset to stream tab after successful invitation
        setClassroomActiveTab('stream');
      } else {
        alert('Failed to send invitations. Please try again.');
      }
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Error sending invitations';
      alert(`Error: ${errorMessage}`);
    } finally {
      setCreateClassLoading(false);
    }
  };

  const tabs: TabType[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
    { id: 'evaluations', label: 'Evaluations', icon: <FaFileAlt /> },
    { id: 'classroom', label: 'Classroom', icon: <FaChalkboard /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar /> },
  ];

  return (
    <div className="evaluator-container-v2">
      {/* Sidebar */}
      <aside className={`evaluator-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <FaGraduationCap />
            <span>Evalis</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {userEmail?.charAt(0).toUpperCase() || 'E'}
          </div>
          <div className="user-details">
            <h4>{userEmail?.split('@')[0] || 'Evaluator'}</h4>
            <p>Class Teacher</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                navigate(tab.id === 'dashboard' ? '/evaluator/dashboard' : `/evaluator/dashboard/${tab.id}`);
              }}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item">
            <FaCog /> Settings
          </button>
          <button className="nav-item logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="evaluator-main">
        {/* Header */}
        <header className="evaluator-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FaBars />
            </button>
            <h1>{tabs.find(t => t.id === activeTab)?.label}</h1>
          </div>
          <div className="header-right">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="notification-btn">
              <FaBell />
              <span className="badge">3</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="evaluator-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="tab-content dashboard-tab">
              {/* Welcome Section */}
              <div className="welcome-section">
                <div className="welcome-text">
                  <h2>Welcome back, {userEmail?.split('@')[0]}</h2>
                  <p>Here's your evaluation overview for today</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card evaluations">
                  <div className="stat-icon">
                    <FaFileAlt />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalExams}</h3>
                    <p>Total Exams</p>
                  </div>
                </div>
                <div className="stat-card evaluated">
                  <div className="stat-icon">
                    <FaCheckCircle />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalEvaluated}</h3>
                    <p>Evaluated</p>
                  </div>
                </div>
                <div className="stat-card pending">
                  <div className="stat-icon">
                    <FaHourglassHalf />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalPending}</h3>
                    <p>Pending</p>
                  </div>
                </div>
                <div className="stat-card average">
                  <div className="stat-icon">
                    <FaPercentage />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.averageScore}%</h3>
                    <p>Average Score</p>
                  </div>
                </div>
                <div className="stat-card classes">
                  <div className="stat-icon">
                    <FaChalkboard />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalClasses}</h3>
                    <p>Classes</p>
                  </div>
                </div>
                <div className="stat-card students">
                  <div className="stat-icon">
                    <FaUsers />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalStudents}</h3>
                    <p>Total Students</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button onClick={() => setActiveTab('evaluations')}>
                    <FaFileAlt /> Start Evaluation
                  </button>
                  <button onClick={() => setActiveTab('classroom')}>
                    <FaChalkboard /> Manage Classroom
                  </button>
                  <button>
                    <FaPlus /> Create Assignment
                  </button>
                  <button>
                    <FaUsers /> Message Students
                  </button>
                </div>
              </div>

              {/* Recent Evaluations */}
              {exams.length > 0 && (
                <div className="recent-section">
                  <h3>Recent Exams</h3>
                  <div className="exam-cards">
                    {exams.slice(0, 3).map(exam => (
                      <div key={exam.id} className="mini-exam-card">
                        <h4>{exam.name}</h4>
                        <p className="exam-code">{exam.code}</p>
                        <div className="exam-stats-mini">
                          <span><FaCheckCircle /> {exam.evaluated} evaluated</span>
                          <span><FaHourglassHalf /> {exam.pending} pending</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${(exam.evaluated / (exam.evaluated + exam.pending)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Evaluations Tab */}
          {activeTab === 'evaluations' && (
            <div className="tab-content evaluations-tab">
              <div className="evaluations-header">
                <h2>Answer Evaluations</h2>
                <div className="filter-controls">
                  <select className="filter-select">
                    <option>All Exams</option>
                    {exams.map(exam => (
                      <option key={exam.id} value={exam.id}>{exam.name}</option>
                    ))}
                  </select>
                  <select className="filter-select">
                    <option>All Status</option>
                    <option>Evaluated</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>

              {loadingExams ? (
                <div className="loading">Loading evaluations...</div>
              ) : exams.length === 0 ? (
                <div className="empty-state">
                  <FaFileAlt />
                  <h3>No exams available</h3>
                  <p>There are no exams to evaluate at the moment.</p>
                </div>
              ) : (
                <div className="exams-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Exam Name</th>
                        <th>Subject</th>
                        <th>Total Candidates</th>
                        <th>Evaluated</th>
                        <th>Pending</th>
                        <th>Average Score</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map(exam => (
                        <tr key={exam.id}>
                          <td className="exam-name">{exam.name}</td>
                          <td>{exam.subject}</td>
                          <td>{exam.totalCandidates}</td>
                          <td><span className="badge evaluated">{exam.evaluated}</span></td>
                          <td><span className="badge pending">{exam.pending}</span></td>
                          <td>{exam.averageScore}%</td>
                          <td><span className="status-badge">{exam.status}</span></td>
                          <td>
                            <button className="action-btn">
                              <FaEye /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Classroom Tab */}
          {activeTab === 'classroom' && (
            <div className="tab-content classroom-tab">
              <div className="classroom-container">
                {/* Classes Sidebar */}
                <aside className="classes-sidebar">
                  <div className="classes-header">
                    <h3>My Classes</h3>
                    <button className="btn-add-class" onClick={() => setShowCreateClassModal(true)}>
                      <FaPlus /> New Class
                    </button>
                  </div>

                  <div className="classes-list">
                    {loadingClasses ? (
                      <div className="loading-small">Loading...</div>
                    ) : (
                      classes.map(cls => (
                        <button
                          key={cls.id}
                          className={`class-item ${activeClass === cls.id ? 'active' : ''}`}
                          onClick={() => setActiveClass(cls.id)}
                        >
                          <div className="class-icon">
                            <FaBook />
                          </div>
                          <div className="class-info">
                            <h4>{cls.name}</h4>
                            <p>{cls.students} students</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </aside>

                {/* Classroom Content */}
                <section className="classroom-content">
                  {activeClass && classes.find(c => c.id === activeClass) ? (
                    <>
                      {/* Classroom Header */}
                      <div className="classroom-header">
                        <div className="class-cover">
                          <div className="cover-gradient"></div>
                          <div className="class-title-overlay">
                            <h2>{classes.find(c => c.id === activeClass)?.name}</h2>
                            <p>{classes.find(c => c.id === activeClass)?.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Classroom Tabs */}
                      <div className="classroom-tabs">
                        <button
                          className={`classroom-tab-btn ${classroomActiveTab === 'stream' ? 'active' : ''}`}
                          onClick={() => setClassroomActiveTab('stream')}
                        >
                          Stream
                        </button>
                        <button
                          className={`classroom-tab-btn ${classroomActiveTab === 'materials' ? 'active' : ''}`}
                          onClick={() => setClassroomActiveTab('materials')}
                        >
                          Materials
                        </button>
                        <button
                          className={`classroom-tab-btn ${classroomActiveTab === 'assignments' ? 'active' : ''}`}
                          onClick={() => setClassroomActiveTab('assignments')}
                        >
                          Assignments
                        </button>
                        <button
                          className={`classroom-tab-btn ${classroomActiveTab === 'grades' ? 'active' : ''}`}
                          onClick={() => setClassroomActiveTab('grades')}
                        >
                          Grades
                        </button>
                        <button
                          className={`classroom-tab-btn ${classroomActiveTab === 'peoples' ? 'active' : ''}`}
                          onClick={() => setClassroomActiveTab('peoples')}
                        >
                          Peoples
                        </button>
                        <button
                          className={`classroom-tab-btn ${classroomActiveTab === 'invite' ? 'active' : ''}`}
                          onClick={() => setClassroomActiveTab('invite')}
                        >
                          Invite
                        </button>
                      </div>

                      {/* Stream Content */}
                      {classroomActiveTab === 'stream' && (
                        <div className="classroom-stream">
                          {/* Create Announcement Button */}
                          <div className="create-post">
                            <button
                              className="btn-create-announcement"
                              onClick={() => setShowAnnouncementForm(true)}
                            >
                              <FaPlus /> Create Announcement
                            </button>
                          </div>

                          {/* Loading State */}
                          {loadingAnnouncements && (
                            <div className="loading-state">
                              <FaSpinner className="spinner" />
                              <p>Loading announcements...</p>
                            </div>
                          )}

                          {/* Announcements Feed */}
                          {!loadingAnnouncements && activeClass && (
                            <AnnouncementFeed
                              announcements={announcements}
                              isTeacher={true}
                              onDelete={handleDeleteAnnouncement}
                              onTogglePin={handleTogglePin}
                              onEdit={(announcement) => {
                                console.log('Edit announcement:', announcement);
                                // TODO: Implement edit functionality
                              }}
                            />
                          )}

                          {/* Empty State */}
                          {!loadingAnnouncements && announcements.length === 0 && (
                            <div className="empty-state">
                              <FaNewspaper size={48} />
                              <h3>No announcements yet</h3>
                              <p>Create an announcement to get started!</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Materials Tab */}
                      {classroomActiveTab === 'materials' && (
                        <div className="classroom-materials">
                          <div className="materials-upload">
                            <button 
                              className="upload-btn"
                              onClick={() => setShowMaterialUpload(true)}
                            >
                              <FaUpload /> Upload Material
                            </button>
                          </div>
                          <div className="materials-grid">
                            {materials.length > 0 ? (
                              <div className="materials-list">
                                {materials.map(material => (
                                  <div key={material.id} className="material-card">
                                    <div className="material-header">
                                      <h3>{material.name}</h3>
                                      <p className="material-desc">{material.description}</p>
                                    </div>
                                    <div className="material-files">
                                      {material.files.map((file: any, idx: number) => (
                                        <a
                                          key={idx}
                                          href={file.url}
                                          download
                                          className="file-link"
                                        >
                                          <FaFile /> {file.name} ({formatFileSize(file.size)})
                                        </a>
                                      ))}
                                    </div>
                                    <p className="material-meta">
                                      Uploaded on {new Date(material.uploadedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="empty-state">
                                <FaFolder />
                                <h3>No materials yet</h3>
                                <p>Upload course materials to get started</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Assignments Tab */}
                      {classroomActiveTab === 'assignments' && (
                        <div className="classroom-assignments">
                          <div className="assignments-header">
                            <button className="btn-create-assignment">
                              <FaPlus /> Create Assignment
                            </button>
                          </div>

                          <div className="assignments-list">
                            {classes
                              .find(c => c.id === activeClass)
                              ?.sections[0]?.assignments.map(assignment => (
                                <div key={assignment.id} className="assignment-card">
                                  <div className="assignment-header">
                                    <h4>{assignment.title}</h4>
                                    <span className="due-date">
                                      <FaCalendar /> Due: {assignment.dueDate}
                                    </span>
                                  </div>
                                  <p className="assignment-description">{assignment.description}</p>
                                  <div className="submission-progress">
                                    <div className="progress-bar">
                                      <div
                                        className="progress-fill"
                                        style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                                      ></div>
                                    </div>
                                    <span className="progress-text">
                                      {assignment.submitted}/{assignment.total} submitted
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Grades Tab */}
                      {classroomActiveTab === 'grades' && (
                        <div className="classroom-grades">
                          <div className="empty-state">
                            <FaChartBar />
                            <h3>Grades will appear here</h3>
                            <p>Create assignments and grade submissions to see grades here</p>
                          </div>
                        </div>
                      )}

                      {/* Peoples Tab */}
                      {classroomActiveTab === 'peoples' && (
                        <div className="classroom-peoples">
                          <div className="peoples-header">
                            <h3>Enrolled Students</h3>
                            <p className="student-count">{enrolledStudents.length} students</p>
                          </div>
                          {loadingStudents ? (
                            <div className="loading-state">
                              <div className="spinner"></div>
                              <p>Loading students...</p>
                            </div>
                          ) : enrolledStudents.length > 0 ? (
                            <div className="students-list">
                              {enrolledStudents.map((student) => (
                                <div key={student.id} className="student-item">
                                  <div className="student-avatar">
                                    {student.name ? student.name[0].toUpperCase() : 'S'}
                                  </div>
                                  <div className="student-info">
                                    <h4>{student.name || 'Unknown'}</h4>
                                    <p className="student-email">{student.email}</p>
                                    <p className="student-status">
                                      <span className={`status-badge ${student.status || 'accepted'}`}>
                                        {student.status === 'accepted' ? '✓ Accepted' : student.status === 'pending' ? '⏳ Pending' : 'Rejected'}
                                      </span>
                                    </p>
                                  </div>
                                  <div className="student-date">
                                    <small>{student.joinedDate || 'N/A'}</small>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="empty-state">
                              <FaUsers />
                              <h3>No students yet</h3>
                              <p>Invite students to join your classroom</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Invite Tab */}
                      {classroomActiveTab === 'invite' && (
                        <div className="classroom-invite">
                          <div className="invite-container">
                            <div className="invite-header">
                              <button 
                                className="btn-back" 
                                onClick={() => setClassroomActiveTab('stream')}
                                title="Go back"
                              >
                                <FaArrowLeft /> Back
                              </button>
                              <h3>Invite Students</h3>
                            </div>
                            <p className="invite-subtitle">Add students to your classroom by entering their email addresses</p>
                            
                            <div className="invite-form">
                              <div className="form-group">
                                <label htmlFor="invite-emails">Email Addresses</label>
                                <textarea
                                  id="invite-emails"
                                  placeholder="Enter email addresses (one per line)&#10;e.g.,&#10;student1@example.com&#10;student2@example.com"
                                  value={inviteEmails}
                                  onChange={(e) => setInviteEmails(e.target.value)}
                                  className="invite-textarea"
                                  rows={6}
                                />
                                <small className="helper-text">Separate multiple emails with new lines</small>
                              </div>
                              
                              <button 
                                type="button"
                                className="btn-invite-submit" 
                                onClick={handleSendInvitations}
                                disabled={createClassLoading || !inviteEmails.trim()}
                              >
                                {createClassLoading ? (
                                  <>
                                    <div className="spinner-small"></div> Sending...
                                  </>
                                ) : (
                                  <>
                                    <FaPaperPlane /> Send Invitations
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="invite-info">
                              <h4>How it works</h4>
                              <ul>
                                <li>Enter student email addresses in the field above</li>
                                <li>Click "Send Invitations" to send them an invite link</li>
                                <li>Students can accept or reject the invitation</li>
                                <li>Check the "Peoples" tab to see invitation status</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-class-selected">
                      <FaChalkboard />
                      <h3>Select a class to continue</h3>
                      <p>Choose a class from the sidebar or create a new one</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* Material Upload Form Modal */}
          {showMaterialUpload && activeClass && (
            <MaterialUploadForm
              classroomId={activeClass}
              onSubmit={handleMaterialUpload}
              onCancel={() => setShowMaterialUpload(false)}
            />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="tab-content analytics-tab">
              <div className="analytics-container">
                <h2>Performance Analytics</h2>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h3>Evaluation Progress</h3>
                    <div className="placeholder">
                      Chart will be displayed here
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>Student Performance</h3>
                    <div className="placeholder">
                      Chart will be displayed here
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>Subject-wise Distribution</h3>
                    <div className="placeholder">
                      Chart will be displayed here
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>Time Spent Analysis</h3>
                    <div className="placeholder">
                      Chart will be displayed here
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Class Modal */}
      {showCreateClassModal && (
        <div className="modal-overlay" onClick={() => !createClassLoading && setShowCreateClassModal(false)}>
          <div className="create-class-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Class</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => !createClassLoading && setShowCreateClassModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="create-class-form">
              {createClassError && (
                <div className="form-error">
                  <p>{createClassError}</p>
                </div>
              )}

              {createClassSuccess && (
                <div className="form-success">
                  <p>✓ Class created successfully!</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="className">Class Name *</label>
                <input
                  id="className"
                  type="text"
                  placeholder="e.g., Advanced Calculus - Section A"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  disabled={createClassLoading}
                  maxLength={100}
                  required
                />
                <span className="char-count">{className.length}/100</span>
              </div>

              <div className="form-group">
                <label htmlFor="classSubject">Subject *</label>
                <select
                  id="classSubject"
                  value={classSubject}
                  onChange={(e) => setClassSubject(e.target.value)}
                  disabled={createClassLoading}
                  required
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Economics">Economics</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="classDescription">Description (Optional)</label>
                <textarea
                  id="classDescription"
                  placeholder="Add a brief description of your class..."
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  disabled={createClassLoading}
                  maxLength={500}
                  rows={4}
                />
                <span className="char-count">{classDescription.length}/500</span>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateClassModal(false)}
                  disabled={createClassLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={createClassLoading}
                >
                  {createClassLoading ? (
                    <>
                      <div className="spinner-small" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPlus /> Create Class
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Form Modal */}
      {showAnnouncementForm && activeClass && (
        <AnnouncementForm
          classroomId={activeClass}
          onAnnouncementCreated={handleAnnouncementCreated}
          onClose={() => setShowAnnouncementForm(false)}
        />
      )}

      {/* Material Upload Form Modal */}
      {showMaterialUpload && activeClass && (
        <MaterialUploadForm
          classroomId={activeClass}
          onSubmit={handleMaterialUpload}
          onCancel={() => setShowMaterialUpload(false)}
        />
      )}
    </div>
  );
};

export default EvaluatorDashboardV2;
