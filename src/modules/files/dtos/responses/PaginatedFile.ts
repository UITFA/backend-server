import { ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/common/dto/Paginated.dto';
import { FileEntity } from '../../entities/fileS3.entity';

@ObjectType()
export class PaginatedFile extends Paginated(FileEntity) {}
