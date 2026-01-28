/**
 * Endpoint to be added to exam.controller.ts after the getExams() method
 * Add this to the ExamController class
 */

/**
 * Get published exams analytics for admin
 * GET /exams/published/analytics
 */
@Get('published/analytics')
async getPublishedExamsAnalytics(@Request() req) {
  console.log('📊 [CONTROLLER] GET /exams/published/analytics called for organization:', req.user.organizationId);
  const result = await this.examAnalyticsService.getPublishedExamsAnalytics(req.user.organizationId);
  console.log('📊 [CONTROLLER] Returning analytics:', result);
  return result;
}
