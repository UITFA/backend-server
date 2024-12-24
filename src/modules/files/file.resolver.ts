import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UploadedFileDto } from './dtos/responses/CustomFile.dto';
import { FileEntity } from './entities/fileS3.entity';
import { FileService } from './services/file.service';
import { destinationFolders } from 'src/common/constants/destination-folders';
import { IFile } from 'src/interfaces/IFile';
import { FileDto } from './dtos/responses/File.dto';
import { FileRequestDto } from './dtos/request/File.request.dto';

@Resolver(() => FileEntity)
export class FileResolver {
  constructor(private readonly file: FileService) {}

  @Mutation(() => Boolean, { description: `Upload file` })
  async importFile(@Args('file') file: FileRequestDto) {
    const targetFolder: string = destinationFolders.import;
    try {
      await this.file.importFile(file, targetFolder);
      return true;
    } catch (error) {
      return false;
    }
  }

  @Query(() => FileEntity, {
    name: 'file',
    description: 'View file information',
    nullable: true,
  })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.file.getImageById(id);
  }
}
