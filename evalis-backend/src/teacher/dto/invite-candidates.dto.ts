import { IsArray, IsEmail, ArrayMinSize } from 'class-validator';

export class InviteCandidatesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  emails: string[];
}
