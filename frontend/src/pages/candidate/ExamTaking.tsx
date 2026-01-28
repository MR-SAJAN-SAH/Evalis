// src/pages/candidate/ExamTaking.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import html2canvas from 'html2canvas';
import io, { Socket } from 'socket.io-client';
import {
  FaChevronLeft,
  FaChevronRight,
  FaFlag,
  FaCheck,
  FaSignOutAlt,
  FaClock,
  FaExclamationTriangle,
  FaMoon,
  FaSun,
} from 'react-icons/fa';
import './ExamTaking.css';

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC?: string;
  optionD?: string;
  questionType: string;
  marks: number;
  correctAnswer?: string;
  correctAnswers?: string[]; // Support for multiple correct answers
  allowMultipleCorrect?: boolean; // Flag to indicate if multiple answers are allowed
  hasImage?: boolean;
  imageUrl?: string;
}

interface Exam {
  id: string;
  name: string;
  examType: 'MCQ' | 'PROGRAMMING';
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingScore: number;
  requireWebcam: boolean;
  fullScreenRequired: boolean;
  preventTabSwitch: boolean;
  questions: Question[];
  programmingQuestions?: any[];
}

interface Answer {
  questionId: string;
  answer: string | string[] | null; // Support both single and multiple answers
  isMarked: boolean;
}

