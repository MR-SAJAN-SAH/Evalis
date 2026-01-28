import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * Public users endpoints - no authentication required
 * Used for public forms like email-based personal detail submissions
 */
@Controller('users/public')
export class UsersPublicController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Submit personal details from email form
   * POST /users/public/submit-personal-details
   * This endpoint is public (no JWT required) as it's accessed from email forms
   */
  @Post('submit-personal-details')
  async submitPersonalDetails(@Body() body: any) {
    try {
      const { userId, ...details } = body;

      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      console.log('📝 Submitting personal details for user:', userId);
      console.log('📝 Details received:', details);

      const result = await this.usersService.updateUserExtraInfo(userId, details);
      
      return {
        success: true,
        message: 'Personal details submitted successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error submitting personal details:', error);
      throw new BadRequestException(`Failed to submit details: ${error.message}`);
    }
  }
}
