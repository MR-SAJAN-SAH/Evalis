import React, { useState } from 'react';
import { FaRobot, FaTimes, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { getApiUrl } from '../../../utils/apiHelper';
import './styles/AIQuestionGenerator.css';

interface AIQuestionGeneratorProps {
  examData: any;
  onGenerateQuestions: (questions: any[]) => void;
  onClose: () => void;
}

interface GenerationConfig {
  numberOfQuestions: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
  languages: string[];
  topics: string;
  timePerQuestion: number;
  memoryLimitMB: number;
  marksPerQuestion: number;
}

const AIQuestionGenerator: React.FC<AIQuestionGeneratorProps> = ({
  examData,
  onGenerateQuestions,
  onClose,
}) => {
  const { accessToken } = useAuth();
  const [config, setConfig] = useState<GenerationConfig>({
    numberOfQuestions: 5,
    difficulty: 'MEDIUM',
    languages: ['JavaScript', 'Python'],
    topics: '',
    timePerQuestion: 30,
    memoryLimitMB: 256,
    marksPerQuestion: 10,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableLanguages = [
    'JavaScript',
    'Python',
    'Java',
    'C++',
    'C#',
    'Go',
    'Rust',
    'TypeScript',
  ];

  const handleConfigChange = (field: keyof GenerationConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleLanguage = (language: string) => {
    setConfig((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
  };

  const generateQuestions = async () => {
    setError(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!config.topics.trim()) {
        throw new Error('Please enter the topics for questions');
      }

      if (config.numberOfQuestions < 1 || config.numberOfQuestions > 20) {
        throw new Error('Number of questions must be between 1 and 20');
      }

      if (config.languages.length === 0) {
        throw new Error('Please select at least one programming language');
      }

      // Prepare the prompt for AI
      const prompt = `You are an expert programming question generator for technical assessments. Generate exactly ${config.numberOfQuestions} programming interview questions with the following specifications:

Exam Subject: ${examData.subject}
Exam Level: ${examData.level}
Topics to Cover: ${config.topics}
Difficulty Level: ${config.difficulty}
Allowed Languages: ${config.languages.join(', ')}

For each question, provide a complete JSON object with:
{
  "problemStatement": "Clear, specific problem description",
  "inputFormat": "Description of input format",
  "outputFormat": "Description of output format",
  "constraints": "Problem constraints and limits",
  "sampleInput": "Example input",
  "sampleOutput": "Example output",
  "explanation": "Explanation of sample test case",
  "difficulty": "${config.difficulty}",
  "timeLimit": ${config.timePerQuestion},
  "memoryLimit": ${config.memoryLimitMB},
  "hints": ["Hint 1", "Hint 2", "Hint 3"],
  "tags": ["tag1", "tag2"]
}

Return ONLY a valid JSON array with exactly ${config.numberOfQuestions} question objects. No markdown formatting, no explanations, just the JSON array.`;

      // Call the backend API
      const response = await fetch(getApiUrl('/ai/generate-questions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          prompt,
          numberOfQuestions: config.numberOfQuestions,
          marksPerQuestion: config.marksPerQuestion,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate questions');
      }

      const data = await response.json();
      const generatedQuestions = data.questions.map((q: any, index: number) => ({
        id: Date.now() + index,
        problemStatement: q.problemStatement,
        inputFormat: q.inputFormat,
        outputFormat: q.outputFormat,
        constraints: q.constraints,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        explanation: q.explanation,
        difficulty: q.difficulty,
        timeLimitSeconds: q.timeLimit,
        memoryLimitMB: q.memoryLimit,
        hints: q.hints,
        tags: q.tags,
        maxMarks: config.marksPerQuestion,
        allowedLanguages: config.languages,
        testCases: [
          {
            input: q.sampleInput,
            output: q.sampleOutput,
            isHidden: false,
          },
        ],
      }));

      onGenerateQuestions(generatedQuestions);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate questions. Please try again.');
      console.error('Error generating questions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-generator-overlay">
      <div className="ai-generator-modal">
        <div className="generator-header">
          <div className="header-content">
            <FaRobot className="robot-icon" />
            <h2>AI Question Generator</h2>
            <p>Generate programming questions using AI</p>
          </div>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="error-alert">
            <p>{error}</p>
          </div>
        )}

        <div className="generator-content">
          {/* Topics Section */}
          <div className="form-group">
            <label>Topics to Cover *</label>
            <textarea
              value={config.topics}
              onChange={(e) => handleConfigChange('topics', e.target.value)}
              placeholder="Enter topics you want the questions to cover (e.g., Arrays, Trees, Dynamic Programming, Sorting, etc.)"
              disabled={loading}
              rows={3}
            />
            <small>Describe the topics or algorithms you want to test</small>
          </div>

          <div className="form-grid">
            {/* Number of Questions */}
            <div className="form-group">
              <label>Number of Questions *</label>
              <input
                type="number"
                min="1"
                max="20"
                value={config.numberOfQuestions}
                onChange={(e) =>
                  handleConfigChange('numberOfQuestions', parseInt(e.target.value))
                }
                disabled={loading}
              />
            </div>

            {/* Difficulty Level */}
            <div className="form-group">
              <label>Difficulty Level *</label>
              <select
                value={config.difficulty}
                onChange={(e) =>
                  handleConfigChange(
                    'difficulty',
                    e.target.value as 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED',
                  )
                }
                disabled={loading}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>

            {/* Time Per Question */}
            <div className="form-group">
              <label>Time Limit (minutes) *</label>
              <input
                type="number"
                min="5"
                max="120"
                step="5"
                value={config.timePerQuestion}
                onChange={(e) =>
                  handleConfigChange('timePerQuestion', parseInt(e.target.value))
                }
                disabled={loading}
              />
            </div>

            {/* Memory Limit */}
            <div className="form-group">
              <label>Memory Limit (MB) *</label>
              <input
                type="number"
                min="64"
                max="1024"
                step="64"
                value={config.memoryLimitMB}
                onChange={(e) => handleConfigChange('memoryLimitMB', parseInt(e.target.value))}
                disabled={loading}
              />
            </div>

            {/* Marks Per Question */}
            <div className="form-group">
              <label>Marks Per Question *</label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.marksPerQuestion}
                onChange={(e) => handleConfigChange('marksPerQuestion', parseInt(e.target.value))}
                disabled={loading}
              />
            </div>
          </div>

          {/* Programming Languages */}
          <div className="form-group">
            <label>Allowed Programming Languages *</label>
            <div className="language-selector">
              {availableLanguages.map((lang) => (
                <label key={lang} className="language-checkbox">
                  <input
                    type="checkbox"
                    checked={config.languages.includes(lang)}
                    onChange={() => toggleLanguage(lang)}
                    disabled={loading}
                  />
                  <span>{lang}</span>
                </label>
              ))}
            </div>
          </div>

          {/* AI Note */}
          <div className="ai-note">
            <p>
              <strong>💡 Tip:</strong> Be specific with topics and exam level. The AI will generate
              well-structured questions with complete problem statements, constraints, sample test
              cases, and solutions.
            </p>
          </div>
        </div>

        <div className="generator-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-generate"
            onClick={generateQuestions}
            disabled={loading || !config.topics.trim() || config.languages.length === 0}
          >
            {loading ? (
              <>
                <FaSpinner className="spinning" /> Generating...
              </>
            ) : (
              <>
                <FaRobot /> Generate Questions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIQuestionGenerator;
