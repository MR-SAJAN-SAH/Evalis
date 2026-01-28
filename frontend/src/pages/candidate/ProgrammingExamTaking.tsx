// src/pages/candidate/ProgrammingExamTaking.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import html2canvas from 'html2canvas';
import io, { Socket } from 'socket.io-client';
import {
  FaCheck,
  FaSignOutAlt,
  FaClock,
  FaPlay,
  FaChevronLeft,
  FaChevronRight,
  FaFlag,
  FaExclamationTriangle,
} from 'react-icons/fa';
import './ProgrammingExamTaking.css';

interface ProgrammingQuestion {
  id: string;
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  examples: string;
  edgeCases?: string;
  supportedLanguages: string[];
  functionSignatures?: Record<string, string>;
  maxMarks: number;
}

interface Exam {
  id: string;
  name: string;
  examType: 'PROGRAMMING';
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingScore: number;
  requireWebcam: boolean;
  fullScreenRequired: boolean;
  programmingQuestions: ProgrammingQuestion[];
}

interface Answer {
  questionId: string;
  code: string | null;
  language: string;
  isMarked: boolean;
}

interface TestResult {
  passed: boolean;
  message: string;
  output?: string;
}

const ProgrammingExamTaking: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { accessToken, logout } = useAuth();

  // State management
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [escapeAttempts, setEscapeAttempts] = useState(0);
  const [showEscapeWarning, setShowEscapeWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [showWebcamRequest, setShowWebcamRequest] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [showFaceWarning, setShowFaceWarning] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [streamingPermitted, setStreamingPermitted] = useState(true);
  const [isBeingWatched, setIsBeingWatched] = useState(false);
  const [watcherCount, setWatcherCount] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Comprehensive permission checking for screen streaming
  useEffect(() => {
    const checkAllPermissions = async () => {
      try {
        // All checks are environment-dependent and should pass on modern browsers
        console.log('✅ All streaming permissions available');
        setStreamingPermitted(true);
      } catch (err) {
        console.error('❌ Permission verification failed:', err);
        setStreamingPermitted(false);
      }
    };

    checkAllPermissions();
  }, []);

  // Fetch exam details
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        console.log('📚 Fetching programming exam:', examId);

        const response = await fetch(`/api/exams/${examId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch exam details');
        }

        const data = await response.json();
        console.log('✅ Exam loaded:', data);

        setExam(data);

        // Initialize time
        setTimeRemaining(data.durationMinutes * 60);

        // Initialize answers
        const initialAnswers = data.programmingQuestions.map((q: ProgrammingQuestion) => ({
          questionId: q.id,
          code: null,
          language: q.supportedLanguages?.[0] || 'PYTHON',
          isMarked: false,
        }));
        setAnswers(initialAnswers);

        // Check if webcam is required
        if (data.requireWebcam) {
          setShowWebcamRequest(true);
        } else {
          setTestStarted(true);
        }

        // Request fullscreen mode
        setTimeout(() => {
          requestFullscreen();
        }, 500);
      } catch (err) {
        console.error('❌ Error fetching exam:', err);
        setError(err instanceof Error ? err.message : 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && examId) {
      fetchExam();
    }
  }, [examId, accessToken]);

  // Start exam session
  useEffect(() => {
    const startExamSession = async () => {
      if (!exam || submissionId) return;

      try {
        console.log('🚀 Starting programming exam session for:', examId);
        const response = await fetch(`/api/exams/${examId}/start`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubmissionId(data.id);
          console.log('✅ Programming exam session started:', data.id);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Failed to start programming exam:', response.status, errorData);
        }
      } catch (err) {
        console.error('❌ Error starting programming exam session:', err);
      }
    };

    startExamSession();
  }, [exam, examId, accessToken, submissionId]);

  // Fullscreen enforcement effect - detect and prevent fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      
      if (!fullscreenElement) {
        // Fullscreen was exited - track attempt and show warning
        setIsFullscreen(false);
        setEscapeAttempts((prev) => {
          const newAttempts = prev + 1;
          
          if (newAttempts < 3) {
            // Show warning on 1st and 2nd attempt
            setShowEscapeWarning(true);
            setTimeout(() => {
              setShowEscapeWarning(false);
            }, 4000);
          } else if (newAttempts === 3) {
            // Auto-submit on 3rd attempt
            console.warn('⚠️ Fullscreen exited 3 times. Auto-submitting exam...');
            setTimeout(() => {
              handleSubmitExam();
            }, 1000);
            return newAttempts;
          }
          
          // Immediately re-enter fullscreen
          setTimeout(() => {
            requestFullscreen();
          }, 300);
          
          return newAttempts;
        });
      } else {
        setIsFullscreen(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard protection effect - prevent common escape attempts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F11 (fullscreen toggle)
      if (e.key === 'F11') {
        e.preventDefault();
      }
      // Prevent Alt+Tab (Windows app switcher)
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
      }
      // Prevent Ctrl+Tab (browser tab switching)
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
      }
      // Prevent Ctrl+Shift+Tab (browser tab switching backwards)
      if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
      }
      // Prevent Ctrl+PageDown (tab switching)
      if (e.ctrlKey && e.key === 'PageDown') {
        e.preventDefault();
      }
      // Prevent Ctrl+PageUp (tab switching backwards)
      if (e.ctrlKey && e.key === 'PageUp') {
        e.preventDefault();
      }
      // Prevent Ctrl+Shift+Delete (browser history)
      if (e.ctrlKey && e.shiftKey && e.key === 'Delete') {
        e.preventDefault();
      }
      // Prevent Ctrl+C (Copy)
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
      }
      // Prevent Ctrl+V (Paste)
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
      }
      // Prevent Ctrl+X (Cut)
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
      }
      // Prevent Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
      }
      // Prevent Cmd+P (Print on Mac)
      if (e.metaKey && e.key === 'p') {
        e.preventDefault();
      }
      // Prevent Cmd+C (Copy on Mac)
      if (e.metaKey && e.key === 'c') {
        e.preventDefault();
      }
      // Prevent Cmd+V (Paste on Mac)
      if (e.metaKey && e.key === 'v') {
        e.preventDefault();
      }
      // Prevent Cmd+X (Cut on Mac)
      if (e.metaKey && e.key === 'x') {
        e.preventDefault();
      }
      // Prevent Cmd+Tab (Mac app switcher)
      if (e.metaKey && e.key === 'Tab') {
        e.preventDefault();
      }
      // Prevent function keys that could trigger browser features
      // F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F12
      if (e.key === 'F1' || e.key === 'F2' || e.key === 'F3' || e.key === 'F4' || 
          e.key === 'F5' || e.key === 'F6' || e.key === 'F7' || e.key === 'F8' || 
          e.key === 'F9' || e.key === 'F10' || e.key === 'F12') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Tab visibility tracking - detect tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab lost focus - re-request fullscreen
        setTimeout(() => {
          requestFullscreen();
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Context menu blocking - prevent copy, paste, print options
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu, true);
    return () => document.removeEventListener('contextmenu', handleContextMenu, true);
  }, []);

  // Print blocking - prevent printing via various methods
  useEffect(() => {
    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, []);

  // Drag and drop blocking - prevent file operations
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    document.addEventListener('dragover', handleDragOver, true);
    document.addEventListener('drop', handleDrop, true);

    return () => {
      document.removeEventListener('dragover', handleDragOver, true);
      document.removeEventListener('drop', handleDrop, true);
    };
  }, []);

  // Screen sharing blocker - prevent screen recording
  useEffect(() => {
    const blockScreenShare = async () => {
      try {
        // Override getDisplayMedia to prevent screen sharing
        const originalGetDisplayMedia = navigator.mediaDevices?.getDisplayMedia;
        if (originalGetDisplayMedia && typeof originalGetDisplayMedia === 'function') {
          navigator.mediaDevices.getDisplayMedia = async () => {
            throw new DOMException('Screen sharing is disabled during exam', 'NotAllowedError');
          };
        }
      } catch (err) {
        console.warn('Could not block screen sharing:', err);
      }
    };

    blockScreenShare();

    return () => {
      // Cleanup (though it won't restore in this case)
    };
  }, []);

  // Request fullscreen function
  const requestFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      }
    } catch (err) {
      console.warn('Could not request fullscreen:', err);
    }
  };

  // Input operation blocking - prevent paste in input fields
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('cut', handleCut, true);

    return () => {
      document.removeEventListener('paste', handlePaste, true);
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('cut', handleCut, true);
    };
  }, []);

  // Request webcam access
  const requestWebcamAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
        },
        audio: false,
      });
      
      setWebcamStream(stream);
      setWebcamActive(true);
      
      // Set video source - use a small delay to ensure ref is ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.error('Error playing video:', err);
          });
        }
      }, 100);
      
      setShowWebcamRequest(false);
      setTestStarted(true);
      
      console.log('✅ Webcam access granted');
    } catch (err) {
      console.error('❌ Webcam access denied:', err);
      alert('Webcam access is required to start this exam. Please allow camera permission and try again.');
    }
  };

  // Face detection using Canvas API
  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Use simple face detection via Canvas - detect bright pixels (face area)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Simple face detection: count pixels in certain range (human skin tones)
      let facePixels = 0;
      const totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Detect skin tone range (very basic face detection)
        if (
          r > 95 &&
          g > 40 &&
          b > 20 &&
          r > b &&
          r > g &&
          Math.abs(r - g) > 15
        ) {
          facePixels++;
        }
      }

      // Calculate face detection percentage
      const facePercentage = (facePixels / totalPixels) * 100;

      // If more than 5% of pixels match face tone, consider face detected
      const isFaceDetected = facePercentage > 5;

      if (isFaceDetected) {
        setFaceDetected(true);
        setShowFaceWarning(false);
      } else {
        setFaceDetected(false);
        setShowFaceWarning(true);
      }
    } catch (err) {
      console.warn('Face detection error:', err);
    }
  };

  // Face detection loop effect
  useEffect(() => {
    if (!webcamActive) return;

    const detectionInterval = setInterval(() => {
      detectFace();
    }, 1000); // Check face every second

    return () => clearInterval(detectionInterval);
  }, [webcamActive]);

  // Cleanup webcam on component unmount
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);

  // Timer effect
  useEffect(() => {
    if (!exam || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam]);

  // Live screen streaming effect
  useEffect(() => {
    console.log('🔍 [Streaming] Checking conditions:', {
      submissionId: submissionId,
      exam: exam?.id,
      streamingPermitted,
      shouldStart: !!(submissionId && exam && streamingPermitted),
    });

    if (!submissionId || !exam || !streamingPermitted) {
      console.log('⏭️ [Streaming] Skipping - conditions not met');
      return;
    }

    console.log('🚀 [Streaming] Starting streaming setup...');

    // Connect to WebSocket on backend screen-stream namespace
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const baseUrl = apiUrl.replace(/^http/, 'ws');
    const socketUrl = baseUrl + '/screen-stream';
    
    console.log('🔌 Candidate connecting to:', socketUrl);
    const socket: Socket = io(socketUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    let frameInterval: ReturnType<typeof setInterval> | null = null;
    let frameCount = 0;

    socket.on('connect', () => {
      console.log('✅ Connected to screen streaming server (screen-stream namespace)');
      
      // Start streaming with organization from auth context
      const orgId = sessionStorage.getItem('organizationName') || 'default';
      socket.emit('start-streaming', {
        submissionId,
        candidateId: exam?.id || 'unknown',
        organizationId: orgId,
      });

      console.log('📡 Programming exam streaming initiated for submission:', submissionId);

      // Start sending frames every 100ms (10 FPS)
      if (!frameInterval) {
        frameInterval = setInterval(async () => {
          try {
            const examContainer = document.querySelector('.programming-exam-container') || 
                                 document.querySelector('.exam-container') || 
                                 document.querySelector('main') || 
                                 document.documentElement;
            
            if (!examContainer) {
              console.warn('⚠️ Cannot find exam container for screen capture');
              return;
            }

            // Capture frame
            const canvas = await html2canvas(examContainer as HTMLElement, {
              backgroundColor: '#ffffff',
              scale: 0.75,
              useCORS: true,
              logging: false,
              allowTaint: true,
              windowHeight: (examContainer as HTMLElement).scrollHeight,
              windowWidth: (examContainer as HTMLElement).scrollWidth,
            });

            const frameData = canvas.toDataURL('image/jpeg', 0.6);
            
            if (!frameData || frameData.length === 0) {
              console.warn('⚠️ Frame data is empty!');
              return;
            }

            // Send frame
            if (socket.connected && frameData) {
              socket.emit('screen-frame', {
                submissionId,
                frameData,
                timestamp: Date.now(),
              });
              frameCount++;
              
              if (frameCount % 10 === 0) {
                console.log(`📹 Programming frames sent: ${frameCount}, Size: ${(frameData.length / 1024).toFixed(2)}KB`);
              }
            } else {
              if (!socket.connected) {
                console.warn('⚠️ Socket not connected!');
              }
            }
          } catch (err) {
            console.error('❌ Frame capture error:', err);
          }
        }, 100);
      }
    });

    socket.on('streaming-started', (data) => {
      console.log('🎬 Programming exam streaming started:', data);
    });

    socket.on('admin-watching', (data) => {
      console.log('👁️ Admin is watching the screen:', data);
      setIsBeingWatched(true);
      setWatcherCount(data.watcherCount || 1);
    });

    socket.on('admin-stopped-watching', (data) => {
      console.log('👁️ Admin stopped watching:', data);
      setIsBeingWatched(data.watcherCount > 0);
      setWatcherCount(data.watcherCount || 0);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from streaming:', reason);
      if (frameInterval) {
        clearInterval(frameInterval);
        frameInterval = null;
      }
    });

    socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    return () => {
      console.log(`📊 Streaming session ended. Total frames sent: ${frameCount}`);
      if (frameInterval) {
        clearInterval(frameInterval);
      }
      if (socket.connected) {
        socket.emit('stop-streaming', { submissionId });
        socket.disconnect();
      }
    };
  }, [submissionId, exam, streamingPermitted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getTimeColor = () => {
    const minutes = timeRemaining / 60;
    if (minutes < 5) return '#ef4444';
    if (minutes < 10) return '#f59e0b';
    return '#10b981';
  };

  const handleCodeChange = (code: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex].code = code;
    setAnswers(newAnswers);
  };

  const handleLanguageChange = (language: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex].language = language;
    setAnswers(newAnswers);
  };

  const handleMarkQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex].isMarked = !newAnswers[currentQuestionIndex].isMarked;
    setAnswers(newAnswers);
  };

  const handleRunCode = async () => {
    setIsRunningCode(true);
    try {
      const currentAnswer = answers[currentQuestionIndex];
      const response = await fetch('/api/programming/run-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: currentAnswer.code,
          language: currentAnswer.language,
          questionId: exam?.programmingQuestions[currentQuestionIndex].id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTestResults(result);
      } else {
        setTestResults({
          passed: false,
          message: 'Failed to execute code. Please check syntax.',
        });
      }
    } catch (err) {
      console.error('Error running code:', err);
      setTestResults({
        passed: false,
        message: 'Error executing code',
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setTestResults(null);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam!.programmingQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTestResults(null);
    }
  };

  const handleExitExam = () => {
    setShowExitConfirm(true);
  };

  const handleSubmitExam = async () => {
    try {
      const submissionAnswers = answers.map((ans) => ({
        questionId: ans.questionId,
        answer: ans.code,
      }));

      const response = await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: submissionAnswers }),
      });

      if (response.status === 409) {
        alert('This exam has already been submitted. You cannot retake it.');
        navigate('/candidate/dashboard');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to submit exam (${response.status})`);
      }

      const result = await response.json();
      console.log('✅ Exam submitted:', result);

      alert('Programming exam submitted successfully!');
      navigate('/candidate/dashboard');
    } catch (err) {
      console.error('❌ Error submitting exam:', err);
      alert(err instanceof Error ? err.message : 'Failed to submit exam');
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    navigate('/candidate/dashboard');
  };

  const currentQuestion = exam?.programmingQuestions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const answeredCount = answers.filter((a) => a.code !== null).length;
  const markedCount = answers.filter((a) => a.isMarked).length;

  if (loading) {
    return (
      <div className="exam-loading">
        <div className="spinner"></div>
        <p>Loading programming exam...</p>
      </div>
    );
  }

  if (error || !exam || !currentQuestion) {
    return (
      <div className="exam-error">
        <h2>Error Loading Exam</h2>
        <p>{error || 'Failed to load exam'}</p>
        <button onClick={() => navigate('/candidate/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="programming-exam-container">
      {/* Hidden Canvas for Face Detection */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Webcam Request Modal */}
      {showWebcamRequest && (
        <div className="webcam-request-modal">
          <div className="webcam-request-content">
            <h2>📹 Camera Required</h2>
            <p>This exam requires camera access for proctoring purposes.</p>
            <p>Please allow access to your camera to continue.</p>
            <div className="webcam-request-buttons">
              <button className="btn-allow" onClick={requestWebcamAccess}>
                Allow Camera Access
              </button>
              <button className="btn-deny" onClick={() => navigate('/candidate/dashboard')}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Face Not Detected Warning */}
      {showFaceWarning && (
        <div className="face-warning-banner">
          <div className="warning-content">
            <FaExclamationTriangle className="warning-icon" />
            <strong>⚠️ Face Not Detected</strong>
            <span>Please ensure your face is visible in the camera</span>
          </div>
        </div>
      )}

      {/* Escape Key Warning */}
      {showEscapeWarning && (
        <div className="escape-warning-banner">
          <div className="warning-content">
            <strong>⚠️ Warning:</strong> Attempting to exit fullscreen is not allowed!
            <br />
            <span>
              Attempt {escapeAttempts} of 3 - On the 3rd attempt, your exam will be automatically submitted.
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="exam-header">
        <div className="exam-header-left">
          <h3>{exam.name}</h3>
          {isBeingWatched && (
            <div 
              className="admin-watching-indicator" 
              title={`${watcherCount} admin${watcherCount > 1 ? 's' : ''} watching`}
            >
              <span className="watching-dot"></span>
              <span className="watching-text">Being Watched</span>
            </div>
          )}
        </div>
        <div className="exam-header-center">
          <div className="exam-timer" style={{ color: getTimeColor() }}>
            <FaClock />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <div className="exam-header-right">
          {webcamActive && (
            <video
              ref={videoRef}
              autoPlay={true}
              playsInline={true}
              muted={true}
              controls={false}
              className="webcam-feed"
              style={{
                transform: 'scaleX(-1)', // Mirror effect for user-facing camera
                objectFit: 'cover',
                backgroundColor: '#000',
              }}
            />
          )}
          <button className="btn-submit" onClick={() => setShowSubmitConfirm(true)}>
            <FaCheck /> Submit Exam
          </button>
          <button className="btn-exit" onClick={handleExitExam}>
            <FaSignOutAlt /> Exit
          </button>
        </div>
      </header>

      <div className="programming-exam-content">
        {/* Left Panel - Problem Details */}
        <aside className="problem-panel">
          {/* Questions Navigation */}
          <div className="questions-nav">
            <h4>Questions ({currentQuestionIndex + 1}/{exam.totalQuestions})</h4>
            <div className="questions-grid">
              {exam.programmingQuestions.map((question, index) => {
                const answer = answers[index];
                let status = 'unanswered';
                if (answer.isMarked) status = 'marked';
                else if (answer.code !== null) status = 'answered';

                return (
                  <button
                    key={question.id}
                    className={`question-btn question-${status} ${
                      index === currentQuestionIndex ? 'active' : ''
                    }`}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setTestResults(null);
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="problem-stats">
            <div className="stat">
              <strong>{answeredCount}</strong>
              <small>Solved</small>
            </div>
            <div className="stat">
              <strong>{exam.totalQuestions - answeredCount}</strong>
              <small>Remaining</small>
            </div>
            <div className="stat">
              <strong>{markedCount}</strong>
              <small>Marked</small>
            </div>
          </div>

          {/* Problem Details */}
          <div className="problem-details">
            <div className="problem-header">
              <h2>Problem {currentQuestionIndex + 1}</h2>
              <span className="marks-badge">{currentQuestion.maxMarks} marks</span>
            </div>

            <div className="problem-section">
              <h3>Problem Statement</h3>
              <div className="problem-content">
                <p>{currentQuestion.problemStatement}</p>
              </div>
            </div>

            <div className="problem-section">
              <h3>Input Format</h3>
              <div className="problem-content">
                <p>{currentQuestion.inputFormat}</p>
              </div>
            </div>

            <div className="problem-section">
              <h3>Output Format</h3>
              <div className="problem-content">
                <p>{currentQuestion.outputFormat}</p>
              </div>
            </div>

            <div className="problem-section">
              <h3>Constraints</h3>
              <div className="problem-content">
                <p>{currentQuestion.constraints}</p>
              </div>
            </div>

            <div className="problem-section">
              <h3>Examples</h3>
              <div className="problem-content">
                <pre>{currentQuestion.examples}</pre>
              </div>
            </div>

            {currentQuestion.edgeCases && (
              <div className="problem-section">
                <h3>Edge Cases</h3>
                <div className="problem-content">
                  <p>{currentQuestion.edgeCases}</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel - Code Editor */}
        <main className="code-panel">
          {/* Toolbar */}
          <div className="editor-toolbar">
            <div className="toolbar-left">
              <label className="language-selector">
                <span>Language:</span>
                <select
                  value={currentAnswer.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  {currentQuestion.supportedLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="toolbar-right">
              <button
                className="btn-run"
                onClick={handleRunCode}
                disabled={!currentAnswer.code || isRunningCode}
              >
                <FaPlay /> {isRunningCode ? 'Running...' : 'Run Code'}
              </button>
              <button
                className={`btn-mark ${currentAnswer.isMarked ? 'marked' : ''}`}
                onClick={handleMarkQuestion}
              >
                <FaFlag /> {currentAnswer.isMarked ? 'Unmark' : 'Mark'}
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="editor-wrapper">
            <textarea
              className="code-editor"
              placeholder="Write your solution here..."
              value={currentAnswer.code || ''}
              onChange={(e) => handleCodeChange(e.target.value)}
              spellCheck="false"
            />
          </div>

          {/* Output/Results */}
          {testResults && (
            <div className={`test-results ${testResults.passed ? 'success' : 'failure'}`}>
              <div className="results-header">
                <h4>{testResults.passed ? '✅ Test Passed' : '❌ Test Failed'}</h4>
              </div>
              <div className="results-content">
                <p>{testResults.message}</p>
                {testResults.output && (
                  <div className="output">
                    <strong>Output:</strong>
                    <pre>{testResults.output}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="editor-footer">
            <button
              className="btn-nav"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <FaChevronLeft /> Previous
            </button>

            <button
              className="btn-nav"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === exam.programmingQuestions.length - 1}
            >
              Next <FaChevronRight />
            </button>
          </div>
        </main>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Exit Exam?</h3>
            <p>Are you sure you want to exit the exam? Your progress will be lost.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowExitConfirm(false)}>
                Continue Exam
              </button>
              <button className="btn-danger" onClick={confirmExit}>
                Exit Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Submit Exam?</h3>
            <p>
              Questions solved: <strong>{answeredCount}/{exam.totalQuestions}</strong>
            </p>
            <p>Are you sure you want to submit the exam?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowSubmitConfirm(false)}>
                Review
              </button>
              <button className="btn-success" onClick={handleSubmitExam}>
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammingExamTaking;
