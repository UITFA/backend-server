import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FileEntity } from '../entities/fileS3.entity';
import { FileDto } from '../dtos/responses/File.dto';

@Injectable()
export class FileRepository extends Repository<FileEntity> {
  constructor(
    private readonly datasource: DataSource,

    @InjectRepository(FileEntity)
    private imageRepository: Repository<FileEntity>,
  ) {
    super(FileEntity, datasource.createEntityManager());
  }

  async findImageById(id: string): Promise<FileEntity | null> {
    const imageEntity = await this.imageRepository.findOne({
      where: {
        id: id.trim(),
      },
    });

    return imageEntity;
  }

  async createFile(file: FileDto): Promise<FileEntity> {
    const imageEntity = this.imageRepository.create();
    imageEntity.fileName = file.filename;
    imageEntity.key = file.path;
    imageEntity.mimeType = file.mimetype;
    imageEntity.originalName = file.originalname;
    imageEntity.size = file.size;

    await this.imageRepository.save(imageEntity);

    return imageEntity;
  }
}
