import { IsString, Matches } from 'class-validator';

export class AlbumIdParamDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'albumId must contain only lowercase letters, numbers and hyphens',
  })
  albumId: string;
}
