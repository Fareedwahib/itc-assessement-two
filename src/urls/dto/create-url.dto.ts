import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { MAX_URL_LENGTH } from '../../common/utils/url.util';

export class CreateShortUrlDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'originalUrl must be a string' })
  @IsNotEmpty({ message: 'originalUrl must not be empty' })
  @MaxLength(MAX_URL_LENGTH)
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true, require_valid_protocol: true, require_tld: true },
    { message: 'originalUrl must be a valid http:// or https:// URL' },
  )
  originalUrl: string;
}
