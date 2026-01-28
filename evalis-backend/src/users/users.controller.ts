import { Controller, Get, Post, UseGuards, Request, Query, Body, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get total users count for organization dashboard
   * GET /users/total-count
   */
  @Get('total-count')
  async getTotalUsersCount(@Request() req) {
    try {
      console.log('=== getTotalUsersCount endpoint called ===');
      console.log('Request user:', req.user);
      console.log('Organization ID from token:', req.user?.organizationId);
      
      if (!req.user || !req.user.organizationId) {
        console.error('No organization ID found in request user');
        return { 
          totalUsers: 0, 
          error: 'Organization ID not found',
          debug: { user: req.user }
        };
      }
      
      const count = await this.usersService.getTotalUsersCount(req.user.organizationId);
      console.log('Total users count:', count, 'for org:', req.user.organizationId);
      
      return { totalUsers: count };
    } catch (error) {
      console.error('Error in getTotalUsersCount:', error);
      return { totalUsers: 0, error: error.message };
    }
  }

  /**
   * Debug endpoint to get total users in database (all orgs)
   * GET /users/debug/total-all
   */
  @Get('debug/total-all')
  async getDebugTotalAll(@Request() req) {
    try {
      const count = await this.usersService.getDebugTotalAll();
      return { totalUsersAllOrgs: count };
    } catch (error) {
      console.error('Error in getDebugTotalAll:', error);
      return { error: error.message };
    }
  }

  /**
   * Get filter options (schools, departments, admission batches, etc.) for the user's organization
   * GET /users/filter-options
   */
  @Get('filter-options')
  async getFilterOptions(@Request() req) {
    return this.usersService.getFilterOptions(req.user.organizationId);
  }

  /**
   * Count candidates matching the provided filters
   * GET /users/count-candidates
   */
  @Get('count-candidates')
  async countCandidates(
    @Request() req,
    @Query('schools') schools?: string | string[],
    @Query('departments') departments?: string | string[],
    @Query('admissionBatches') admissionBatches?: string | string[],
    @Query('currentSemesters') currentSemesters?: string | string[],
  ) {
    // Convert single values to arrays
    const schoolsArray = schools ? (Array.isArray(schools) ? schools : [schools]) : [];
    const departmentsArray = departments ? (Array.isArray(departments) ? departments : [departments]) : [];
    const batchesArray = admissionBatches ? (Array.isArray(admissionBatches) ? admissionBatches : [admissionBatches]) : [];
    const semestersArray = currentSemesters ? (Array.isArray(currentSemesters) ? currentSemesters : [currentSemesters]) : [];

    const filters = {
      schools: schoolsArray,
      departments: departmentsArray,
      admissionBatches: batchesArray,
      currentSemesters: semestersArray,
    };

    console.log('📊 [CONTROLLER] GET /users/count-candidates called with filters:', filters);
    const count = await this.usersService.countCandidatesByFilters(
      req.user.organizationId,
      filters,
    );
    console.log('📊 [CONTROLLER] Candidate count result:', count);
    return { count };
  }

  /**
   * Get user by roll number
   * GET /users/by-roll/:roll
   */
  @Get('by-roll/:roll')
  async getUserByRoll(@Request() req) {
    return this.usersService.getUserByRoll(req.params.roll, req.user.organizationId);
  }

  /**
   * Export filtered users with selected details
   * POST /users/export
   */
  @Post('export')
  async exportUsers(
    @Request() req,
    @Query()
    filters?: {
      schools?: string;
      departments?: string;
      admissionBatches?: string;
      roles?: string;
      statuses?: string;
      genders?: string;
      countries?: string;
      semesters?: string;
      scholarships?: string;
    },
    @Body() body?: { selectedDetails: string[] },
  ) {
    try {
      if (!req.user || !req.user.organizationId) {
        throw new BadRequestException('Organization ID not found in token');
      }

      if (!body || !body.selectedDetails || body.selectedDetails.length === 0) {
        throw new BadRequestException('At least one detail must be selected');
      }

      // Parse comma-separated filter values
      const parsedFilters = {
        schools: filters?.schools ? filters.schools.split(',').map((s) => s.trim()) : [],
        departments: filters?.departments ? filters.departments.split(',').map((s) => s.trim()) : [],
        admissionBatches: filters?.admissionBatches ? filters.admissionBatches.split(',').map((s) => s.trim()) : [],
        roles: filters?.roles ? filters.roles.split(',').map((s) => s.trim()) : [],
        statuses: filters?.statuses ? filters.statuses.split(',').map((s) => s.trim()) : [],
        genders: filters?.genders ? filters.genders.split(',').map((s) => s.trim()) : [],
        countries: filters?.countries ? filters.countries.split(',').map((s) => s.trim()) : [],
        semesters: filters?.semesters ? filters.semesters.split(',').map((s) => s.trim()) : [],
        scholarships: filters?.scholarships ? filters.scholarships.split(',').map((s) => s.trim()) : [],
      };

      const result = await this.usersService.getFilteredUsersForExport(
        req.user.organizationId,
        parsedFilters,
        body.selectedDetails,
      );

      if (!result || result.length === 0) {
        return [];
      }

      return result;
    } catch (error) {
      console.error('Error in exportUsers:', error);
      throw error;
    }
  }
}