import React, { useState, useCallback } from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
} from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import ExamBasicInfo from './ExamBasicInfo';
import ExamSettings from './ExamSettings';
import ExamQuestions from './ExamQuestions';
import ExamProgrammingQuestions from './ExamProgrammingQuestions';
import ExamReview from './ExamReview';
import './styles/CreateExam.css';

interface ExamData {
  name: string;
  description: string;
  subject: string;
  category: string;
  level: string;
  examType: 'MCQ' | 'PROGRAMMING';
  durationMinutes: number;
  startTime: string;
  endTime: string;
  passingScore: number;
  negativeMarking: boolean;
  negativeMarkPercentage: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  allowBackNavigation: boolean;
  showResultsImmediately: boolean;
  requireWebcam: boolean;
  fullScreenRequired: boolean;
  preventTabSwitch: boolean;
  autoSaveInterval: number;
  questions: any[];
  programmingQuestions: any[];
}

const INITIAL_EXAM_DATA: ExamData = {
  name: '',
  description: '',
  subject: '',
  category: '',
  level: 'MEDIUM',
  examType: 'MCQ',
  durationMinutes: 60,
  startTime: new Date().toISOString().slice(0, 16),
  endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
  passingScore: 0,
  negativeMarking: false,
  negativeMarkPercentage: 0,
  randomizeQuestions: false,
  randomizeOptions: false,
  allowBackNavigation: true,
  showResultsImmediately: false,
  requireWebcam: false,
  fullScreenRequired: false,
  preventTabSwitch: false,
  autoSaveInterval: 30,
  questions: [],
  programmingQuestions: [],
};

interface CreateExamProps {
  onClose?: () => void;
  onSuccess?: () => void;
  examId?: string;
}

