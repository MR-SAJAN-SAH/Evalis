import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
  ) {}

  /**
   * Get comprehensive filter options for user export
   */
  async getFilterOptions(organizationId: string): Promise<any> {
    try {
      // Get all unique schools
      const schools = await this.userProfileRepository
        .createQueryBuilder('profile')
        .select('DISTINCT profile.school', 'school')
        .innerJoin('profile.user', 'user')
        .where('user.organizationId = :organizationId', { organizationId })
        .andWhere('profile.school IS NOT NULL')
        .andWhere('profile.school != :empty', { empty: '' })
        .getRawMany();

      // Get all unique departments
      const departments = await this.userProfileRepository
        .createQueryBuilder('profile')
        .select('DISTINCT profile.department', 'department')
        .innerJoin('profile.user', 'user')
        .where('user.organizationId = :organizationId', { organizationId })
        .andWhere('profile.department IS NOT NULL')
        .andWhere('profile.department != :empty', { empty: '' })
        .getRawMany();

      // Get all unique batches
      const batches = await this.userProfileRepository
        .createQueryBuilder('profile')
        .select('DISTINCT profile.admissionBatch', 'admissionBatch')
        .innerJoin('profile.user', 'user')
        .where('user.organizationId = :organizationId', { organizationId })
        .andWhere('profile.admissionBatch IS NOT NULL')
        .andWhere('profile.admissionBatch != :empty', { empty: '' })
        .getRawMany();

      // Get all unique countries
      const countries = await this.userProfileRepository
        .createQueryBuilder('profile')
        .select('DISTINCT profile.country', 'country')
        .innerJoin('profile.user', 'user')
        .where('user.organizationId = :organizationId', { organizationId })
        .andWhere('profile.country IS NOT NULL')
        .andWhere('profile.country != :empty', { empty: '' })
        .getRawMany();

      // Get all unique semesters
      const semesters = await this.userProfileRepository
        .createQueryBuilder('profile')
        .select('DISTINCT profile.currentSemester', 'currentSemester')
        .innerJoin('profile.user', 'user')
        .where('user.organizationId = :organizationId', { organizationId })
        .andWhere('profile.currentSemester IS NOT NULL')
        .andWhere('profile.currentSemester != :empty', { empty: '' })
        .getRawMany();

      // Get all unique scholarships
      const scholarships = await this.userProfileRepository
        .createQueryBuilder('profile')
        .select('DISTINCT profile.scholarship', 'scholarship')
        .innerJoin('profile.user', 'user')
        .where('user.organizationId = :organizationId', { organizationId })
        .andWhere('profile.scholarship IS NOT NULL')
        .andWhere('profile.scholarship != :empty', { empty: '' })
        .getRawMany();

      return {
        schools: schools
          .map((s) => s.school)
          .filter((s) => s)
          .sort(),
        departments: departments
          .map((d) => d.department)
          .filter((d) => d)
          .sort(),
        batches: batches
          .map((b) => b.admissionBatch)
          .filter((b) => b)
          .sort(),
        countries: countries
          .map((c) => c.country)
          .filter((c) => c)
          .sort(),
        semesters: semesters
          .map((s) => s.currentSemester)
          .filter((s) => s)
          .sort(),
        scholarships: scholarships
          .map((s) => s.scholarship)
          .filter((s) => s)
          .sort(),
      };
    } catch (error) {
      console.error('Error fetching filter options:', error);
      return {
        schools: [],
        departments: [],
        batches: [],
        countries: [],
        semesters: [],
        scholarships: [],
      };
    }
  }

  /**
   * Get all users in an organization
   */
  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.roleEntity', 'roleEntity')
      .where('user.organizationId = :organizationId', { organizationId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getMany();
  }

  /**
   * Get total users count in organization
   */
  async getTotalUsersCount(organizationId: string): Promise<number> {
    console.log('=== getTotalUsersCount Service ===');
    console.log('Looking for organization:', organizationId);
    try {
      const count = await this.userRepository.count({
        where: { organizationId },
      });
      console.log('Found count:', count, 'for org:', organizationId);
      return count;
    } catch (error) {
      console.error('getTotalUsersCount - Error:', error);
      throw error;
    }
  }

  /**
   * Count candidates matching the provided filters
   * Used when publishing exams to show how many candidates will receive the exam
   * Only counts users with Candidate role
   */
  async countCandidatesByFilters(
    organizationId: string,
    filters: {
      schools?: string[];
      departments?: string[];
      admissionBatches?: string[];
      currentSemesters?: string[];
    },
  ): Promise<number> {
    try {
      console.log('📊 Counting CANDIDATES for organization:', organizationId);
      console.log('📊 With filters:', filters);

      // Check if there are any filters on profile fields
      const hasProfileFilters = !!(
        (filters.schools && filters.schools.length > 0) ||
        (filters.departments && filters.departments.length > 0) ||
        (filters.admissionBatches && filters.admissionBatches.length > 0) ||
        (filters.currentSemesters && filters.currentSemesters.length > 0)
      );

      let query: any;

      if (hasProfileFilters) {
        // If we have profile filters, we need to join with profile
        query = this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.profile', 'profile')
          .where('user.organizationId = :organizationId', { organizationId })
          .andWhere('user.role = :role', { role: 'Candidate' });

        // Apply filters with OR logic within same filter type, AND logic across types
        const conditions: string[] = [];

        if (filters.schools && filters.schools.length > 0) {
          const schoolPlaceholders = filters.schools.map((_, i) => `:school${i}`).join(',');
          conditions.push(`profile.school IN (${schoolPlaceholders})`);
          filters.schools.forEach((school, i) => {
            query = query.setParameter(`school${i}`, school);
          });
        }

        if (filters.departments && filters.departments.length > 0) {
          const deptPlaceholders = filters.departments.map((_, i) => `:dept${i}`).join(',');
          conditions.push(`profile.department IN (${deptPlaceholders})`);
          filters.departments.forEach((dept, i) => {
            query = query.setParameter(`dept${i}`, dept);
          });
        }

        if (filters.admissionBatches && filters.admissionBatches.length > 0) {
          const batchPlaceholders = filters.admissionBatches.map((_, i) => `:batch${i}`).join(',');
          conditions.push(`profile.admissionBatch IN (${batchPlaceholders})`);
          filters.admissionBatches.forEach((batch, i) => {
            query = query.setParameter(`batch${i}`, batch);
          });
        }

        if (filters.currentSemesters && filters.currentSemesters.length > 0) {
          const semPlaceholders = filters.currentSemesters.map((_, i) => `:sem${i}`).join(',');
          conditions.push(`profile.currentSemester IN (${semPlaceholders})`);
          filters.currentSemesters.forEach((sem, i) => {
            query = query.setParameter(`sem${i}`, sem);
          });
        }

        // Combine all conditions with AND
        if (conditions.length > 0) {
          query = query.andWhere(`(${conditions.join(') AND (')})`);
        }
      } else {
        // No profile filters, just count candidates
        query = this.userRepository
          .createQueryBuilder('user')
          .where('user.organizationId = :organizationId', { organizationId })
          .andWhere('user.role = :role', { role: 'Candidate' });
      }

      const count = await query.getCount();
      console.log('📊 Total matching CANDIDATES:', count);
      return count;
    } catch (error) {
      console.error('Error counting candidates:', error);
      return 0;
    }
  }  /**
   * Debug: Get total users count across all organizations
   */
  async getDebugTotalAll(): Promise<number> {
    console.log('=== getDebugTotalAll Service ===');
    try {
      const count = await this.userRepository.count();
      console.log('Total users in database (all orgs):', count);
      
      // Also get a sample of organizationIds
      const sample = await this.userRepository.find({ take: 10 });
      console.log('Sample users with organizationId:', sample.map(u => ({ id: u.id, email: u.email, orgId: u.organizationId })));
      
      return count;
    } catch (error) {
      console.error('getDebugTotalAll - Error:', error);
      throw error;
    }
  }

  /**
   * Get organization users for chat (simple query, same pattern as auth.service)
   */
  async getOrganizationUsersForChat(organizationId: string): Promise<User[]> {
    console.log('🔍 [UsersService] Fetching organization users for chat - orgId:', organizationId);
    
    const users = await this.userRepository.find({
      where: { 
        organizationId,
        isActive: true 
      },
      order: { createdAt: 'DESC' },
    });
    
    console.log('📊 [UsersService] Found', users.length, 'active users in organization');
    
    // If no active users found, log diagnostic info
    if (users.length === 0) {
      const allOrgUsers = await this.userRepository.find({
        where: { organizationId },
      });
      console.log('⚠️ [UsersService] Total users in org (including inactive):', allOrgUsers.length);
      
      const inactiveUsers = await this.userRepository.find({
        where: { organizationId, isActive: false },
      });
      console.log('⚠️ [UsersService] Inactive users in org:', inactiveUsers.length);
    }
    
    return users;
  }

  /**
   * Get all organization users for chat (including inactive users)
   * Used when active users list is empty
   */
  async getOrganizationUsersForChatIncludingInactive(organizationId: string): Promise<User[]> {
    console.log('🔍 [UsersService] Fetching all organization users for chat (including inactive) - orgId:', organizationId);
    
    const users = await this.userRepository.find({
      where: { 
        organizationId,
      },
      order: { createdAt: 'DESC' },
    });
    
    console.log('📊 [UsersService] Found', users.length, 'total users in organization');
    return users;
  }

  /**
   * Get users matching specific criteria
   */
  async getUsersMatchingCriteria(
    organizationId: string,
    filters: {
      school?: string;
      department?: string;
      admissionBatch?: string;
      currentSemester?: string;
    },
  ): Promise<User[]> {
    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.organizationId = :organizationId', { organizationId });

    if (filters.school) {
      query = query.andWhere('profile.school = :school', { school: filters.school });
    }
    if (filters.department) {
      query = query.andWhere('profile.department = :department', { department: filters.department });
    }
    if (filters.admissionBatch) {
      query = query.andWhere('profile.admissionBatch = :admissionBatch', { admissionBatch: filters.admissionBatch });
    }
    if (filters.currentSemester) {
      query = query.andWhere('profile.currentSemester = :currentSemester', { currentSemester: filters.currentSemester });
    }

    return query.getMany();
  }

  /**
   * Get filtered users for export with selected details
   */
  async getFilteredUsersForExport(
    organizationId: string,
    filters: {
      schools?: string[];
      departments?: string[];
      admissionBatches?: string[];
      roles?: string[];
      statuses?: string[];
      genders?: string[];
      countries?: string[];
      semesters?: string[];
      scholarships?: string[];
    },
    selectedDetails: string[],
  ): Promise<any[]> {
    try {
      console.log('Export request - organizationId:', organizationId);
      console.log('Export request - filters:', filters);
      console.log('Export request - selectedDetails:', selectedDetails);

      let query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.profile', 'profile')
        .where('user.organizationId = :organizationId', { organizationId });

      // Apply filters
      if (filters.roles && filters.roles.length > 0) {
        query = query.andWhere('user.role IN (:...roles)', { roles: filters.roles });
      }

      if (filters.statuses && filters.statuses.length > 0) {
        // Map status values to isActive field
        const activeStatuses = filters.statuses.filter((s) => s !== 'Inactive' && s !== 'Suspended');
        const inactiveStatuses = filters.statuses.filter((s) => s === 'Inactive' || s === 'Suspended');

        if (activeStatuses.length > 0 && inactiveStatuses.length > 0) {
          // Include both active and inactive
        } else if (inactiveStatuses.length > 0) {
          query = query.andWhere('user.isActive = :isActive', { isActive: false });
        } else if (activeStatuses.length > 0) {
          query = query.andWhere('user.isActive = :isActive', { isActive: true });
        }
      }

      if (filters.schools && filters.schools.length > 0) {
        query = query.andWhere('profile.school IN (:...schools)', { schools: filters.schools });
      }

      if (filters.departments && filters.departments.length > 0) {
        query = query.andWhere('profile.department IN (:...departments)', { departments: filters.departments });
      }

      if (filters.admissionBatches && filters.admissionBatches.length > 0) {
        query = query.andWhere('profile.admissionBatch IN (:...admissionBatches)', {
          admissionBatches: filters.admissionBatches,
        });
      }

      if (filters.genders && filters.genders.length > 0) {
        query = query.andWhere('profile.gender IN (:...genders)', { genders: filters.genders });
      }

      if (filters.countries && filters.countries.length > 0) {
        query = query.andWhere('profile.country IN (:...countries)', { countries: filters.countries });
      }

      if (filters.semesters && filters.semesters.length > 0) {
        query = query.andWhere('profile.currentSemester IN (:...semesters)', { semesters: filters.semesters });
      }

      if (filters.scholarships && filters.scholarships.length > 0) {
        query = query.andWhere('profile.scholarship IN (:...scholarships)', { scholarships: filters.scholarships });
      }

      const users = await query.getMany();
      console.log(`Found ${users.length} users matching criteria`);

      // Map to selected details only
      const result = users.map((user) => {
        const exportData: any = {};

        // Basic information
        if (selectedDetails.includes('firstName')) {
          // Split name into first and last if needed, or use first part
          const nameParts = user.name.split(' ');
          exportData.firstName = nameParts[0] || '';
        }
        if (selectedDetails.includes('lastName')) {
          const nameParts = user.name.split(' ');
          exportData.lastName = nameParts.slice(1).join(' ') || '';
        }
        if (selectedDetails.includes('email')) {
          exportData.email = user.email || '';
        }
        if (selectedDetails.includes('phoneNumber') && user.profile) {
          exportData.phoneNumber = user.profile.phoneNumber || '';
        }
        if (selectedDetails.includes('personalEmail') && user.profile) {
          exportData.personalEmail = user.profile.personalEmail || '';
        }
        if (selectedDetails.includes('role')) {
          exportData.role = user.role || '';
        }
        if (selectedDetails.includes('status')) {
          exportData.status = user.isActive ? 'Active' : 'Inactive';
        }

        // Personal information
        if (selectedDetails.includes('gender') && user.profile) {
          exportData.gender = user.profile.gender || '';
        }
        if (selectedDetails.includes('dateOfBirth') && user.profile) {
          exportData.dateOfBirth = user.profile.dateOfBirth
            ? new Date(user.profile.dateOfBirth).toLocaleDateString()
            : '';
        }
        if (selectedDetails.includes('country') && user.profile) {
          exportData.country = user.profile.country || '';
        }

        // Academic information
        if (selectedDetails.includes('school') && user.profile) {
          exportData.school = user.profile.school || '';
        }
        if (selectedDetails.includes('department') && user.profile) {
          exportData.department = user.profile.department || '';
        }
        if (selectedDetails.includes('rollNumber') && user.profile) {
          exportData.rollNumber = user.profile.rollNumber || '';
        }
        if (selectedDetails.includes('registrationNumber') && user.profile) {
          exportData.registrationNumber = user.profile.registrationNumber || '';
        }
        if (selectedDetails.includes('admissionBatch') && user.profile) {
          exportData.admissionBatch = user.profile.admissionBatch || '';
        }
        if (selectedDetails.includes('currentSemester') && user.profile) {
          exportData.currentSemester = user.profile.currentSemester || '';
        }
        if (selectedDetails.includes('graduated') && user.profile) {
          exportData.graduated = user.profile.graduated ? 'Yes' : 'No';
        }
        if (selectedDetails.includes('cgpa') && user.profile) {
          exportData.cgpa = user.profile.cgpa ? user.profile.cgpa.toString() : '';
        }

        // Additional information
        if (selectedDetails.includes('scholarship') && user.profile) {
          exportData.scholarship = user.profile.scholarship || '';
        }
        if (selectedDetails.includes('portfolioLink') && user.profile) {
          exportData.portfolioLink = user.profile.portfolioLink || '';
        }
        if (selectedDetails.includes('githubUrl') && user.profile) {
          exportData.githubUrl = user.profile.githubUrl || '';
        }

        return exportData;
      });

      console.log(`Exported ${result.length} user records with selected details`);
      return result;
    } catch (error) {
      console.error('Error in getFilteredUsersForExport:', error);
      throw error;
    }
  }

  /**
   * Update user's extra information with submitted personal details
   */
  async updateUserExtraInfo(userId: string, details: any): Promise<any> {
    try {
      console.log('📝 Updating extra info for user:', userId);
      
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Get or create user profile
      let userProfile = await this.userProfileRepository.findOne({ where: { userId } });
      
      if (!userProfile) {
        userProfile = this.userProfileRepository.create({ userId });
      }

      // Map form fields to profile fields
      const fieldMapping = {
        phone: 'phoneNumber',
        personalEmail: 'personalEmail',
        dateOfBirth: 'dateOfBirth',
        gender: 'gender',
        country: 'country',
        profileUrl: 'profileUrl',
        schoolCollege: 'school',
        department: 'department',
        rollNumber: 'rollNumber',
        registrationNumber: 'registrationNumber',
        admissionBatch: 'admissionBatch',
        currentSemester: 'currentSemester',
        cgpa: 'cgpa',
        graduated: 'graduated',
        scholarship: 'scholarship',
        portfolioLink: 'portfolioLink',
        resumeUrl: 'resumeUrl',
        github: 'githubUrl',
        parentName: 'parentName',
        parentPhone: 'parentPhone',
      };

      // Update profile with new details (only non-empty fields)
      for (const [formField, profileField] of Object.entries(fieldMapping)) {
        if (details[formField] !== undefined && details[formField] !== null && details[formField] !== '') {
          if (profileField === 'dateOfBirth' && details[formField]) {
            // Handle date conversion
            userProfile[profileField] = new Date(details[formField]);
          } else if (profileField === 'graduated') {
            userProfile[profileField] = details[formField] === 'Yes' || details[formField] === true;
          } else {
            userProfile[profileField] = details[formField];
          }
        }
      }

      // Save updated profile
      const savedProfile = await this.userProfileRepository.save(userProfile);

      console.log('✅ User profile updated successfully for:', userId);
      
      return {
        userId: user.id,
        email: user.email,
        profile: savedProfile,
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user by roll number
   */
  async getUserByRoll(roll: string, organizationId: string): Promise<any> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.profile', 'profile')
        .where('profile.rollNumber = :roll', { roll })
        .andWhere('user.organizationId = :organizationId', { organizationId })
        .getOne();

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        fullName: user.profile?.fullName || user.name,
        extraInfo: user.profile || {},
      };
    } catch (error) {
      console.error('Error fetching user by roll:', error);
      throw error;
    }
  }
}