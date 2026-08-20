import { IsString, Matches } from 'class-validator';

export class AddStickerDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'stickerId must contain only lowercase letters, numbers and hyphens',
  })
  stickerId: string;
}
