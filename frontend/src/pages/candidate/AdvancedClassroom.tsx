import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { candidateClassroomAPI, announcementAPI } from '../../services/classroomAPI';
import type { Announcement } from '../../services/classroomAPI';
import {
  FaHome, FaBook, FaClipboardList, FaChartBar, FaUsers, FaCog,
  FaPlus, FaThumbtack, FaComments, FaHeart, FaShare, FaEllipsisV,
  FaCalendar, FaClock, FaCheckCircle, FaTimesCircle, FaUpload,
  FaFile, FaLink, FaYoutube, FaFileAlt, FaCode, FaFilter,
  FaSearch, FaDownload, FaEye, FaRobot, FaLightbulb, FaTrophy,
  FaFire, FaAward, FaGraduationCap, FaBell, FaMoon, FaUniversalAccess,
  FaChartLine as FaBarChart, FaUserCheck, FaCalendarCheck, FaTasks, FaChartLine,
  FaComments as FaMessage, FaLock, FaThumbsUp, FaReply, FaArchive,
  FaTrash, FaEdit, FaSave, FaBold, FaItalic, FaCode as FaCodeBlock,
  FaSquareRootAlt, FaListUl, FaImage, FaVideo, FaPaperclip, FaChevronDown,
  FaFolder, FaNewspaper, FaGraduationCap as FaSchool, FaExclamationCircle, FaCheckDouble,
  FaQuestion, FaEnvelope, FaArrowLeft, FaSpinner, FaChalkboard
} from 'react-icons/fa';
import CandidateInvitationCenter from '../../components/CandidateInvitationCenter';
import AnnouncementForm from '../../components/AnnouncementForm';
import AnnouncementFeed from '../../components/AnnouncementFeed';
import './AdvancedClassroom.css';

// Classroom interface from API
interface ClassroomData {
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

interface ClassroomSection {
  id: string;
  name: string;
}

// Types
interface ClassroomPost {
  id: string;
  type: 'announcement' | 'assignment' | 'quiz' | 'poll' | 'resource';
  title: string;
  content: string;
  author: string;
  authorRole: 'teacher' | 'student';
  timestamp: string;
  isPinned: boolean;
  isScheduled?: boolean;
  scheduledFor?: string;
  attachments: Attachment[];
  reactions: Reaction[];
  replies: Reply[];
  mentions: string[];
  tags: string[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'link' | 'youtube' | 'drive' | 'image';
  url: string;
  preview?: string;
}

interface Reaction {
  emoji: string;
  users: string[];
}

interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  mentions: string[];
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  points: number;
  submissionType: 'file' | 'text' | 'code' | 'mcq' | 'mixed';
  rubric?: Rubric;
  submissions: Submission[];
  isLateSubmissionAllowed: boolean;
  autoGradeConfig?: AutoGradeConfig;
  attachedResources: Attachment[];
}

interface Rubric {
  id: string;
  name: string;
  criteria: RubricCriterion[];
}

interface RubricCriterion {
  id: string;
  name: string;
  maxPoints: number;
  description: string;
}

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  content: string;
  submittedAt: string;
  isLate: boolean;
  status: 'submitted' | 'graded' | 'missing';
  grade?: number;
  feedback?: string;
  plagiarismScore?: number;
  versions: SubmissionVersion[];
}

interface SubmissionVersion {
  timestamp: string;
  content: string;
}

interface AutoGradeConfig {
  enabled: boolean;
  rubric: Rubric;
  plagiarismCheck: boolean;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  scheduledFor: string;
  duration: number;
  totalMarks: number;
  totalQuestions: number;
  questionTypes: string[];
  isProcored: boolean;
  hasAdaptiveDifficulty: boolean;
  students: ExamStudent[];
}

interface ExamStudent {
  studentId: string;
  studentName: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  score?: number;
  timeTaken?: number;
}

interface StudentProgressData {
  studentId: string;
  studentName: string;
  assignmentCompletion: number;
  averageScore: number;
  strengths: string[];
  weaknesses: string[];
  attendanceRate: number;
  lastActive: string;
}

interface ClassroomTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const AdvancedClassroom: React.FC = () => {
  const { role, userEmail } = useAuth();
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isStudent = role === 'CANDIDATE' || role === 'candidate';
  const isTeacher = role === 'TEACHER' || role === 'teacher' || role === 'EVALUATOR' || role === 'evaluator';
  
