import { Args, Query, Resolver } from '@nestjs/graphql';
import { FileEntity } from '../entities/fileS3.entity';
import { FileService } from '../services/file.service';

@Resolver(() => FileEntity)
export class FileResolver {
  constructor(private readonly file: FileService) {}

  @Query(() => FileEntity, {
    name: 'file',
    description: 'View file information',
    nullable: true,
  })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.file.getImageById(id);
  }
}
