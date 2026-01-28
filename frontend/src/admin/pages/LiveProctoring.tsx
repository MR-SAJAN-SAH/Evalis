import React, { useState, useEffect } from 'react';
import { FaEye, FaVideo, FaMicrophone, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import io, { Socket } from 'socket.io-client';
import './styles/LiveProctoring.css';

interface LiveSession {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  examId: string;
  examName: string;
  examType: string;
  startTime: string;
  duration: number;
  elapsedTime: number;
  remainingTime: number;
  status: 'active' | 'flagged' | 'warning';
  webcamStatus: 'active' | 'inactive' | 'error';
  audioStatus: 'active' | 'inactive' | 'error';
  tabSwitches: number;
  suspiciousActivity: string[];
  progress: number;
  score?: number;
}

const LiveProctoring: React.FC = () => {
  const { accessToken } = useAuth();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'flagged' | 'warning'>('all');
  const [refreshInterval, setRefreshInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [showScreenModal, setShowScreenModal] = useState(false);

  useEffect(() => {
    fetchLiveSessions();
    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchLiveSessions, 5000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [accessToken]);

  const fetchLiveSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exams/submissions/live', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns array directly, all already filtered for in-progress
        const activeSessions = (Array.isArray(data) ? data : data.data || [])
          .map((session: any) => ({
            id: session.id,
            candidateId: session.userId,
            candidateName: session.user?.name || 'Unknown',
            candidateEmail: session.user?.email || 'unknown@example.com',
            examId: session.examId,
            examName: session.exam?.name || 'Unknown Exam',
            examType: session.exam?.examType || 'MCQ',
            startTime: session.startTime,
            duration: session.exam?.durationMinutes || 60,
            elapsedTime: calculateElapsedMinutes(session.startTime),
            remainingTime: (session.exam?.durationMinutes || 60) - calculateElapsedMinutes(session.startTime),
            status: 'active', // All sessions from API are in-progress
            webcamStatus: 'active',
            audioStatus: 'active',
            tabSwitches: 0,
            suspiciousActivity: [],
            progress: ((calculateElapsedMinutes(session.startTime) / (session.exam?.durationMinutes || 60)) * 100),
            score: session.score,
          }));

        setSessions(activeSessions);
        setError(null);
      } else {
        throw new Error('Failed to fetch live sessions');
      }
    } catch (err: any) {
      console.error('Error fetching live sessions:', err);
      setError(err.message);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateElapsedMinutes = (startTime: string): number => {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    return Math.floor((now - start) / (1000 * 60));
  };

  // Live video streaming effect - WebSocket connection when modal is open
  useEffect(() => {
    if (!showScreenModal || !selectedSession) return;

    let isComponentMounted = true;
    let socket: Socket | null = null;

    // Connect to WebSocket for live streaming (use the `screen-stream` namespace)
    // Get backend URL from env or default to localhost:3000
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const baseUrl = apiUrl.replace(/^http/, 'ws'); // Convert http(s) to ws(s)
    const socketUrl = baseUrl + '/screen-stream';
    
    console.log('🔌 Connecting to WebSocket:', socketUrl);
    socket = io(socketUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ Connected to live stream server (screen-stream namespace)');
      
      // Watch the candidate's screen - include organization from auth context
      const orgId = sessionStorage.getItem('organizationName') || 'default';

      console.log(`📺 Admin emitting watch-screen for submission: ${selectedSession.id}, org: ${orgId}`);
      
      socket.emit('watch-screen', {
        submissionId: selectedSession.id,
        organizationId: orgId,
      });
    });

    // Receive video frames
    socket.on('screen-frame', (data: { frameData: string; timestamp: number }) => {
      if (!isComponentMounted) return;
      
      console.log(`📸 Admin received frame, size: ${data.frameData ? (data.frameData.length / 1024).toFixed(2) : 0}KB`);
      
      const imgElement = document.querySelector('.screen-image') as HTMLImageElement;
      const loadingElement = document.querySelector('.screen-loading') as HTMLElement;
      const errorElement = document.querySelector('.screen-error') as HTMLElement;

      if (!imgElement) {
        console.error('❌ Image element not found in DOM!');
        return;
      }

      if (data.frameData) {
        try {
          imgElement.src = data.frameData;
          imgElement.onload = () => {
            console.log('✅ Image loaded successfully');
          };
          imgElement.onerror = () => {
            console.error('❌ Image failed to load');
          };
          console.log('✅ Image src set successfully');
        } catch (err) {
          console.error('❌ Error setting image src:', err);
        }
      } else {
        console.warn('⚠️ No frameData in payload');
      }
      
      if (loadingElement) {
        loadingElement.style.display = 'none';
        console.log('✅ Loading spinner hidden');
      }
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    });

    // Stream ended
    socket.on('stream-ended', (data: { submissionId: string }) => {
      if (!isComponentMounted) return;
      
      const errorElement = document.querySelector('.screen-error') as HTMLElement;
      if (errorElement) {
        errorElement.style.display = 'block';
        errorElement.innerHTML = '<p>📹 Candidate exam has ended. Stream disconnected.</p>';
      }
    });

    // Watching started
    socket.on('watching-started', (data) => {
      console.log('👁️ Now watching:', data);
    });

    socket.on('watch-error', (data) => {
      const errorElement = document.querySelector('.screen-error') as HTMLElement;
      if (errorElement && isComponentMounted) {
        errorElement.style.display = 'block';
        errorElement.innerHTML = `<p>⚠️ ${data.message}</p>`;
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      const errorElement = document.querySelector('.screen-error') as HTMLElement;
      if (errorElement && isComponentMounted) {
        errorElement.style.display = 'block';
        errorElement.innerHTML = '<p>⚠️ Unable to connect to live stream. Retrying...</p>';
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from live stream');
    });

    return () => {
      isComponentMounted = false;
      if (socket) {
        socket.emit('stop-watching', { submissionId: selectedSession.id });
        socket.disconnect();
      }
    };
  }, [showScreenModal, selectedSession]);

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'warning':
        return 'status-warning';
      case 'flagged':
        return 'status-flagged';
      default:
        return 'status-active';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="status-icon" />;
      case 'warning':
        return <FaExclamationTriangle className="status-icon warning" />;
      case 'flagged':
        return <FaExclamationTriangle className="status-icon flagged" />;
      default:
        return null;
    }
  };

  const getCameraStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <FaVideo className="camera-active" title="Webcam Active" />;
      case 'inactive':
        return <FaVideo className="camera-inactive" title="Webcam Inactive" />;
      case 'error':
        return <FaVideo className="camera-error" title="Webcam Error" />;
      default:
        return null;
    }
  };

  const getMicStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <FaMicrophone className="mic-active" title="Microphone Active" />;
      case 'inactive':
        return <FaMicrophone className="mic-inactive" title="Microphone Inactive" />;
      case 'error':
        return <FaMicrophone className="mic-error" title="Microphone Error" />;
      default:
        return null;
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="live-proctoring-page">
        <div className="loading-spinner">
          <p>Loading live sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-proctoring-page">
      <div className="proctoring-header">
        <div className="header-content">
          <h1>
            <FaEye /> Live Proctoring Monitor
          </h1>
          <p>Real-time monitoring of candidates taking exams</p>
        </div>
        <div className="session-stats">
          <div className="stat-card">
            <span className="stat-number">{sessions.length}</span>
            <span className="stat-label">Active Sessions</span>
          </div>
          <div className="stat-card flagged">
            <span className="stat-number">{sessions.filter((s) => s.status === 'flagged').length}</span>
            <span className="stat-label">Flagged</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-number">{sessions.filter((s) => s.status === 'warning').length}</span>
            <span className="stat-label">Warnings</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <p>{error}</p>
        </div>
      )}

      <div className="filter-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({sessions.length})
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({sessions.filter((s) => s.status === 'active').length})
          </button>
          <button
            className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
          >
            Warnings ({sessions.filter((s) => s.status === 'warning').length})
          </button>
          <button
            className={`filter-btn ${filter === 'flagged' ? 'active' : ''}`}
            onClick={() => setFilter('flagged')}
          >
            Flagged ({sessions.filter((s) => s.status === 'flagged').length})
          </button>
        </div>
        <button className="refresh-btn" onClick={fetchLiveSessions}>
          🔄 Refresh
        </button>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="empty-state">
          <p>No {filter !== 'all' ? filter : ''} sessions at the moment.</p>
        </div>
      ) : (
        <div className="sessions-grid">
          {filteredSessions.map((session) => (
            <div key={session.id} className={`session-card ${getStatusColor(session.status)}`}>
              <div className="session-header">
                <div className="status-badge">
                  {getStatusIcon(session.status)}
                  <span>{session.status.toUpperCase()}</span>
                </div>
                <div className="time-info">
                  <FaClock className="clock-icon" />
                  <span>{session.remainingTime} min left</span>
                </div>
              </div>

              <div className="candidate-info">
                <h3>{session.candidateName}</h3>
                <p className="email">{session.candidateEmail}</p>
              </div>

              <div className="exam-info">
                <div className="exam-name">
                  <strong>Exam:</strong> {session.examName}
                </div>
                <div className="exam-type">
                  <strong>Type:</strong> {session.examType}
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${session.progress}%` }}></div>
                </div>
                <span className="progress-text">
                  {session.elapsedTime} / {session.duration} min
                </span>
              </div>

              <div className="device-status">
                <div className="device-item">
                  {getCameraStatus(session.webcamStatus)}
                  <span>Webcam</span>
                </div>
                <div className="device-item">
                  {getMicStatus(session.audioStatus)}
                  <span>Microphone</span>
                </div>
                <div className="device-item tab-switches">
                  <span className="tab-count">{session.tabSwitches}</span>
                  <span>Tab Switches</span>
                </div>
              </div>

              {session.suspiciousActivity.length > 0 && (
                <div className="suspicious-activity">
                  <strong>⚠️ Alerts:</strong>
                  <ul>
                    {session.suspiciousActivity.map((activity, idx) => (
                      <li key={idx}>{activity}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="session-actions">
                <button className="btn-view" onClick={() => {
                  setSelectedSession(session);
                  setShowScreenModal(true);
                }}>
                  <FaEye /> See Screen
                </button>
                <button className="btn-flag">Flag Session</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Screen View Modal */}
      {showScreenModal && selectedSession && (
        <div className="screen-modal-overlay" onClick={() => setShowScreenModal(false)}>
          <div className="screen-modal" onClick={(e) => e.stopPropagation()}>
            <div className="screen-modal-header">
              <h2>{selectedSession.candidateName}'s Screen</h2>
              <p className="exam-title">{selectedSession.examName}</p>
              <button className="close-btn" onClick={() => setShowScreenModal(false)}>✕</button>
            </div>
            
            <div className="screen-view">
              <img 
                className="screen-image" 
                alt="Live exam screen"
              />
              <div className="screen-loading" id="screen-loading">
                <div className="spinner"></div>
                <p>🔴 Connecting to live video stream...</p>
                <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '1rem' }}>
                  Live updates every 100ms (10 FPS)
                </p>
              </div>
              <div className="screen-error" id="screen-error" style={{ display: 'none', textAlign: 'center', color: '#ef4444', padding: '2rem' }}>
                <p>⚠️ Unable to display screen</p>
              </div>
            </div>

            <div className="screen-modal-footer">
              <div className="session-details">
                <span><strong>Time:</strong> {selectedSession.elapsedTime}/{selectedSession.duration} min</span>
                <span><strong>Progress:</strong> {Math.round(selectedSession.progress)}%</span>
                <span><strong>Status:</strong> {selectedSession.status.toUpperCase()}</span>
              </div>
              <button className="btn-close" onClick={() => setShowScreenModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveProctoring;
