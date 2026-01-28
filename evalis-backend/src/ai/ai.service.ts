import { Injectable } from '@nestjs/common';

interface GenerateQuestionsRequest {
  prompt: string;
  numberOfQuestions: number;
  marksPerQuestion: number;
}

interface GeneratedQuestion {
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  explanation: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
  hints: string[];
  tags: string[];
}

@Injectable()
export class AIService {
  private geminiApiKey: string;
  private geminiEndpoint: string = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    if (!this.geminiApiKey) {
      throw new Error(
        'Gemini API key not configured. Set GEMINI_API_KEY environment variable. Get one from https://aistudio.google.com/app/apikeys',
      );
    }

    try {
      const response = await fetch(
        `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: request.prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Gemini API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`,
        );
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No content received from Gemini AI');
      }

      // Parse the JSON response
      let questions: GeneratedQuestion[];
      try {
        // Try to extract JSON if there's extra text
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          questions = JSON.parse(content);
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', content);
        throw new Error('Invalid response format from Gemini AI');
      }

      // Validate and structure the questions
      return questions.slice(0, request.numberOfQuestions).map((q) => ({
        problemStatement: q.problemStatement || '',
        inputFormat: q.inputFormat || '',
        outputFormat: q.outputFormat || '',
        constraints: q.constraints || '',
        sampleInput: q.sampleInput || '',
        sampleOutput: q.sampleOutput || '',
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'MEDIUM',
        timeLimit: q.timeLimit || 30,
        memoryLimit: q.memoryLimit || 256,
        hints: Array.isArray(q.hints) ? q.hints : [],
        tags: Array.isArray(q.tags) ? q.tags : [],
      }));
    } catch (error: any) {
      console.error('AI Service Error:', error);

      // Provide helpful error messages
      if (error.message && error.message.includes('401')) {
        throw new Error('Gemini authentication failed. Please check your API key.');
      } else if (error.message && error.message.includes('429')) {
        throw new Error('Too many requests to Gemini. Please try again later.');
      } else if (error.message && error.message.includes('500')) {
        throw new Error('Gemini service error. Please try again later.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Failed to connect to Gemini. Please check your internet connection.');
      }

      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  async generateQuestionWithFallback(request: GenerateQuestionsRequest): Promise<any[]> {
    try {
      return await this.generateQuestions(request);
    } catch (error) {
      console.error('Error generating questions with Gemini, using fallback:', error);
      // Return pre-generated template questions as fallback
      return this.generateTemplateQuestions(request.numberOfQuestions);
    }
  }

  private generateTemplateQuestions(count: number): GeneratedQuestion[] {
    const templates = [
      {
        problemStatement:
          'Write a function to reverse a given array in-place without using extra space.',
        inputFormat: 'An array of integers',
        outputFormat: 'Reversed array',
        constraints: '1 <= n <= 1000, -1000 <= arr[i] <= 1000',
        sampleInput: '[1, 2, 3, 4, 5]',
        sampleOutput: '[5, 4, 3, 2, 1]',
        explanation: 'Use two pointers to swap elements from start and end.',
        difficulty: 'EASY',
        timeLimit: 20,
        memoryLimit: 128,
        hints: [
          'Use two pointers starting from both ends',
          'Swap elements while pointers move towards center',
          'No extra space needed',
        ],
        tags: ['arrays', 'two-pointers'],
      },
      {
        problemStatement: 'Implement binary search in a sorted array. Find the target value.',
        inputFormat: 'Sorted array and target value',
        outputFormat: 'Index of target or -1 if not found',
        constraints: '1 <= n <= 10000, arr is sorted',
        sampleInput: 'arr = [1, 3, 5, 7, 9], target = 5',
        sampleOutput: '2',
        explanation: 'Use binary search to find target in O(log n) time.',
        difficulty: 'EASY',
        timeLimit: 25,
        memoryLimit: 128,
        hints: [
          'Use low and high pointers',
          'Calculate mid and compare with target',
          'Eliminate half of search space each time',
        ],
        tags: ['binary-search', 'searching'],
      },
      {
        problemStatement: 'Find the longest substring without repeating characters.',
        inputFormat: 'A string s',
        outputFormat: 'Length of longest substring',
        constraints: '0 <= s.length <= 5 * 10^4',
        sampleInput: '"abcabcbb"',
        sampleOutput: '3',
        explanation: 'Use sliding window with a hash map to track character positions.',
        difficulty: 'MEDIUM',
        timeLimit: 30,
        memoryLimit: 256,
        hints: [
          'Use sliding window technique',
          'Maintain a set or map of characters',
          'Track the maximum length found',
        ],
        tags: ['strings', 'sliding-window', 'hash-map'],
      },
      {
        problemStatement:
          'Given a sorted array, find two numbers that add up to a specific target.',
        inputFormat: 'Sorted array and target sum',
        outputFormat: 'Indices of the two numbers',
        constraints: '2 <= n <= 10^4, exactly one solution exists',
        sampleInput: 'nums = [2, 7, 11, 15], target = 9',
        sampleOutput: '[0, 1]',
        explanation: 'Use two pointers from start and end, move based on sum comparison.',
        difficulty: 'EASY',
        timeLimit: 20,
        memoryLimit: 128,
        hints: [
          'Array is sorted, use two pointers',
          'Move left pointer if sum is too small',
          'Move right pointer if sum is too large',
        ],
        tags: ['arrays', 'two-pointers'],
      },
      {
        problemStatement: 'Implement a function to check if a string is a palindrome.',
        inputFormat: 'A string s',
        outputFormat: 'Boolean - true if palindrome, false otherwise',
        constraints: '1 <= s.length <= 2 * 10^5',
        sampleInput: '"race a car"',
        sampleOutput: 'false',
        explanation:
          'Consider only alphanumeric characters and ignore case. Use two pointers.',
        difficulty: 'EASY',
        timeLimit: 20,
        memoryLimit: 128,
        hints: [
          'Convert string to lowercase',
          'Remove non-alphanumeric characters',
          'Use two pointers from start and end',
        ],
        tags: ['strings', 'two-pointers'],
      },
    ];

    return templates.slice(0, count);
  }
}