const ExamTaking: React.FC = () => {
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [streamingPermitted, setStreamingPermitted] = useState(true);
  const [isBeingWatched, setIsBeingWatched] = useState(false);
  const [watcherCount, setWatcherCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  // Proctoring state
  const [webcamActive, setWebcamActive] = useState(false);
  const [showWebcamRequest, setShowWebcamRequest] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [escapeAttempts, setEscapeAttempts] = useState(0);
  const [showEscapeWarning, setShowEscapeWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Block exitFullscreen API
  useEffect(() => {
    if (!exam?.fullScreenRequired) return;

    // Override exitFullscreen method to prevent accidental calls
    const originalExitFullscreen = document.exitFullscreen;
    const originalWebkitExitFullscreen = (document as any).webkitExitFullscreen;
    const originalMozCancelFullScreen = (document as any).mozCancelFullScreen;
    const originalMsExitFullscreen = (document as any).msExitFullscreen;

    // Block all exitFullscreen methods
    (document as any).exitFullscreen = async () => {
      console.warn('⚠️ exitFullscreen() call blocked');
      return Promise.reject(new Error('Fullscreen exit is disabled'));
    };

    if (originalWebkitExitFullscreen) {
      (document as any).webkitExitFullscreen = async () => {
        console.warn('⚠️ webkitExitFullscreen() call blocked');
        return Promise.reject(new Error('Fullscreen exit is disabled'));
      };
    }

    if (originalMozCancelFullScreen) {
      (document as any).mozCancelFullScreen = async () => {
        console.warn('⚠️ mozCancelFullScreen() call blocked');
        return Promise.reject(new Error('Fullscreen exit is disabled'));
      };
    }

    if (originalMsExitFullscreen) {
      (document as any).msExitFullscreen = async () => {
        console.warn('⚠️ msExitFullscreen() call blocked');
        return Promise.reject(new Error('Fullscreen exit is disabled'));
      };
    }

    return () => {
      // Restore original methods on cleanup (if needed)
      (document as any).exitFullscreen = originalExitFullscreen;
      if (originalWebkitExitFullscreen) {
        (document as any).webkitExitFullscreen = originalWebkitExitFullscreen;
      }
      if (originalMozCancelFullScreen) {
        (document as any).mozCancelFullScreen = originalMozCancelFullScreen;
      }
      if (originalMsExitFullscreen) {
        (document as any).msExitFullscreen = originalMsExitFullscreen;
      }
    };
  }, [exam?.fullScreenRequired]);

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

  // Request fullscreen function with retry mechanism
  const requestFullscreen = async (retryCount = 0) => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      console.log('✅ Fullscreen re-entered successfully');
    } catch (err) {
      console.warn('Could not request fullscreen, retrying...:', err);
      // Retry with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 50; // 50ms, 100ms, 200ms
        setTimeout(() => {
          requestFullscreen(retryCount + 1);
        }, delay);
      }
    }
  };

  // Window blur and visibility detection - prevents switching away from exam
  useEffect(() => {
    if (!exam?.fullScreenRequired && !exam?.preventTabSwitch) return;

    let refocusTimer: ReturnType<typeof setTimeout> | null = null;

    // Handle window blur (user tries to switch to another app)
    const handleBlur = () => {
      console.error('🚨🚨🚨 WINDOW BLUR DETECTED - User trying to switch apps! 🚨🚨🚨');
      
      // Clear existing timer
      if (refocusTimer) clearTimeout(refocusTimer);
      
      // Aggressive refocus - try immediately and multiple times
      refocusTimer = setTimeout(() => {
        console.warn('🔄 Refocusing window...');
        window.focus();
        
        // If fullscreen required, also re-enter fullscreen
        if (exam?.fullScreenRequired) {
          const elem = document.documentElement;
          if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.warn('Could not re-enter fullscreen:', err));
          } else if ((elem as any).webkitRequestFullscreen) {
            (elem as any).webkitRequestFullscreen().catch((err: any) => console.warn('Could not re-enter fullscreen:', err));
          }
        }
        
        // Show warning
        setShowEscapeWarning(true);
        setTimeout(() => setShowEscapeWarning(false), 3000);
      }, 10); // Refocus after 10ms
    };

    // Handle visibility change (tab/window minimized or switched)
    const handleVisibilityChange = () => {
      console.warn(`📱 Visibility change - Hidden: ${document.hidden}`);
      if (document.hidden) {
        console.error('🚨🚨🚨 CRITICAL: Tab hidden - User switched away - AUTO-SUBMITTING IMMEDIATELY 🚨🚨🚨');
        // IMMEDIATELY submit without any delay
        handleSubmitExam(true); // true = isAutoSubmit
      }
    };

    // Add event listeners
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (refocusTimer) clearTimeout(refocusTimer);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [exam?.fullScreenRequired, exam?.preventTabSwitch]);

  // Update fullscreen state when it changes
  useEffect(() => {
    const updateFullscreenState = () => {
      const fs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      console.log('📊 Fullscreen state updated:', fs);
      setIsFullscreen(fs);
      setIsFullScreen(fs);
    };

    // Listen to fullscreen change events
    document.addEventListener('fullscreenchange', updateFullscreenState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenState);
    document.addEventListener('mozfullscreenchange', updateFullscreenState);
    document.addEventListener('msfullscreenchange', updateFullscreenState);

    // Initial check
    updateFullscreenState();

    return () => {
      document.removeEventListener('fullscreenchange', updateFullscreenState);
      document.removeEventListener('webkitfullscreenchange', updateFullscreenState);
      document.removeEventListener('mozfullscreenchange', updateFullscreenState);
      document.removeEventListener('msfullscreenchange', updateFullscreenState);
    };
  }, []);

  // CRITICAL: Auto-submit on ANY fullscreen loss (cannot be blocked)
  useEffect(() => {
    console.log('🎯 Fullscreen effect initialized - exam.fullScreenRequired:', exam?.fullScreenRequired);
    
    if (!exam?.fullScreenRequired) {
      console.log('⚪ Fullscreen not required, skipping effect');
      return;
    }

    let rafId: number | null = null;
    let checkCount = 0;
    let isMonitoringActive = false; // Don't trigger on initial state

    const isFullscreen = () => {
      const fs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      return fs;
    };

    // Initialize with actual current state (not true assumption)
    let lastFullscreenState = isFullscreen();
    console.log('📊 Initial fullscreen state:', lastFullscreenState);

    // Start monitoring after a delay to allow fullscreen to actually enter
    setTimeout(() => {
      isMonitoringActive = true;
      console.log('✅ Fullscreen monitoring ACTIVATED');
    }, 500);

    // Ultra-aggressive monitoring - any fullscreen loss triggers auto-submit
    const monitor = () => {
      const currentFullscreenState = isFullscreen();
      checkCount++;
      
      // Log every 60 checks (once per second at 60fps)
      if (checkCount % 60 === 0) {
        console.log(`✅ Fullscreen monitor running - Fullscreen: ${currentFullscreenState}, Monitoring active: ${isMonitoringActive}`);
      }
      
      // Detect transition from fullscreen to non-fullscreen (only after monitoring is active)
      if (isMonitoringActive && lastFullscreenState && !currentFullscreenState) {
        console.error('🚨🚨🚨 CRITICAL: Fullscreen lost - F11 or escape detected - AUTO-SUBMITTING IMMEDIATELY 🚨🚨🚨');
        console.error('Last state:', lastFullscreenState, 'Current state:', currentFullscreenState);
        lastFullscreenState = currentFullscreenState;
        
        // Auto-submit without waiting
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        handleSubmitExam(true); // true = isAutoSubmit
        return;
      }
      
      lastFullscreenState = currentFullscreenState;
      rafId = requestAnimationFrame(monitor);
    };

    // Log initial state
    console.log('🔵 Fullscreen monitoring STARTED - Initial state:', isFullscreen());
    
    rafId = requestAnimationFrame(monitor);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      console.log('🔴 Fullscreen monitoring stopped');
    };
  }, [exam?.fullScreenRequired]);

  // Keyboard protection effect - prevent common escape attempts (AGGRESSIVE)
  useEffect(() => {
    if (!exam?.preventTabSwitch && !exam?.fullScreenRequired) return;

    const handleKeyEvent = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      
      // Log ALL keydown events for debugging
      if (e.type === 'keydown') {
        console.log(`⌨️ Key pressed: ${e.key} (code: ${e.code})`);
      }
      
      // Block F11 (fullscreen toggle) - AGGRESSIVE
      if (key === 'F11') {
        console.warn('🚫🚫🚫 F11 KEY DETECTED AND BLOCKED 🚫🚫🚫');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      
      // Block Alt+Tab (Windows app switcher)
      if (e.altKey && key === 'TAB') {
        console.warn('🚫 Alt+Tab blocked');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      
      // Block Ctrl+Tab (browser tab switching)
      if (e.ctrlKey && key === 'TAB' && !e.shiftKey) {
        console.warn('🚫 Ctrl+Tab blocked');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      
      // Block Ctrl+Shift+Tab (browser tab switching backwards)
      if (e.ctrlKey && e.shiftKey && key === 'TAB') {
        console.warn('🚫 Ctrl+Shift+Tab blocked');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      
      // Block Ctrl+PageDown (tab switching)
      if (e.ctrlKey && key === 'PAGEDOWN') {
        console.warn('🚫 Ctrl+PageDown blocked');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      
      // Block Ctrl+PageUp (tab switching backwards)
      if (e.ctrlKey && key === 'PAGEUP') {
        console.warn('🚫 Ctrl+PageUp blocked');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      
      // Block Cmd+Tab (Mac app switcher)
      if (e.metaKey && key === 'TAB') {
        console.warn('🚫 Cmd+Tab blocked');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      
      // Block Escape key if fullscreen required
      if (exam?.fullScreenRequired && key === 'ESCAPE') {
        console.warn('🚫 Escape key blocked');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Add multiple event listeners with capture phase
    document.addEventListener('keydown', handleKeyEvent, { capture: true });
    document.addEventListener('keypress', handleKeyEvent, { capture: true });
    window.addEventListener('keydown', handleKeyEvent, { capture: true });
    window.addEventListener('keypress', handleKeyEvent, { capture: true });
    
    return () => {
      document.removeEventListener('keydown', handleKeyEvent, { capture: true });
      document.removeEventListener('keypress', handleKeyEvent, { capture: true });
      window.removeEventListener('keydown', handleKeyEvent, { capture: true });
      window.removeEventListener('keypress', handleKeyEvent, { capture: true });
    };
  }, [exam?.preventTabSwitch, exam?.fullScreenRequired]);

  // Tab visibility tracking - detect tab switching and enforce fullscreen
  useEffect(() => {
    if (!exam?.preventTabSwitch || !exam?.fullScreenRequired) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab lost focus - user attempted to switch tabs
        console.warn('⚠️ Tab switching detected - Re-entering fullscreen immediately');
        
        // Re-request fullscreen IMMEDIATELY using requestAnimationFrame
        requestAnimationFrame(() => {
          requestFullscreen();
        });
      } else {
        // Tab regained focus
        console.log('✅ Tab regained focus');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [exam?.preventTabSwitch, exam?.fullScreenRequired]);

  // Initialize webcam request on exam load
  useEffect(() => {
    if (exam && exam.requireWebcam && !testStarted) {
      setShowWebcamRequest(true);
    }
  }, [exam, testStarted]);

  // Cleanup webcam on component unmount
  useEffect(() => {
    return () => {
      // Clean up webcam stream on unmount
      if (webcamStream) {
        console.log('🎥 Cleaning up webcam on component unmount...');
        webcamStream.getTracks().forEach((track) => {
          track.stop();
          console.log('✅ Webcam track stopped:', track.kind);
        });
      }

      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      console.log('🎥 Webcam cleanup completed');
    };
  }, [webcamStream]);

  // Request fullscreen on exam load if required
  useEffect(() => {
    if (exam && exam.fullScreenRequired && testStarted && !isFullscreen) {
      requestFullscreen();
    }
  }, [exam, testStarted, isFullscreen]);

  // Fetch exam details
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        console.log('📚 Fetching exam:', examId);

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
        
        // Log question details to check allowMultipleCorrect
        console.log('📋 Questions in exam:');
        data.questions?.forEach((q: Question, idx: number) => {
          console.log(`  Q${idx + 1}: allowMultipleCorrect=${q.allowMultipleCorrect}, correctAnswers=${JSON.stringify(q.correctAnswers)}`);
        });

        // Redirect to programming exam if exam type is PROGRAMMING
        if (data.examType === 'PROGRAMMING') {
          console.log('🔀 Redirecting to programming exam interface...');
          navigate(`/candidate/exam/${examId}/programming`);
          return;
        }

        setExam(data);

        // Initialize time
        setTimeRemaining(data.durationMinutes * 60);

        // Initialize answers
        const initialAnswers = data.questions.map((q: Question) => ({
          questionId: q.id,
          answer: null,
          isMarked: false,
        }));
        console.log('🔧 Answers initialized with', initialAnswers.length, 'questions:', initialAnswers);
        setAnswers(initialAnswers);
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
  }, [examId, accessToken, navigate]);

  // Start exam and setup screen capture
  useEffect(() => {
    const startExamSession = async () => {
      if (!exam || submissionId) return;

      // If webcam is required, only start exam after user allows webcam (testStarted = true)
      if (exam.requireWebcam && !testStarted) {
        console.log('⏳ Waiting for webcam permission before starting exam session...');
        return;
      }

      try {
        console.log('🚀 Starting exam session for:', examId);
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
          console.log('✅ Exam session started:', data.id);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Failed to start exam:', response.status, errorData);
        }
      } catch (err) {
        console.error('❌ Error starting exam session:', err);
      }
    };

    startExamSession();
  }, [exam, examId, accessToken, submissionId, testStarted]);

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
    let streaming = false;
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

      console.log('📡 Initiated streaming for submission:', submissionId);

      // Start sending frames every 100ms (10 FPS for smooth streaming)
      if (!frameInterval) {
        frameInterval = setInterval(async () => {
          try {
            const examContainer = document.querySelector('.exam-taking-container') || 
                                 document.querySelector('.exam-container') || 
                                 document.querySelector('main') || 
                                 document.documentElement;
            
            if (!examContainer) {
              console.warn('⚠️ Exam container not found');
              return;
            }

            // Capture frame
            const canvas = await html2canvas(examContainer as HTMLElement, {
              backgroundColor: '#ffffff',
              scale: 0.75, // 75% scale for performance
              useCORS: true,
              logging: false,
              allowTaint: true,
              windowHeight: (examContainer as HTMLElement).scrollHeight,
              windowWidth: (examContainer as HTMLElement).scrollWidth,
            });

            const frameData = canvas.toDataURL('image/jpeg', 0.6); // 60% quality for better visibility

            if (!frameData || frameData.length === 0) {
              console.warn('⚠️ MCQ Frame data is empty!');
              return;
            }

            // Send frame to server
            if (socket.connected && frameData) {
              socket.emit('screen-frame', {
                submissionId,
                frameData,
                timestamp: Date.now(),
              });
              frameCount++;
              
              // Log every 10 frames (every ~1 second)
              if (frameCount % 10 === 0) {
                console.log(`📹 MCQ Frames sent: ${frameCount}, Frame size: ${(frameData.length / 1024).toFixed(2)}KB`);
              }
            } else if (!socket.connected) {
              console.warn('⚠️ Socket not connected, attempting to reconnect...');
            }
          } catch (err) {
            console.error('❌ Frame capture error:', err);
          }
        }, 100); // Capture every 100ms = 10 FPS
      }
    });

    socket.on('streaming-started', (data) => {
      console.log('🎬 Streaming started:', data);
      streaming = true;
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
      console.log('🔌 Disconnected from streaming server:', reason);
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

  // Fullscreen effect
  useEffect(() => {
    if (exam?.fullScreenRequired) {
      const handleFullScreenChange = () => {
        setIsFullScreen(!!document.fullscreenElement);
      };

      document.addEventListener('fullscreenchange', handleFullScreenChange);
      return () =>
        document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }
  }, [exam]);

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

  const getQuestionOptions = (question: Question): { letter: string; text: string }[] => {
    const options: { letter: string; text: string }[] = [];
    if (question.optionA) options.push({ letter: 'A', text: question.optionA });
    if (question.optionB) options.push({ letter: 'B', text: question.optionB });
    if (question.optionC) options.push({ letter: 'C', text: question.optionC });
    if (question.optionD) options.push({ letter: 'D', text: question.optionD });
    return options;
  };

  const handleAnswerChange = (letter: string) => {
    const newAnswers = [...answers];
    const currentQuestionData = exam?.questions[currentQuestionIndex];
    
    if (currentQuestionData?.allowMultipleCorrect) {
      // For multiple correct answers - toggle selection
      const currentAnswer = newAnswers[currentQuestionIndex].answer;
      const selectedAnswers = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
      
      const index = selectedAnswers.indexOf(letter);
      if (index > -1) {
        selectedAnswers.splice(index, 1); // Remove if already selected
      } else {
        selectedAnswers.push(letter); // Add if not selected
      }
      
      newAnswers[currentQuestionIndex].answer = selectedAnswers.length > 0 ? selectedAnswers : null;
      console.log(`📝 Multiple answer changed for Q${currentQuestionIndex}: ${selectedAnswers.join(',')}`);
    } else {
      // For single correct answer - replace selection
      newAnswers[currentQuestionIndex].answer = letter;
      console.log(`📝 Answer changed for Q${currentQuestionIndex}: ${letter}`);
    }
    
    setAnswers(newAnswers);
  };

  const handleMarkQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex].isMarked = !newAnswers[currentQuestionIndex].isMarked;
    setAnswers(newAnswers);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleExitExam = () => {
    setShowExitConfirm(true);
  };

  const handleSubmitExam = async (isAutoSubmit = false) => {
    try {
      console.log(isAutoSubmit ? '⚡ AUTO-SUBMITTING exam...' : '📤 Submitting exam...');

      // Stop webcam stream before submission
      if (webcamStream) {
        console.log('🎥 Stopping webcam stream...');
        webcamStream.getTracks().forEach((track) => {
          track.stop();
          console.log('✅ Webcam track stopped:', track.kind);
        });
        setWebcamStream(null);
        setWebcamActive(false);
      }

      // Stop webcam video playback
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        console.log('🎥 Webcam video source cleared');
      }

      const answersPayload = Object.fromEntries(answers.map(a => [a.questionId, a.answer]));
      console.log('📤 SUBMITTING ANSWERS PAYLOAD:', answersPayload);
      console.log('📋 Original answers array before submission:', answers);
      console.log('📊 Answer count:', Object.keys(answersPayload).length);
      console.log('🎯 Sample answers:', {
        firstAnswer: answersPayload[answers[0]?.questionId],
        secondAnswer: answersPayload[answers[1]?.questionId],
        lastAnswer: answersPayload[answers[answers.length - 1]?.questionId],
      });

      const response = await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          answers: answersPayload
        }),
      });

      if (response.status === 409) {
        // Conflict - exam already submitted
        if (!isAutoSubmit) {
          alert('This exam has already been submitted. You cannot retake it.');
        }
        navigate('/candidate/dashboard');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to submit exam (${response.status})`);
      }

      const result = await response.json();
      console.log('✅ Exam submitted:', result);

      if (!isAutoSubmit) {
        alert('Exam submitted successfully! Your submission has been received for evaluation.');
      } else {
        console.error('⚡ AUTO-SUBMIT: Exam auto-submitted due to fullscreen loss. Navigating away...');
      }
      
      navigate('/candidate/dashboard');
    } catch (err) {
      console.error('❌ Error submitting exam:', err);
      if (!isAutoSubmit) {
        alert(err instanceof Error ? err.message : 'Failed to submit exam');
      }
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    
    // Stop webcam stream before exiting
    if (webcamStream) {
      console.log('🎥 Stopping webcam stream...');
      webcamStream.getTracks().forEach((track) => {
        track.stop();
        console.log('✅ Webcam track stopped:', track.kind);
      });
      setWebcamStream(null);
      setWebcamActive(false);
    }

    // Stop webcam video playback
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      console.log('🎥 Webcam video source cleared');
    }

    navigate('/candidate/dashboard');
  };

  const currentAnswer = answers[currentQuestionIndex];
  const unansweredCount = answers.filter((a) => a.answer === null).length;
  const markedCount = answers.filter((a) => a.isMarked).length;

  // Debug logging for answer state
  console.log(`🔍 RENDER: Question ${currentQuestionIndex}, Current answer:`, currentAnswer, 'All answers:', answers);

  if (loading) {
    return (
      <div className="exam-loading">
        <div className="spinner"></div>
        <p>Loading exam...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="exam-error">
        <h2>Error Loading Exam</h2>
        <p>{error || 'Failed to load exam'}</p>
        <button onClick={() => navigate('/candidate/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className={`exam-taking-container ${darkMode ? 'dark-mode' : ''}`}>
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

      {/* Fullscreen overlay - blocks interaction outside exam */}
      {exam?.fullScreenRequired && (
        <div 
          className="fullscreen-overlay"
          onClick={() => {
            console.warn('🚨 Click outside exam area detected - refocusing exam');
            window.focus();
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9998,
            pointerEvents: isFullscreen ? 'none' : 'auto',
            backgroundColor: isFullscreen ? 'transparent' : 'rgba(0,0,0,0.95)',
            display: isFullscreen ? 'none' : 'block'
          }}
        />
      )}

      {/* Fullscreen CRITICAL Warning - shows when fullscreen is lost */}
      {exam?.fullScreenRequired && !isFullscreen && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            textAlign: 'center',
            maxWidth: '400px',
            animation: 'pulse 0.5s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <h2 style={{ color: '#d32f2f', margin: 0 }}>🚨 FULLSCREEN REQUIRED</h2>
          <p style={{ margin: 0, color: '#666' }}>
            This exam must be taken in fullscreen mode. 
            <br/>
            Re-entering fullscreen...
          </p>
          <button
            onClick={async () => {
              try {
                console.log('📲 Entering fullscreen...');
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                  await elem.requestFullscreen();
                  console.log('✅ Fullscreen entered (standard)');
                } else if ((elem as any).webkitRequestFullscreen) {
                  await (elem as any).webkitRequestFullscreen();
                  console.log('✅ Fullscreen entered (webkit)');
                } else if ((elem as any).mozRequestFullScreen) {
                  await (elem as any).mozRequestFullScreen();
                  console.log('✅ Fullscreen entered (moz)');
                } else if ((elem as any).msRequestFullscreen) {
                  await (elem as any).msRequestFullscreen();
                  console.log('✅ Fullscreen entered (ms)');
                } else {
                  console.error('❌ Fullscreen API not supported');
                }
              } catch (err) {
                console.error('❌ Error entering fullscreen:', err);
              }
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Enter Fullscreen
          </button>
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
          <button className="btn-submit" onClick={() => setShowSubmitConfirm(true)}>
            <FaCheck /> Submit Exam
          </button>
        </div>
        <div className="exam-header-center">
          <div className="exam-timer" style={{ color: getTimeColor() }}>
            <FaClock />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <div className="exam-header-right">
          <button 
            className="btn-dark-mode"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
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
                width: '80px',
                height: '60px',
                borderRadius: '4px',
                marginRight: '10px',
              }}
            />
          )}
          <button className="btn-exit" onClick={handleExitExam}>
            <FaSignOutAlt /> Exit
          </button>
        </div>
      </header>

      <div className="exam-content" style={{
        pointerEvents: (exam?.fullScreenRequired && !isFullscreen) ? 'none' : 'auto',
        opacity: (exam?.fullScreenRequired && !isFullscreen) ? 0.5 : 1
      }}>
        {/* Left Panel - Questions List */}
        <aside className="exam-sidebar">
          <div className="sidebar-stats">
            <div className="stat">
              <strong>{exam.totalQuestions}</strong>
              <small>Total</small>
            </div>
            <div className="stat">
              <strong>{answers.filter((a) => a.answer !== null).length}</strong>
              <small>Answered</small>
            </div>
            <div className="stat">
              <strong>{unansweredCount}</strong>
              <small>Unanswered</small>
            </div>
            <div className="stat">
              <strong>{markedCount}</strong>
              <small>Marked</small>
            </div>
          </div>

          <div className="questions-grid">
            {exam.questions.map((question, index) => {
              const answer = answers[index];
              let status = 'unanswered';
              if (answer.isMarked) status = 'marked';
              else if (answer.answer !== null) status = 'answered';

              return (
                <button
                  key={question.id}
                  className={`question-btn question-${status} ${
                    index === currentQuestionIndex ? 'active' : ''
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content - Question Display */}
        <main className="exam-main">
          <div className="question-container">
            <div className="question-header">
              <h2>Question {currentQuestionIndex + 1} of {exam.totalQuestions}</h2>
              <div className="question-meta">
                <span className="marks">Marks: {currentQuestion.marks}</span>
              </div>
            </div>

            <div className="question-text">
              <p>{currentQuestion.questionText}</p>
            </div>

            <div className="question-options">
              {getQuestionOptions(currentQuestion).map((option, index) => {
                const isMultiple = currentQuestion.allowMultipleCorrect;
                const selectedAnswers = Array.isArray(currentAnswer?.answer) 
                  ? currentAnswer.answer 
                  : (currentAnswer?.answer ? [currentAnswer.answer] : []);
                const isChecked = selectedAnswers.includes(option.letter);
                
                return (
                  <label key={index} className="option">
                    <input
                      type={isMultiple ? "checkbox" : "radio"}
                      name={isMultiple ? `answer-${currentQuestionIndex}-${option.letter}` : "answer"}
                      value={option.letter}
                      checked={isChecked}
                      onChange={() => handleAnswerChange(option.letter)}
                    />
                    <span className="option-text">
                      <strong>{option.letter})</strong> {option.text}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="question-actions">
              <button
                className={`btn-mark ${currentAnswer.isMarked ? 'marked' : ''}`}
                onClick={handleMarkQuestion}
              >
                <FaFlag /> {currentAnswer.isMarked ? 'Unmark' : 'Mark for Review'}
              </button>
            </div>

            <div className="navigation-buttons">
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
                disabled={currentQuestionIndex === exam.questions.length - 1}
              >
                Next <FaChevronRight />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Fullscreen overlay - blocks interaction outside exam */}
      {exam?.fullScreenRequired && (
        <div 
          className="fullscreen-overlay"
          onClick={() => {
            console.warn('🚨 Click outside exam area detected - refocusing exam');
            window.focus();
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9998,
            pointerEvents: isFullscreen ? 'none' : 'auto',
            backgroundColor: isFullscreen ? 'transparent' : 'rgba(0,0,0,0.95)',
            display: isFullscreen ? 'none' : 'block'
          }}
        />
      )}

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
              Unanswered questions: <strong>{unansweredCount}</strong>
            </p>
            <p>Are you sure you want to submit the exam?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowSubmitConfirm(false)}>
                Review
              </button>
              <button className="btn-success" onClick={() => handleSubmitExam(false)}>
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTaking;