const CreateExam: React.FC<CreateExamProps> = ({ onClose, onSuccess, examId }) => {
  const { accessToken } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [examData, setExamData] = useState<ExamData>(INITIAL_EXAM_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [questionIdCounter, setQuestionIdCounter] = useState(0);

  const STEPS = [
    { number: 1, title: 'Basic Info', component: ExamBasicInfo },
    { number: 2, title: 'Settings', component: ExamSettings },
    {
      number: 3,
      title: examData.examType === 'MCQ' ? 'MCQ Questions' : 'Programming',
      component: examData.examType === 'MCQ' ? ExamQuestions : ExamProgrammingQuestions,
    },
    { number: 4, title: 'Review', component: ExamReview },
  ];

  const validateStep = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (activeStep === 1) {
      if (!examData.name) errors.name = 'Exam name is required';
      if (!examData.subject) errors.subject = 'Subject is required';
      if (!examData.category) errors.category = 'Category is required';
      if (!examData.examType) errors.examType = 'Exam type is required';
    }

    if (activeStep === 2) {
      if (examData.durationMinutes < 1) errors.duration = 'Duration must be at least 1 minute';
      if (!examData.startTime) errors.startTime = 'Start time is required';
      if (!examData.endTime) errors.endTime = 'End time is required';
      if (new Date(examData.startTime) >= new Date(examData.endTime)) {
        errors.timeRange = 'End time must be after start time';
      }
    }

    if (activeStep === 3) {
      const questionCount =
        examData.examType === 'MCQ'
          ? examData.questions.length
          : examData.programmingQuestions.length;
      if (questionCount === 0) {
        errors.questions = 'At least one question is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [activeStep, examData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setExamData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddQuestion = (question: any) => {
    const newId = Date.now() + questionIdCounter;
    setQuestionIdCounter((prev) => prev + 1);
    setExamData((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...question, id: newId }],
    }));
  };

  const handleAddProgrammingQuestion = (question: any) => {
    const newId = Date.now() + questionIdCounter;
    setQuestionIdCounter((prev) => prev + 1);
    setExamData((prev) => ({
      ...prev,
      programmingQuestions: [
        ...prev.programmingQuestions,
        { ...question, id: newId },
      ],
    }));
  };

  const handleUpdateQuestion = (questionId: number, updatedQuestion: any) => {
    setExamData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, ...updatedQuestion } : q,
      ),
    }));
  };

  const handleUpdateProgrammingQuestion = (questionId: number, updatedQuestion: any) => {
    setExamData((prev) => ({
      ...prev,
      programmingQuestions: prev.programmingQuestions.map((q) =>
        q.id === questionId ? { ...q, ...updatedQuestion } : q,
      ),
    }));
  };

  const handleDeleteQuestion = (questionId: number) => {
    setExamData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
  };

  const handleDeleteProgrammingQuestion = (questionId: number) => {
    setExamData((prev) => ({
      ...prev,
      programmingQuestions: prev.programmingQuestions.filter((q) => q.id !== questionId),
    }));
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep < STEPS.length) {
        setActiveStep(activeStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    if (!accessToken) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📤 Submitting exam with data:', {
        examName: examData.name,
        questionCount: examData.examType === 'MCQ' ? examData.questions.length : examData.programmingQuestions.length,
        questions: examData.questions,
        token: `${accessToken.substring(0, 20)}...` // Log first 20 chars of token for debugging
      });

      const endpoint = examId ? `/exams/${examId}` : '/exams';
      const method = examId ? 'PATCH' : 'POST';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      console.log('🔐 Using token from AuthContext, making request to:', `${apiUrl}/api${endpoint}`);

      const response = await fetch(`${apiUrl}/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...examData,
          startTime: new Date(examData.startTime).toISOString(),
          endTime: new Date(examData.endTime).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || `Failed to create exam (${response.status})`;
        
        if (response.status === 401) {
          console.error('🔐 Authentication error details:', {
            status: response.status,
            statusText: response.statusText,
            errorData,
            tokenPrefix: accessToken.substring(0, 20),
          });
          errorMessage = 'Unauthorized: Your session may have expired. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'Forbidden: You do not have permission to create exams.';
        }
        
        throw new Error(errorMessage);
      }

      const exam = await response.json();
      
      console.log('✅ Exam created:', exam.id, 'Now saving', examData.questions.length, 'questions');

      // Add questions in separate requests
      if (examData.examType === 'MCQ') {
        const questionErrors: string[] = [];
        for (const question of examData.questions) {
          try {
            console.log('📝 Sending question to backend:', {
              questionText: question.questionText?.substring(0, 50),
              allowMultipleCorrect: question.allowMultipleCorrect,
              correctAnswers: question.correctAnswers,
              correctAnswer: question.correctAnswer,
            });
            const questionResponse = await fetch(
              `${apiUrl}/api/exams/${exam.id}/questions`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(question),
              },
            );
            
            if (!questionResponse.ok) {
              const errorData = await questionResponse.json().catch(() => ({}));
              questionErrors.push(`Question failed: ${errorData.message || 'Unknown error'}`);
              console.error('Question save failed:', question, errorData);
            }
          } catch (err) {
            questionErrors.push(`Question error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            console.error('Question error:', question, err);
          }
        }
        
        if (questionErrors.length > 0) {
          throw new Error(`Some questions failed to save: ${questionErrors.join(', ')}`);
        }
      } else {
        const questionErrors: string[] = [];
        for (const question of examData.programmingQuestions) {
          try {
            const questionResponse = await fetch(
              `${apiUrl}/api/exams/${exam.id}/programming-questions`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(question),
              },
            );
            
            if (!questionResponse.ok) {
              const errorData = await questionResponse.json().catch(() => ({}));
              questionErrors.push(`Question failed: ${errorData.message || 'Unknown error'}`);
              console.error('Programming question save failed:', question, errorData);
            }
          } catch (err) {
            questionErrors.push(`Question error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            console.error('Programming question error:', question, err);
          }
        }
        
        if (questionErrors.length > 0) {
          throw new Error(`Some questions failed to save: ${questionErrors.join(', ')}`);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Exam creation error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = STEPS[activeStep - 1].component;

  return (
    <div className="create-exam-container">
      <div className="create-exam-header">
        <h1>Create Exam</h1>
        <button className="btn-close" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="progress-indicator">
        {STEPS.map((step, index) => (
          <div
            key={step.number}
            className={`progress-step ${activeStep === step.number ? 'active' : ''} ${
              activeStep > step.number ? 'completed' : ''
            }`}
            onClick={() => {
              if (activeStep > step.number && validateStep()) {
                setActiveStep(step.number);
              }
            }}
          >
            <div className="step-number">
              {activeStep > step.number ? <FaCheckCircle /> : step.number}
            </div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Success Message */}
      {success && (
        <div className="success-message">
          <FaCheckCircle /> Exam created successfully!
        </div>
      )}

      {/* Form Errors */}
      {Object.keys(formErrors).length > 0 && (
        <div className="form-errors">
          {Object.entries(formErrors).map(([field, message]) => (
            <div key={field} className="error-item">
              <span className="error-dot">●</span> {message}
            </div>
          ))}
        </div>
      )}

      {/* Step Content */}
      <div className="step-content">
        <CurrentStepComponent
          examData={examData}
          onChange={handleInputChange}
          onAddQuestion={handleAddQuestion}
          onAddProgrammingQuestion={handleAddProgrammingQuestion}
          onUpdateQuestion={handleUpdateQuestion}
          onUpdateProgrammingQuestion={handleUpdateProgrammingQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onDeleteProgrammingQuestion={handleDeleteProgrammingQuestion}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="step-navigation">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={activeStep === 1 || loading}
        >
          <FaArrowLeft /> Previous
        </button>

        {activeStep === STEPS.length ? (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <FaSpinner className="spinner" /> : <FaSave />}
            {loading ? 'Saving...' : 'Create Exam'}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={loading}
          >
            Next <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateExam;