  // Determine the correct path prefix based on the current URL being accessed
  // If already on /evaluator/classroom path, stay on evaluator path
  // If on /candidate/classroom path, stay on candidate path
  const isCurrentlyOnEvaluatorPath = location.pathname.includes('/evaluator/classroom/');
  // For candidates, always use candidate path. For teachers/evaluators, use evaluator path or stay on current.
  const shouldUseEvaluatorPath = isStudent ? false : isCurrentlyOnEvaluatorPath;
  
  // Determine active tab from URL path
  const getActiveTabFromUrl = (): string => {
    const pathname = window.location.pathname;
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    
    // Check if last segment is a section name, otherwise default to 'stream'
    const validSections = ['stream', 'materials', 'classwork', 'exams', 'grades', 'analytics', 'people', 'settings'];
    return validSections.includes(lastSegment) ? lastSegment : 'stream';
  };
  
  // Classroom Management
  const [enrolledClassrooms, setEnrolledClassrooms] = useState<ClassroomData[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomData | null>(null);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [showClassroomSelector, setShowClassroomSelector] = useState(false);
  
  const [activeTab, setActiveTab] = useState<string>(getActiveTabFromUrl());
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  
  // Announcement Management
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  
  // Debug log on mount
  React.useEffect(() => {
    console.log('✅ AdvancedClassroom component mounted successfully');
    console.log('🔍 Classroom ID from URL:', classroomId);
    console.log('🔍 Initial activeTab:', getActiveTabFromUrl());
  }, [classroomId]);
  
  React.useEffect(() => {
    console.log('📌 Active tab changed to:', activeTab);
  }, [activeTab]);

  // Sync active tab from URL
  useEffect(() => {
    const tabFromUrl = getActiveTabFromUrl();
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [window.location.pathname]);

  // If no section in URL, redirect to add /stream
  useEffect(() => {
    const pathname = location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    
    // Check if there's a section at the end
    const validSections = ['stream', 'materials', 'classwork', 'exams', 'grades', 'analytics', 'people', 'settings'];
    const lastSegment = segments[segments.length - 1];
    
    // If the last segment is not a valid section (e.g., just /classroom/1 or /evaluator/classroom/1)
    if (!validSections.includes(lastSegment)) {
      // Redirect to add /stream section based on user role
      if (shouldUseEvaluatorPath) {
        navigate(`/evaluator/classroom/${classroomId}/stream`);
      } else {
        navigate(`/candidate/classroom/${classroomId}/stream`);
      }
    }
  }, [classroomId, location.pathname, shouldUseEvaluatorPath, navigate]);

  // Load announcements when classroom is selected
  useEffect(() => {
    if (selectedClassroom && activeTab === 'stream') {
      loadAnnouncements();
    }
  }, [selectedClassroom, activeTab]);

  const loadAnnouncements = async () => {
    if (!selectedClassroom) return;
    
    try {
      setLoadingAnnouncements(true);
      console.log(`📥 Loading announcements for classroom: ${selectedClassroom.id}`);
      
      const response = await announcementAPI.getStudentAnnouncements(selectedClassroom.id, {
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

  const handleAnnouncementCreated = (announcement: Announcement) => {
    console.log(`✅ Announcement created: ${announcement.id}`);
    setAnnouncements([announcement, ...announcements]);
    setShowAnnouncementForm(false);
  };

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

  const handleLikeAnnouncement = async (announcementId: string) => {
    try {
      const response = await announcementAPI.likeAnnouncement(announcementId);
      if (response.success && response.data) {
        setAnnouncements(
          announcements.map(a => (a.id === announcementId ? response.data : a))
        );
        console.log(`✅ Announcement liked`);
      }
    } catch (error) {
      console.error('❌ Error liking announcement:', error);
      alert('Failed to like announcement');
    }
  };

  const handleCommentAnnouncement = async (announcementId: string) => {
    const comment = prompt('Enter your comment:');
    if (!comment) return;

    try {
      const response = await announcementAPI.addComment(announcementId, comment);
      if (response.success && response.data) {
        setAnnouncements(
          announcements.map(a => (a.id === announcementId ? response.data : a))
        );
        console.log(`✅ Comment added`);
      }
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      alert('Failed to add comment');
    }
  };
  
  const [posts, setPosts] = useState<ClassroomPost[]>([]);

  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [exams, setExams] = useState<Exam[]>([]);

  const [studentProgress, setStudentProgress] = useState<StudentProgressData[]>([]);

  const [showRichEditor, setShowRichEditor] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'announcement' | 'assignment' | 'quiz' | 'poll' | 'resource'>('announcement');
  const [darkMode, setDarkMode] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showInvitationCenter, setShowInvitationCenter] = useState(false);
  
  // Subject Selection for Header
  const [candidateSubjects, setCandidateSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // Computed values from selected classroom
  const classTitle = selectedClassroom?.name || 'Select a Classroom';
  const classDescription = selectedClassroom?.description || '';
  const classCover = 'gradient';

  // Load candidate classrooms on mount
  useEffect(() => {
    loadEnrolledClassrooms();
  }, [userEmail]);

  // When classrooms are loaded and classroomId is in URL, select that classroom
  useEffect(() => {
    if (classroomId && enrolledClassrooms.length > 0) {
      const classroom = enrolledClassrooms.find(c => c.id === classroomId);
      if (classroom && classroom.id !== selectedClassroom?.id) {
        console.log(`🎯 Selecting classroom from URL: ${classroomId}`);
        setSelectedClassroom(classroom);
      }
    }
  }, [classroomId, enrolledClassrooms]);

  // Load subjects from enrolled classrooms whenever they change
  useEffect(() => {
    if (enrolledClassrooms && enrolledClassrooms.length > 0) {
      // Extract unique subjects from enrolled classrooms
      const subjects = Array.from(new Set(enrolledClassrooms.map(c => c.subject).filter(Boolean)));
      setCandidateSubjects(subjects);
      
      // Auto-select first subject if not already selected
      if (subjects.length > 0 && !selectedSubject) {
        setSelectedSubject(subjects[0]);
      }
    }
  }, [enrolledClassrooms]);

  const loadEnrolledClassrooms = async () => {
    if (!userEmail) return;
    
    setLoadingClassrooms(true);
    try {
      const response = await candidateClassroomAPI.getCandidateClassrooms(userEmail);
      if (response.success && response.data && response.data.length > 0) {
        setEnrolledClassrooms(response.data);
        // Auto-select first classroom
        setSelectedClassroom(response.data[0]);
      } else {
        setEnrolledClassrooms([]);
        setSelectedClassroom(null);
      }
    } catch (error) {
      console.error('Error loading enrolled classrooms:', error);
      setEnrolledClassrooms([]);
      setSelectedClassroom(null);
    } finally {
      setLoadingClassrooms(false);
    }
  };

  const handleSelectClassroom = (classroom: ClassroomData) => {
    setSelectedClassroom(classroom);
    setShowClassroomSelector(false);
    setActiveTab('stream');
    // Navigate to the new classroom's stream tab
    if (shouldUseEvaluatorPath) {
      navigate(`/evaluator/classroom/${classroom.id}/stream`);
    } else {
      navigate(`/candidate/classroom/${classroom.id}/stream`);
    }
  };

  const handleInvitationAccepted = () => {
    // Reload classrooms when a new invitation is accepted
    loadEnrolledClassrooms();
  };
  const [materials, setMaterials] = useState<ClassroomPost[]>([]);

  const allTabs: ClassroomTab[] = [
    { id: 'stream', label: 'Updates', icon: <FaNewspaper /> },
    { id: 'materials', label: 'Materials', icon: <FaFolder /> },
    { id: 'classwork', label: 'Coursework', icon: <FaClipboardList /> },
    { id: 'exams', label: 'Exams', icon: <FaBook /> },
    { id: 'grades', label: 'Grades', icon: <FaChartBar /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartLine /> },
    { id: 'people', label: 'People', icon: <FaUsers /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
  ];
  
  // Filter tabs based on role - students should only see: Updates, Materials, Coursework, Exams, Grades
  const tabs = isStudent 
    ? allTabs.filter(t => ['stream', 'materials', 'classwork', 'exams', 'grades'].includes(t.id))
    : allTabs;

  const handleCreatePost = () => {
    if (newPostTitle && newPostContent) {
      const newPost: ClassroomPost = {
        id: Date.now().toString(),
        type: newPostType,
        title: newPostTitle,
        content: newPostContent,
        author: 'You',
        authorRole: 'teacher',
        timestamp: 'Just now',
        isPinned: false,
        attachments: [],
        reactions: [],
        replies: [],
        mentions: [],
        tags: [],
      };
      setPosts([newPost, ...posts]);
      setNewPostTitle('');
      setNewPostContent('');
      setShowRichEditor(false);
    }
  };

  const handlePinPost = (postId: string) => {
    setPosts(posts.map(p => ({
      ...p,
      isPinned: p.id === postId ? !p.isPinned : p.isPinned,
    })));
  };

  // Filter content based on selected subject and classroom
  const getFilteredPosts = () => {
    let filtered = posts;
    if (selectedSubject && selectedSubject !== '') {
      filtered = posts.filter(post => selectedClassroom?.subject === selectedSubject);
    }
    return filtered;
  };

  const getFilteredMaterials = () => {
    let filtered = materials;
    if (selectedSubject && selectedSubject !== '') {
      filtered = materials.filter(mat => selectedClassroom?.subject === selectedSubject);
    }
    return filtered;
  };

  const getFilteredAssignments = () => {
    let filtered = assignments;
    if (selectedSubject && selectedSubject !== '') {
      filtered = assignments.filter(assign => selectedClassroom?.subject === selectedSubject);
    }
    return filtered;
  };

  const getFilteredExams = () => {
    let filtered = exams;
    if (selectedSubject && selectedSubject !== '') {
      filtered = exams.filter(exam => selectedClassroom?.subject === selectedSubject);
    }
    return filtered;
  };

  const handleAddReaction = (postId: string, emoji: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const reactionIndex = p.reactions.findIndex(r => r.emoji === emoji);
        if (reactionIndex > -1) {
          if (!p.reactions[reactionIndex].users.includes('You')) {
            p.reactions[reactionIndex].users.push('You');
          }
        } else {
          p.reactions.push({ emoji, users: ['You'] });
        }
      }
      return p;
    }));
  };

  return (
    <div className={`advanced-classroom ${darkMode ? 'dark-mode' : ''}`}>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          {/* Back Button */}
          <button 
            className="icon-btn back-btn"
            onClick={() => navigate('/candidate/dashboard')}
            title="Back to Dashboard"
          >
            <FaArrowLeft />
          </button>

          {/* Classroom Selector */}
          <div className="classroom-selector-wrapper">
            <button 
              className="classroom-selector-btn"
              onClick={() => setShowClassroomSelector(!showClassroomSelector)}
              title="Select a classroom"
            >
              <div className="selector-content">
                <span className="selector-label">{classTitle}</span>
                <FaChevronDown className="chevron-icon" />
              </div>
            </button>

            {/* Dropdown Menu - Horizontal */}
            {showClassroomSelector && (
              <div className="classroom-dropdown-horizontal">
                {loadingClassrooms ? (
                  <div className="dropdown-loading">
                    <FaSpinner className="spinning" />
                    <span>Loading classrooms...</span>
                  </div>
                ) : enrolledClassrooms.length > 0 ? (
                  <div className="dropdown-list-horizontal">
                    {enrolledClassrooms.map((classroom) => (
                      <button
                        key={classroom.id}
                        className={`dropdown-item-horizontal ${selectedClassroom?.id === classroom.id ? 'active' : ''}`}
                        onClick={() => handleSelectClassroom(classroom)}
                        title={classroom.name}
                      >
                        <span className="item-name-only">{classroom.name}</span>
                        {selectedClassroom?.id === classroom.id && (
                          <FaCheckCircle className="check-icon" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="dropdown-empty">
                    <FaChalkboard />
                    <p>No classrooms yet</p>
                    <small>Join a classroom to get started</small>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="toolbar-right">
          <button 
            className="icon-btn invitation-btn" 
            onClick={() => setShowInvitationCenter(true)} 
            title="Course Invitations"
          >
            <FaBell /> 
          </button>
          <button className="icon-btn" onClick={() => setShowAIAssistant(!showAIAssistant)} title="AI Assistant (Beta)">
            <FaRobot /> AI Assistant
          </button>
          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title="Dark Mode">
            <FaMoon />
          </button>
          <button className="icon-btn" title="Settings">
            <FaCog />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="classroom-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              console.log(`🔗 Tab clicked: ${tab.id}`);
              console.log(`📍 Current classroomId: ${classroomId}`);
              console.log(`👤 shouldUseEvaluatorPath: ${shouldUseEvaluatorPath}`);
              
              if (!classroomId) {
                console.error(`❌ No classroomId available!`);
                alert('Please select a classroom first');
                return;
              }
              
              setActiveTab(tab.id);
              // Navigate to the new route with the section
              if (shouldUseEvaluatorPath) {
                const newPath = `/evaluator/classroom/${classroomId}/${tab.id}`;
                console.log(`🚀 Navigating to: ${newPath}`);
                navigate(newPath);
              } else {
                const newPath = `/candidate/classroom/${classroomId}/${tab.id}`;
                console.log(`🚀 Navigating to: ${newPath}`);
                navigate(newPath);
              }
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* AI Assistant Sidebar */}
      {showAIAssistant && (
        <div className="ai-assistant-panel">
          <div className="ai-header">
            <h3><FaRobot /> AI Assistant</h3>
            <button onClick={() => setShowAIAssistant(false)}>✕</button>
          </div>
          <div className="ai-content">
            {isStudent ? (
              <>
                <div className="ai-section">
                  <h4>📚 For Students:</h4>
                  <button className="ai-action-btn">
                    <FaLightbulb /> Explain This Topic
                  </button>
                  <button className="ai-action-btn">
                    <FaLightbulb /> Summarize Class
                  </button>
                  <button className="ai-action-btn">
                    <FaLightbulb /> Generate Practice Questions
                  </button>
                  <button className="ai-action-btn">
                    <FaLightbulb /> Get Assignment Help
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="ai-section">
                  <h4>👨‍🏫 For Teachers:</h4>
                  <button className="ai-action-btn">
                    <FaLightbulb /> Generate Assignment
                  </button>
                  <button className="ai-action-btn">
                    <FaLightbulb /> Create Quiz from Syllabus
                  </button>
                  <button className="ai-action-btn">
                    <FaLightbulb /> Draft Announcement
                  </button>
                  <button className="ai-action-btn">
                    <FaLightbulb /> Suggest Weak Students
                  </button>
                  <button className="ai-action-btn">
                    <FaLightbulb /> Create Study Guide
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="classroom-content">
        {/* Stream Tab - Announcements */}
        {activeTab === 'stream' && (
          <div className="tab-pane stream-pane">
            {/* Teacher Announcement Creation Button */}
            {isTeacher && selectedClassroom && (
              <button
                className="btn-create-announcement"
                onClick={() => setShowAnnouncementForm(true)}
              >
                <FaPlus /> Create Announcement
              </button>
            )}

            {/* Loading State */}
            {loadingAnnouncements && (
              <div className="loading-state">
                <FaSpinner className="spinner" />
                <p>Loading announcements...</p>
              </div>
            )}

            {/* Announcements Feed */}
            {!loadingAnnouncements && selectedClassroom && (
              <AnnouncementFeed
                announcements={announcements}
                isTeacher={isTeacher}
                onDelete={handleDeleteAnnouncement}
                onTogglePin={handleTogglePin}
                onLike={handleLikeAnnouncement}
                onComment={handleCommentAnnouncement}
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
                <p>
                  {isStudent
                    ? 'Your instructor will post announcements here.'
                    : 'Create an announcement to get started!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="tab-pane materials-pane">
            <div className="materials-header">
              <h2>Course Materials</h2>
            </div>

            {getFilteredMaterials().length > 0 ? (
              <div className="materials-grid-container">
                {getFilteredMaterials().map(material => (
                  <div key={material.id} className="material-card">
                    <div className="material-header">
                      <div className="material-icon">
                        {material.attachments.length > 0 && material.attachments[0].type === 'youtube' && <FaYoutube />}
                        {material.attachments.length > 0 && material.attachments[0].type === 'file' && <FaFile />}
                        {material.attachments.length > 0 && material.attachments[0].type === 'image' && <FaImage />}
                      </div>
                      {!isStudent && (
                        <button className="material-menu">⋮</button>
                      )}
                    </div>
                    <h3>{material.title}</h3>
                    <p className="material-desc">{material.content}</p>
                    <div className="material-meta">
                      <span><FaClock /> {material.timestamp}</span>
                      <span>By: {material.author}</span>
                    </div>
                    {material.attachments.length > 0 && (
                      <div className="material-attachments">
                        {material.attachments.map(att => (
                          <a key={att.id} href={att.url} className="material-attachment-link">
                            <FaDownload /> {att.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaFolder />
                <h3>No materials yet</h3>
                <p>Course materials will be uploaded here by your instructor</p>
              </div>
            )}
          </div>
        )}

        {/* Classwork Tab */}
        {activeTab === 'classwork' && (
          <div className="tab-pane classwork-pane">
            <div className="classwork-header">
              <h2>Assignments & Submissions</h2>
              {!isStudent && (
                <button className="btn-create-assignment">
                  <FaPlus /> Create Assignment
                </button>
              )}
            </div>

            <div className="assignments-container">
              {getFilteredAssignments().map(assignment => (
                <div key={assignment.id} className="assignment-panel">
                  <div className="assignment-top">
                    <div className="assignment-info">
                      <h3>{assignment.title}</h3>
                      <p className="assignment-desc">{assignment.description}</p>
                      <div className="assignment-meta">
                        <span><FaCalendar /> Due: {assignment.dueDate}</span>
                        <span><FaAward /> {assignment.points} points</span>
                        <span className="submission-type">{assignment.submissionType}</span>
                      </div>
                    </div>
                    <button className="btn-expand-details">
                      <FaChevronDown />
                    </button>
                  </div>

                  {!isStudent && (
                    <div className="submissions-tracker">
                      <div className="submission-stat">
                        <div className="stat-value">{assignment.submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length}</div>
                        <div className="stat-label">Submitted</div>
                      </div>
                      <div className="submission-stat">
                        <div className="stat-value">{assignment.submissions.filter(s => s.isLate).length}</div>
                        <div className="stat-label">Late</div>
                      </div>
                      <div className="submission-stat">
                        <div className="stat-value">{45 - assignment.submissions.length}</div>
                        <div className="stat-label">Missing</div>
                      </div>
                      <div className="submission-stat">
                        <div className="stat-value">
                          {assignment.submissions.filter(s => s.grade).length > 0
                            ? Math.round(assignment.submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / assignment.submissions.filter(s => s.grade).length)
                            : '-'}
                        </div>
                        <div className="stat-label">Avg Grade</div>
                      </div>
                    </div>
                  )}

                  {!isStudent && (
                    <div className="submissions-list">
                      {assignment.submissions.map(submission => (
                        <div key={submission.id} className="submission-item">
                          <div className="submission-student">
                            <div className="student-avatar">{submission.studentName[0]}</div>
                          <div>
                            <h5>{submission.studentName}</h5>
                            <p className="submission-status">
                              {submission.status === 'graded' ? (
                                <>
                                  <FaCheckCircle /> Graded • {submission.grade}/{assignment.points}
                                </>
                              ) : submission.isLate ? (
                                <>
                                  <FaClock /> Late • {submission.submittedAt}
                                </>
                              ) : (
                                <>
                                  <FaCheckCircle /> Submitted • {submission.submittedAt}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="submission-actions">
                          {submission.plagiarismScore !== undefined && (
                            <span className={`plagiarism ${submission.plagiarismScore < 10 ? 'low' : 'high'}`}>
                              Plagiarism: {submission.plagiarismScore}%
                            </span>
                          )}
                          <button className="btn-grade">Grade</button>
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Empty State */}
              {getFilteredAssignments().length === 0 && (
                <div className="empty-state">
                  <FaClipboardList size={48} />
                  <h3>No assignments yet</h3>
                  <p>Your instructor will post assignments here. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="tab-pane exams-pane">
            <div className="exams-header">
              <h2>Exams & Assessments</h2>
              {!isStudent && (
                <button className="btn-create-exam">
                  <FaPlus /> Create Exam
                </button>
              )}
            </div>

            <div className="exams-list">
              {getFilteredExams().map(exam => (
                <div key={exam.id} className="exam-card">
                  <div className="exam-header-section">
                    <h3>{exam.title}</h3>
                    <div className="exam-badges">
                      {exam.isProcored && <span className="badge proctored">Proctored</span>}
                      {exam.hasAdaptiveDifficulty && <span className="badge adaptive">Adaptive</span>}
                    </div>
                  </div>

                  <p className="exam-description">{exam.description}</p>

                  <div className="exam-details">
                    <div className="detail-item">
                      <FaCalendar />
                      <span>{exam.scheduledFor}</span>
                    </div>
                    <div className="detail-item">
                      <FaClock />
                      <span>{exam.duration} mins</span>
                    </div>
                    <div className="detail-item">
                      <FaAward />
                      <span>{exam.totalMarks} marks • {exam.totalQuestions} questions</span>
                    </div>
                  </div>

                  <div className="exam-student-status">
                    <h4>Student Status</h4>
                    <div className="status-grid">
                      <div className="status-item">
                        <div className="status-count">{exam.students.filter(s => s.status === 'not_started').length}</div>
                        <div className="status-label">Not Started</div>
                      </div>
                      <div className="status-item">
                        <div className="status-count">{exam.students.filter(s => s.status === 'in_progress').length}</div>
                        <div className="status-label">In Progress</div>
                      </div>
                      <div className="status-item">
                        <div className="status-count">{exam.students.filter(s => s.status === 'submitted').length}</div>
                        <div className="status-label">Submitted</div>
                      </div>
                      <div className="status-item">
                        <div className="status-count">{exam.students.filter(s => s.status === 'graded').length}</div>
                        <div className="status-label">Graded</div>
                      </div>
                    </div>
                  </div>

                  {!isStudent && (
                    <div className="exam-actions">
                      <button className="btn-secondary">
                        <FaEye /> Monitor
                      </button>
                      <button className="btn-secondary">
                        <FaEdit /> Edit
                      </button>
                      <button className="btn-secondary">
                        <FaDownload /> Export Results
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Empty State */}
              {getFilteredExams().length === 0 && (
                <div className="empty-state">
                  <FaQuestion size={48} />
                  <h3>No exams yet</h3>
                  <p>Exams and assessments will appear here once your instructor creates them.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div className="tab-pane grades-pane">
            <div className="grades-header">
              <h2>Grades & Feedback</h2>
              <div className="grade-filters">
                <button className="filter-btn active">All Students</button>
                <button className="filter-btn">Submitted</button>
                <button className="filter-btn">Missing</button>
                <button className="filter-btn">Excelling</button>
              </div>
            </div>

            <div className="grades-table-container">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Calculus Problem Set</th>
                    <th>Quiz 1</th>
                    <th>Midterm</th>
                    <th>Overall Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {studentProgress.map(student => (
                    <tr key={student.studentId} className="grade-row">
                      <td className="student-cell">
                        <div className="student-name-cell">
                          <div className="student-avatar-sm">{student.studentName[0]}</div>
                          <div>
                            <div className="student-name">{student.studentName}</div>
                            <small className="last-active">{student.lastActive}</small>
                          </div>
                        </div>
                      </td>
                      <td className="grade-cell">
                        <div className="grade-value">95</div>
                        <small className="grade-meta">On time</small>
                      </td>
                      <td className="grade-cell">
                        <div className="grade-value">88</div>
                      </td>
                      <td className="grade-cell">
                        <div className="grade-value">-</div>
                        <small className="grade-meta">Not started</small>
                      </td>
                      <td className="grade-cell overall">
                        <div className="grade-value">88</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="tab-pane analytics-pane">
            <div className="analytics-header">
              <h2>Class Analytics</h2>
            </div>

            <div className="analytics-grid">
              {/* Engagement Heatmap */}
              <div className="analytics-card">
                <h3>Engagement Heatmap</h3>
                <div className="heatmap-placeholder">
                  <FaChartBar /> Real-time engagement data
                </div>
              </div>

              {/* Performance Distribution */}
              <div className="analytics-card">
                <h3>Performance Distribution</h3>
                <div className="chart-placeholder">
                  <FaChartLine /> Grade distribution
                </div>
              </div>

              {/* Attendance Trends */}
              <div className="analytics-card">
                <h3>Attendance Trends</h3>
                <div className="attendance-list">
                  {studentProgress.map(student => (
                    <div key={student.studentId} className="attendance-item">
                      <span className="student-name-short">{student.studentName}</span>
                      <div className="attendance-bar">
                        <div className="attendance-fill" style={{ width: `${student.attendanceRate}%` }}></div>
                      </div>
                      <span className="attendance-percent">{student.attendanceRate}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strength/Weakness Map */}
              <div className="analytics-card">
                <h3>Strength / Weakness Map</h3>
                {studentProgress.map(student => (
                  <div key={student.studentId} className="strength-weakness">
                    <h4>{student.studentName}</h4>
                    <div className="strength-items">
                      <strong>Strengths:</strong>
                      {student.strengths.map(s => (
                        <span key={s} className="strength-badge">{s}</span>
                      ))}
                    </div>
                    <div className="weakness-items">
                      <strong>Needs Work:</strong>
                      {student.weaknesses.map(w => (
                        <span key={w} className="weakness-badge">{w}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* People Tab */}
        {activeTab === 'people' && (
          <div className="tab-pane people-pane">
            <div className="people-header">
              <h2>Class Members</h2>
              <input type="text" placeholder="Search students..." className="search-input" />
            </div>

            <div className="people-section">
              <h3>Instructor</h3>
              <div className="people-list">
                <div className="person-card">
                  <div className="person-avatar instructor">T</div>
                  <div className="person-info">
                    <h4>Mr. Thompson</h4>
                    <p>Instructor</p>
                  </div>
                  <button className="person-action">Message</button>
                </div>
              </div>
            </div>

            <div className="people-section">
              <h3>Students (45)</h3>
              <div className="people-list">
                {studentProgress.map(student => (
                  <div key={student.studentId} className="person-card">
                    <div className="person-avatar">{student.studentName[0]}</div>
                    <div className="person-info">
                      <h4>{student.studentName}</h4>
                      <p className="person-meta">
                        {student.assignmentCompletion}% completion • Avg: {student.averageScore}%
                      </p>
                    </div>
                    <button className="person-action">Message</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="tab-pane settings-pane">
            <div className="settings-header">
              <h2>Classroom Settings</h2>
            </div>

            <div className="settings-section">
              <h3>General Settings</h3>
              <div className="setting-item">
                <label>Class Name</label>
                <input type="text" defaultValue="Advanced Mathematics - Section A" />
              </div>
              <div className="setting-item">
                <label>Description</label>
                <textarea defaultValue="Complex Analysis and Calculus"></textarea>
              </div>
            </div>

            <div className="settings-section">
              <h3>Permissions & Access</h3>
              <label className="checkbox-setting">
                <input type="checkbox" defaultChecked />
                <span>Allow students to post</span>
              </label>
              <label className="checkbox-setting">
                <input type="checkbox" defaultChecked />
                <span>Allow students to comment</span>
              </label>
              <label className="checkbox-setting">
                <input type="checkbox" />
                <span>Moderate all posts before publishing</span>
              </label>
            </div>

            <div className="settings-section">
              <h3>Notifications</h3>
              <label className="checkbox-setting">
                <input type="checkbox" defaultChecked />
                <span>Email me when students submit assignments</span>
              </label>
              <label className="checkbox-setting">
                <input type="checkbox" defaultChecked />
                <span>Email me new posts in this class</span>
              </label>
            </div>

            <div className="settings-section">
              <h3>Accessibility</h3>
              <button className="btn-secondary"><FaUniversalAccess /> Enable High Contrast Mode</button>
              <button className="btn-secondary">Adjust Font Size</button>
            </div>
          </div>
        )}

        {/* Fallback if no tab matches */}
        {!activeTab && (
          <div className="tab-pane">
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>No tab selected. Current tab: {activeTab}</p>
            </div>
          </div>
        )}
      </div>

      {/* Invitation Center Modal */}
      <CandidateInvitationCenter 
        isOpen={showInvitationCenter}
        onClose={() => setShowInvitationCenter(false)}
        onInvitationAccepted={handleInvitationAccepted}
      />

      {/* Announcement Form Modal */}
      {showAnnouncementForm && selectedClassroom && (
        <AnnouncementForm
          classroomId={selectedClassroom.id}
          onAnnouncementCreated={handleAnnouncementCreated}
          onClose={() => setShowAnnouncementForm(false)}
        />
      )}
    </div>
  );
};

export default AdvancedClassroom;
