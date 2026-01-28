import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam, ExamStatus } from './entities/exam.entity';
import { ExamSubmission } from './entities/exam-submission.entity';
import { ExamAccess } from './entities/exam-access.entity';

@Injectable()
export class ExamAnalyticsService {
  constructor(
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(ExamSubmission)
    private submissionRepository: Repository<ExamSubmission>,
    @InjectRepository(ExamAccess)
    private examAccessRepository: Repository<ExamAccess>,
  ) {}

  /**
   * Get analytics data for all published exams
   * Returns: exam details + total candidates assigned + statistics (attempted, average, pass rate)
   */
  async getPublishedExamsAnalytics(organizationId: string) {
    try {
      console.log('📊 Fetching published exams analytics for organization:', organizationId);

      // Get all published exams for this organization
      const publishedExams = await this.examRepository.find({
        where: {
          organizationId: organizationId,
          status: ExamStatus.PUBLISHED,
        },
        order: { createdAt: 'DESC' },
      });

      console.log(`✅ Found ${publishedExams.length} published exams`);

      // Enrich each exam with analytics data
      const analyticsData = await Promise.all(
        publishedExams.map(async (exam) => {
          // Use the candidate count saved at publish time
          // This ensures new candidates created after publication don't count
          const totalCandidates = exam.publishedCandidateCount || 0;

          // Get all submissions for this exam
          const submissions = await this.submissionRepository.find({
            where: { examId: exam.id },
          });

          const attemptedCount = submissions.length;
          
          // Calculate statistics from submissions
          let averageScore = 0;
          let passedCount = 0;
          
          // Convert passing score to percentage for comparison
          // passingScore is in absolute marks, we need to convert to percentage
          const passingScorePercentage = exam.totalMarks > 0 
            ? Math.round((Number(exam.passingScore) / Number(exam.totalMarks)) * 100)
            : 70; // Default to 70% if totalMarks is not available

          if (submissions.length > 0) {
            const scores: number[] = [];
            
            submissions.forEach((submission) => {
              const score = submission.score || 0;
              scores.push(score);
              
              // Score from MCQ is already in percentage (0-100)
              // Count as passed if score >= passing score percentage
              if (score >= passingScorePercentage) {
                passedCount++;
              }
            });

            // Calculate average
            averageScore = Math.round(
              scores.reduce((sum, score) => sum + score, 0) / scores.length
            );
          }

          const passRate = attemptedCount > 0 
            ? Math.round((passedCount / attemptedCount) * 100)
            : 0;

          console.log(`📈 Exam: ${exam.name}`);
          console.log(`   Total Candidates (Published Count): ${totalCandidates}`);
          console.log(`   Attempted: ${attemptedCount}`);
          console.log(`   Passing Score: ${exam.passingScore}/${exam.totalMarks} (${passingScorePercentage}%)`);
          console.log(`   Passed: ${passedCount}`);
          console.log(`   Average Score: ${averageScore}%`);
          console.log(`   Pass Rate: ${passRate}%`);

          return {
            id: exam.id,
            code: exam.code,
            name: exam.name,
            subject: exam.subject,
            totalCandidates: totalCandidates,
            attempted: attemptedCount,
            averageScore: averageScore,
            passed: passedCount,
            passRate: passRate,
            examType: exam.examType,
            totalMarks: exam.totalMarks,
            passingScore: exam.passingScore,
            createdAt: exam.createdAt,
          };
        })
      );

      // Calculate overall statistics
      const overview = {
        totalCandidates: analyticsData.reduce((sum, exam) => sum + exam.totalCandidates, 0),
        totalAttempted: analyticsData.reduce((sum, exam) => sum + exam.attempted, 0),
        averageScore: analyticsData.length > 0 
          ? Math.round(
              analyticsData.reduce((sum, exam) => sum + exam.averageScore, 0) / analyticsData.length
            )
          : 0,
        passPercentage: analyticsData.length > 0 
          ? Math.round(
              analyticsData.reduce((sum, exam) => sum + exam.passRate, 0) / analyticsData.length
            )
          : 0,
      };

      console.log('\n📊 Overall Analytics:');
      console.log(`   Total Candidates: ${overview.totalCandidates}`);
      console.log(`   Total Attempted: ${overview.totalAttempted}`);
      console.log(`   Average Score: ${overview.averageScore}%`);
      console.log(`   Pass Percentage: ${overview.passPercentage}%`);

      return {
        overview,
        exams: analyticsData,
      };
    } catch (error) {
      console.error('❌ Error fetching published exams analytics:', error);
      throw error;
    }
  }
}