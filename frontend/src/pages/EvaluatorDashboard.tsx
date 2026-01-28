import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaEye, FaSync, FaPlus, FaTrash, FaComment } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const EvaluatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken: contextAccessToken, userEmail, logout } = useAuth();
  
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [evaluatingPaper, setEvaluatingPaper] = useState<any>(null);
  const [evaluatingUserInfo, setEvaluatingUserInfo] = useState<any>(null);
  const [marks, setMarks] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [viewingPaper, setViewingPaper] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [questionMarks, setQuestionMarks] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]); // Will adapt based on questionsData
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [selectedQuestionForComment, setSelectedQuestionForComment] = useState<number>(1);
  const [commentText, setCommentText] = useState<string>('');
  const [questionComments, setQuestionComments] = useState<{ [key: number]: string }>({});
  
  // State for expandable questions with sub-questions
  const [questionsData, setQuestionsData] = useState<any[]>(
    Array(7).fill(null).map((_, idx) => ({
      maxMarks: 4.5,
      marks: 0,
      subQuestions: ['a', 'b'],
      subMarks: { 'a': 0, 'b': 0 }
    }))
  );

  // Get tab from URL
  const getActiveTab = (): string => {
    const path = location.pathname;
    if (path.includes('/evaluations')) return 'evaluations';
    if (path.includes('/completed')) return 'completed';
    if (path.includes('/analytics')) return 'analytics';
    return 'evaluations';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab);

  // Check authentication on mount
  useEffect(() => {
    const token = contextAccessToken || sessionStorage.getItem('accessToken');
    const email = userEmail || sessionStorage.getItem('userEmail');
    
    console.log('🔐 EvaluatorDashboard Auth Check:', {
      hasToken: !!token,
      hasEmail: !!email,
    });

    if (!token || !email) {
      console.warn('❌ No authentication found, redirecting to login');
      navigate('/login');
    } else {
      setAccessToken(token);
    }
  }, [contextAccessToken, userEmail, navigate]);

  const fetchAssignedPapers = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const response = await fetch('/api/papers/evaluator/my-assignments', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPapers(data.data || []);
        setError('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch papers (${response.status})`);
      }
    } catch (err: any) {
      console.error('Error fetching papers:', err);
      setError(err.message || 'Error loading papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchAssignedPapers();
    }
  }, [accessToken]);

  // Fetch user info when evaluating paper changes
  useEffect(() => {
    if (evaluatingPaper && evaluatingPaper.roll && accessToken) {
      const fetchUserInfo = async () => {
        try {
          const response = await fetch(`/api/users/by-roll/${evaluatingPaper.roll}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (response.ok) {
            const data = await response.json();
            setEvaluatingUserInfo(data);
          }
        } catch (err) {
          console.error('Error fetching user info:', err);
        }
      };
      fetchUserInfo();
    } else {
      setEvaluatingUserInfo(null);
    }
  }, [evaluatingPaper, accessToken]);

  // Sync questionMarks array with questionsData length
  useEffect(() => {
    const newMarks = Array(questionsData.length).fill(0);
    setQuestionMarks(newMarks);
  }, [questionsData.length]);

  // Calculate total marks from question data including sub-questions
  const calculateTotalMarksFromQuestions = (questions: any[]) => {
    let total = 0;
    questions.forEach(q => {
      if (q.marks) total += q.marks;
    });
    return Math.min(total, 100); // Cap at 100
  };

  // Handle sub-question mark change
  const handleSubQuestionMarkChange = (questionIdx: number, subQ: string, value: string) => {
    const maxMarks = questionsData[questionIdx].maxMarks;
    let newValue = Math.max(0, parseFloat(value) || 0);
    
    // Cap the value at max marks for the question
    newValue = Math.min(newValue, maxMarks);
    
    const newQuestionsData = [...questionsData];
    newQuestionsData[questionIdx].subMarks[subQ] = newValue;
    
    // Sum sub-question marks for main question
    const totalSubMarks = Object.values(newQuestionsData[questionIdx].subMarks).reduce((a: any, b: any) => (a || 0) + (b || 0), 0);
    
    // Cap total at maxMarks
    newQuestionsData[questionIdx].marks = Math.min(totalSubMarks, maxMarks);
    
    setQuestionsData(newQuestionsData);
    setMarks(calculateTotalMarksFromQuestions(newQuestionsData));
  };

  // Add new question
  const addQuestion = () => {
    const newQuestion = {
      maxMarks: 4.5,
      marks: 0,
      subQuestions: ['a', 'b'],
      subMarks: { 'a': 0, 'b': 0 }
    };
    setQuestionsData([...questionsData, newQuestion]);
  };

  // Add sub-question (a, b, c) to a question
  const addSubQuestion = (questionIdx: number) => {
    const newQuestionsData = [...questionsData];
    const nextLetter = String.fromCharCode(97 + newQuestionsData[questionIdx].subQuestions.length); // a=97
    newQuestionsData[questionIdx].subQuestions.push(nextLetter);
    newQuestionsData[questionIdx].subMarks[nextLetter] = 0;
    setQuestionsData(newQuestionsData);
  };

  // Delete a question
  const deleteQuestion = (questionIdx: number) => {
    const newQuestionsData = questionsData.filter((_, idx) => idx !== questionIdx);
    setQuestionsData(newQuestionsData);
    // Recalculate total marks after deletion
    setMarks(calculateTotalMarksFromQuestions(newQuestionsData));
  };

  // Handle JSON pattern upload
  const handlePatternUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);
        
        // Expected JSON format:
        // {
        //   "questions": [
        //     { "maxMarks": 4.5, "subQuestions": 2 },
        //     { "maxMarks": 3, "subQuestions": 3 }
        //   ]
        // }
        
        if (!jsonData.questions || !Array.isArray(jsonData.questions)) {
          alert('Invalid JSON format. Expected format:\n{\n  "questions": [\n    { "maxMarks": 4.5, "subQuestions": 2 },\n    { "maxMarks": 3, "subQuestions": ["a", "b", "c"] }\n  ]\n}');
          return;
        }

        const newQuestionsData = jsonData.questions.map((q: any) => {
          // Support both numeric (count) and array (letter list) formats
          const subQCount = typeof q.subQuestions === 'number' ? q.subQuestions : (q.subQuestions?.length || 2);
          const subQuestions = typeof q.subQuestions === 'number' 
            ? Array.from({ length: subQCount }, (_, i) => String.fromCharCode(97 + i))
            : q.subQuestions;
          
          const subMarks: any = {};
          subQuestions.forEach((sub: string) => {
            subMarks[sub] = 0;
          });

          return {
            maxMarks: q.maxMarks || 4.5,
            marks: 0,
            subQuestions: subQuestions,
            subMarks: subMarks
          };
        });

        setQuestionsData(newQuestionsData);
        setMarks(0);
        alert(`✅ Pattern loaded successfully! ${newQuestionsData.length} questions configured.`);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Error parsing JSON file. Please check the format and try again.');
      }
    };

    reader.readAsText(file);
    // Reset input so the same file can be uploaded again
    event.target.value = '';
  };

  // Calculate total marks from question marks (old function, kept for compatibility)
  const calculateTotalMarks = (qMarks: number[]) => {
    const total = qMarks.reduce((sum, mark) => sum + (mark || 0), 0);
    return Math.min(total, 100); // Cap at 100

  };

  // Handle question mark change (old function, kept for compatibility)
  const handleQuestionMarkChange = (index: number, value: string) => {
    const newValue = Math.min(parseFloat(value) || 0, 4.5); // Cap at 4.5
    const newMarks = [...questionMarks];
    newMarks[index] = newValue;
    setQuestionMarks(newMarks);
    // Auto-update the overall marks
    setMarks(calculateTotalMarks(newMarks));
  };

  // Reset question marks when opening evaluation
  const resetQuestionMarks = () => {
    // Adapt reset based on current questionsData length
    const numQuestions = questionsData.length > 0 ? questionsData.length : 7;
    const resetData = Array(numQuestions).fill(null).map((_, idx) => ({
      maxMarks: 4.5,
      marks: 0,
      subQuestions: ['a', 'b'],
      subMarks: { 'a': 0, 'b': 0 }
    }));
    setQuestionsData(resetData);
    setQuestionMarks(Array(numQuestions).fill(0));
    setMarks(0);
  };

  // Handle adding/updating comment for a question
  const handleAddComment = () => {
    if (commentText.trim()) {
      setQuestionComments({
        ...questionComments,
        [selectedQuestionForComment]: commentText
      });
      setCommentText('');
      setShowCommentModal(false);
    }
  };

  const handleEvaluatePaper = async () => {
    if (!evaluatingPaper) return;

    try {
      // Update marks
      const marksResponse = await fetch(
        `/api/papers/${evaluatingPaper.paperid}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            status: 'evaluated',
            marks: marks,
          }),
        }
      );

      if (!marksResponse.ok) throw new Error('Failed to update marks');

      // Update notes if provided
      if (notes.trim()) {
        const notesResponse = await fetch(
          `/api/papers/${evaluatingPaper.paperid}/notes`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ notes }),
          }
        );

        if (!notesResponse.ok) throw new Error('Failed to update notes');
      }

      // Update local state
      setPapers(papers.map(p =>
        p.paperid === evaluatingPaper.paperid
          ? { ...p, status: 'evaluated', marks, notes, updatedDate: new Date() }
          : p
      ));

      alert('✅ Paper evaluated successfully!');
      setEvaluatingPaper(null);
      setMarks(0);
      setNotes('');
    } catch (err: any) {
      alert('Error evaluating paper: ' + err.message);
    }
  };

  const handleViewPDF = async (paper: any) => {
    try {
      console.log('📥 Loading PDF for paper:', { paperid: paper.paperid, fileName: paper.fileName });
      console.log('✅ Access token available:', !!accessToken);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`/api/papers/${paper.paperid}/download`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/pdf'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('📊 Response:', { status: response.status, statusText: response.statusText, contentType: response.headers.get('content-type') });
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('📦 Received blob:', { size: blob.size, type: blob.type });
        
        if (blob.size === 0) {
          console.error('❌ Blob is empty');
          alert('Error: PDF file is empty');
          return;
        }
        
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setViewingPaper(paper);
        console.log('✅ PDF loaded successfully, URL:', url.substring(0, 50) + '...');
      } else {
        console.error('❌ HTTP Error:', response.status);
        const text = await response.text();
        console.error('Response body:', text.substring(0, 200));
        alert(`Error: Failed to load PDF (${response.status})`);
      }
    } catch (error: any) {
      console.error('❌ Fetch error:', error.message);
      if (error.name === 'AbortError') {
        alert('Error: PDF download timed out');
      } else {
        alert('Error: ' + error.message);
      }
    }
  };

  // Calculate statistics
  const pendingPapers = papers.filter(p => p.status === 'assigned').length;
  const evaluatedPapers = papers.filter(p => p.status === 'evaluated').length;
  const totalPapers = papers.length;

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '20px' }}>
          <button
            onClick={() => navigate('/evaluator/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            title="Back to Dashboard"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 style={{ margin: 0, color: '#333', fontSize: '28px' }}>
            📝 Evaluator Dashboard
          </h1>
          <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
            {userEmail && <span>👤 {userEmail}</span>}
          </div>
        </div>

        {/* Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #e74c3c'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666', fontWeight: '600' }}>
              ⏳ Pending Evaluation
            </p>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#e74c3c' }}>
              {pendingPapers}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #27ae60'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666', fontWeight: '600' }}>
              ✅ Completed
            </p>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#27ae60' }}>
              {evaluatedPapers}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #3498db'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666', fontWeight: '600' }}>
              📊 Total Assigned
            </p>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#3498db' }}>
              {totalPapers}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0' }}>
          <button
            onClick={() => setActiveTab('evaluations')}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'evaluations' ? '#3498db' : 'transparent',
              color: activeTab === 'evaluations' ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === 'evaluations' ? '3px solid #2980b9' : 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            📋 Pending Evaluations ({pendingPapers})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'completed' ? '#27ae60' : 'transparent',
              color: activeTab === 'completed' ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === 'completed' ? '3px solid #229954' : 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ✅ Completed ({evaluatedPapers})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'analytics' ? '#9b59b6' : 'transparent',
              color: activeTab === 'analytics' ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === 'analytics' ? '3px solid #8e44ad' : 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            📊 Analytics
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ color: '#666', fontSize: '16px' }}>⏳ Loading papers...</p>
          </div>
        ) : activeTab === 'evaluations' ? (
          /* Pending Evaluations Tab */
          <div>
            {papers.filter(p => p.status === 'assigned').length === 0 ? (
              <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '16px' }}>✅ No pending evaluations!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {papers.filter(p => p.status === 'assigned').map((paper: any) => (
                  <div key={paper.paperid} style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                        📄 {paper.roll} - {paper.examname}
                      </h4>
                      <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#666' }}>
                        File: {paper.fileName} ({paper.fileSize ? (paper.fileSize / 1024).toFixed(2) : '0'} KB)
                      </p>
                      <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#666' }}>
                        Batch: {paper.batch} | School: {paper.school} | Department: {paper.department}
                      </p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
                        Uploaded: {new Date(paper.uploadedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleViewPDF(paper)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px'
                        }}
                      >
                        <FaEye /> View
                      </button>
                      <button
                        onClick={() => {
                          setEvaluatingPaper(paper);
                          setMarks(0);
                          setNotes(paper.notes || '');
                          resetQuestionMarks();
                          // Load PDF immediately when evaluating
                          handleViewPDF(paper);
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#27ae60',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px'
                        }}
                      >
                        <FaCheck /> Evaluate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'completed' ? (
          /* Completed Tab */
          <div>
            {papers.filter(p => p.status === 'evaluated').length === 0 ? (
              <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '16px' }}>No completed evaluations yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#333' }}>Roll</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#333' }}>Exam</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#333' }}>Marks</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#333' }}>Notes</th>
                      <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#333' }}>Evaluated Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {papers.filter(p => p.status === 'evaluated').map((paper: any) => (
                      <tr key={paper.paperid} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '15px', color: '#333', fontSize: '13px' }}>{paper.roll}</td>
                        <td style={{ padding: '15px', color: '#333', fontSize: '13px' }}>{paper.examname}</td>
                        <td style={{ padding: '15px', color: '#333', fontSize: '13px', fontWeight: 'bold' }}>
                          {paper.marks !== null ? `${paper.marks}/100` : '—'}
                        </td>
                        <td style={{ padding: '15px', color: '#666', fontSize: '13px', maxWidth: '300px', wordBreak: 'break-word' }}>
                          {paper.notes || '—'}
                        </td>
                        <td style={{ padding: '15px', color: '#999', fontSize: '13px' }}>
                          {new Date(paper.updatedDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Analytics Tab */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Evaluation Summary</h4>
              <div style={{ display: 'grid', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Total Assigned:</span>
                  <strong style={{ color: '#3498db' }}>{totalPapers}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Completed:</span>
                  <strong style={{ color: '#27ae60' }}>{evaluatedPapers}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Pending:</span>
                  <strong style={{ color: '#e74c3c' }}>{pendingPapers}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e0e0e0', paddingTop: '10px', marginTop: '10px' }}>
                  <span style={{ color: '#666' }}>Completion Rate:</span>
                  <strong style={{ color: '#9b59b6' }}>
                    {totalPapers > 0 ? ((evaluatedPapers / totalPapers) * 100).toFixed(1) : 0}%
                  </strong>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>📈 Average Marks</h4>
              <div style={{ display: 'grid', gap: '10px', fontSize: '13px' }}>
                {evaluatedPapers > 0 ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666' }}>Average:</span>
                      <strong style={{ color: '#9b59b6' }}>
                        {(papers.filter(p => p.status === 'evaluated' && p.marks !== null)
                          .reduce((sum, p) => sum + (p.marks || 0), 0) / 
                          papers.filter(p => p.status === 'evaluated' && p.marks !== null).length
                        ).toFixed(1)}/100
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666' }}>Highest:</span>
                      <strong style={{ color: '#27ae60' }}>
                        {Math.max(...papers.filter(p => p.marks !== null).map(p => p.marks || 0), 0)}/100
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666' }}>Lowest:</span>
                      <strong style={{ color: '#e74c3c' }}>
                        {papers.filter(p => p.marks !== null).length > 0 ? 
                          Math.min(...papers.filter(p => p.marks !== null).map(p => p.marks || 100)) : 0}/100
                      </strong>
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#999', fontSize: '13px' }}>No completed evaluations yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Full Screen Evaluation View */}
        {evaluatingPaper && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#e0e0e0',
            display: 'grid',
            gridTemplateColumns: '60% 40%',
            zIndex: 9998,
            gap: '1px'
          }}>
            {/* LEFT SIDE - Paper Viewer (60%) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#f5f5f5',
              position: 'relative'
            }}>
              {/* Paper Header */}
              <div style={{
                padding: '15px 20px',
                backgroundColor: '#2c3e50',
                color: 'white',
                borderBottom: '1px solid #34495e',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>📄 {evaluatingPaper.fileName}</h3>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                    Roll: {evaluatingPaper.roll} | Exam: {evaluatingPaper.examname}
                  </p>
                </div>
              </div>

              {/* Paper Content - Scrollable */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
              }}>
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    style={{
                      width: '100%',
                      minHeight: '100%',
                      border: 'none',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    title="Paper PDF Viewer"
                  />
                ) : (
                  <div style={{ color: '#999', fontSize: '16px', padding: '40px' }}>⏳ Loading PDF...</div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE - Evaluation Form (40%) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
              borderLeft: '1px solid #e0e0e0'
            }}>
              {/* Evaluation Header */}
              <div style={{
                padding: '15px 20px',
                backgroundColor: '#27ae60',
                color: 'white',
                borderBottom: '1px solid #229954',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>✏️ Evaluation Form</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      console.log('Comment button clicked!');
                      console.log('Setting showCommentModal to true');
                      setShowCommentModal(true);
                      // Set to first question if available
                      if (questionsData.length > 0) {
                        setSelectedQuestionForComment(1);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f39c12',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    title="Add comments to questions"
                  >
                    <FaComment size={14} /> Comments
                  </button>
                  <button
                    onClick={() => {
                      setEvaluatingPaper(null);
                      setMarks(0);
                      setNotes('');
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Student Info Header - Right Side */}
              <div style={{
                padding: '15px 20px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e9ecef',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px'
              }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#666', fontWeight: '600', textTransform: 'uppercase' }}>
                    Roll Number
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                    {evaluatingPaper.roll}
                  </p>
                </div>
                {evaluatingUserInfo && (
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#666', fontWeight: '600', textTransform: 'uppercase' }}>
                      Name
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                      {evaluatingUserInfo.fullName || evaluatingUserInfo.name || 'N/A'}
                    </p>
                  </div>
                )}
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#666', fontWeight: '600', textTransform: 'uppercase' }}>
                    Exam
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                    {evaluatingPaper.examname}
                  </p>
                </div>
                {evaluatingUserInfo && (
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#666', fontWeight: '600', textTransform: 'uppercase' }}>
                      Semester
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                      {evaluatingUserInfo.extraInfo?.currentSemester || 'N/A'}
                    </p>
                  </div>
                )}
              </div>

              {/* Evaluation Content - Scrollable */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '20px'
              }}>
                {/* Question-wise Marking Section */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
                    <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '13px', fontWeight: '600' }}>
                      📊 Question-wise Marking
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {/* Upload Pattern Button */}
                      <label
                        style={{
                          background: '#f39c12',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: '600'
                        }}
                        title="Upload JSON pattern file to set questions and max marks"
                      >
                        📤 Upload Pattern
                        <input
                          type="file"
                          accept=".json"
                          onChange={handlePatternUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {/* Add Question Button */}
                      <button
                        onClick={addQuestion}
                        style={{
                          background: '#27ae60',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        gap: '4px',
                        fontWeight: '600'
                        }}
                      >
                        <FaPlus size={12} /> Add Question
                      </button>
                    </div>
                  </div>

                  {/* Questions with Sub-questions - SCROLLABLE */}
                  <div style={{ marginBottom: '15px', border: '1px solid #bdc3c7', borderRadius: '4px', overflow: 'hidden', maxHeight: '450px', overflowY: 'auto' }}>
                    {questionsData.map((question, qIdx) => (
                      <div key={qIdx} style={{ borderBottom: qIdx < questionsData.length - 1 ? '1px solid #e0e0e0' : 'none', backgroundColor: '#fff' }}>
                        {/* Question Header with Number */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '50px 70px 1fr 70px 70px 35px',
                          gap: '10px',
                          padding: '12px',
                          backgroundColor: '#f0f2f5',
                          borderBottom: '1px solid #ddd',
                          alignItems: 'center'
                        }}>
                          <div style={{ fontWeight: '700', color: '#2c3e50', fontSize: '14px', textAlign: 'center', backgroundColor: '#e8f4f8', padding: '6px', borderRadius: '4px' }}>
                            Q{qIdx + 1}
                          </div>
                          <div style={{ textAlign: 'center', fontWeight: '600', color: '#fff', fontSize: '11px', backgroundColor: '#9b59b6', padding: '4px', borderRadius: '3px' }}>
                            Max: {question.maxMarks}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                            Sub-questions
                          </div>
                          <div style={{ textAlign: 'center', fontWeight: '600', color: '#2c3e50', fontSize: '12px', backgroundColor: '#fff', padding: '4px', borderRadius: '3px', border: '1px solid #ddd' }}>
                            Total: {question.marks}
                          </div>
                          <div style={{ textAlign: 'center', fontWeight: '600', color: '#666', fontSize: '11px', backgroundColor: '#ecf0f1', padding: '4px', borderRadius: '3px' }}>
                            {question.marks}/{question.maxMarks}
                          </div>
                          <button
                            onClick={() => deleteQuestion(qIdx)}
                            style={{
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              padding: '5px 6px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600'
                            }}
                            title="Delete question"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>

                        {/* Sub-questions Grid - WRAPPABLE */}
                        <div style={{
                          padding: '12px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                          gap: '8px',
                          alignItems: 'center'
                        }}>
                          {question.subQuestions.map((subQ: string, subIdx: number) => (
                            <div key={subIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                              <label style={{ fontSize: '11px', fontWeight: '600', color: '#2c3e50', minWidth: '18px', textAlign: 'center' }}>
                                {subQ}:
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={question.maxMarks}
                                step="0.5"
                                value={question.subMarks[subQ] || ''}
                                onChange={(e) => handleSubQuestionMarkChange(qIdx, subQ, e.target.value)}
                                placeholder="0"
                                title={`Max: ${question.maxMarks}`}
                                  style={{
                                    padding: '4px 6px',
                                    border: question.subMarks[subQ] >= question.maxMarks ? '2px solid #f39c12' : '1px solid #bdc3c7',
                                    borderRadius: '2px',
                                    fontSize: '11px',
                                    textAlign: 'center',
                                    boxSizing: 'border-box',
                                    fontWeight: question.subMarks[subQ] > 0 ? '600' : 'normal',
                                    backgroundColor: question.subMarks[subQ] >= question.maxMarks ? '#fff8e1' : (question.subMarks[subQ] > 0 ? '#e8f5e9' : 'white'),
                                    flex: '1',
                                    minWidth: '45px'
                                  }}
                                />
                            </div>
                          ))}
                          {/* Add Sub-question Button */}
                          <button
                            onClick={() => addSubQuestion(qIdx)}
                            style={{
                              background: '#3498db',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              padding: '6px 8px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '3px',
                              fontWeight: '600',
                              minWidth: '40px'
                            }}
                            title="Add sub-question"
                          >
                            <FaPlus size={11} /> Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Marks */}
                  <div style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    marginBottom: '15px'
                  }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: 0.9 }}>Total Marks</p>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                      {marks}/100
                    </p>
                  </div>
                </div>

                {/* Overall Marks Input */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px', color: '#2c3e50' }}>
                    Overall Marks (Out of 100) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={marks}
                    onChange={(e) => setMarks(parseInt(e.target.value) || 0)}
                    placeholder="Enter total marks"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #3498db',
                      borderRadius: '4px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}
                  />
                  <small style={{ display: 'block', marginTop: '4px', color: '#7f8c8d' }}>
                    Valid range: 0-100
                  </small>
                </div>

                {/* Instructor Comments */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px', color: '#2c3e50' }}>
                    💬 Instructor Comments
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add feedback, corrections, or suggestions..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #bdc3c7',
                      borderRadius: '4px',
                      fontSize: '12px',
                      minHeight: '80px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Re-check Question Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px', color: '#2c3e50' }}>
                    🔍 Select Question for Re-check
                  </label>
                  <select
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #bdc3c7',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="">--Qno--</option>
                    {questionsData.map((q, idx) => (
                      <option key={idx} value={idx + 1}>Question {idx + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons - Fixed at Bottom */}
              <div style={{
                padding: '15px 20px',
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                gap: '10px',
                position: 'sticky',
                bottom: 0,
                zIndex: 100
              }}>
                <button
                  onClick={() => {
                    setEvaluatingPaper(null);
                    setMarks(0);
                    setNotes('');
                    resetQuestionMarks();
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7f8c8d'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#95a5a6'}
                >
                  ✕ Cancel
                </button>
                <button
                  onClick={handleEvaluatePaper}
                  disabled={marks === 0 || marks > 100}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: marks > 0 && marks <= 100 ? '#27ae60' : '#bdc3c7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: marks > 0 && marks <= 100 ? 'pointer' : 'not-allowed',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (marks > 0 && marks <= 100) {
                      e.currentTarget.style.backgroundColor = '#229954';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (marks > 0 && marks <= 100) {
                      e.currentTarget.style.backgroundColor = '#27ae60';
                    }
                  }}
                >
                  ✅ Submit Evaluation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Modal - Removed, now integrated in evaluation view */}
        {viewingPaper && !evaluatingPaper && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '90%',
              height: '90vh',
              maxWidth: '1000px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f5f5f5'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>📄 {viewingPaper.fileName}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                    Roll: {viewingPaper.roll} | Exam: {viewingPaper.examname}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setViewingPaper(null);
                    setPdfUrl('');
                  }}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ✕ Close
                </button>
              </div>

              {/* PDF Viewer */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#e0e0e0'
              }}>
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    title="Paper PDF Viewer"
                  />
                ) : (
                  <div style={{ color: '#999', fontSize: '16px' }}>Loading PDF...</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comment Modal */}
        {showCommentModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '25px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '18px' }}>
                Add Comment to Question
              </h3>

              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Select Question:
                </label>
                <select
                  value={selectedQuestionForComment}
                  onChange={(e) => setSelectedQuestionForComment(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  {questionsData.map((_, idx) => {
                    const questionNum = idx + 1;
                    return (
                      <option key={questionNum} value={questionNum}>
                        Question {questionNum}{questionComments[questionNum] ? ' ✓' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Comment:
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Enter your comment here..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'Arial, sans-serif',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {questionComments[selectedQuestionForComment] && (
                <div style={{
                  marginBottom: '15px',
                  padding: '10px',
                  backgroundColor: '#f0f7ff',
                  borderLeft: '3px solid #3498db',
                  borderRadius: '4px'
                }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: '600' }}>
                    Current Comment:
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>
                    {questionComments[selectedQuestionForComment]}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCommentModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddComment}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Save Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluatorDashboard;
