import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';

import { destinationFolders } from 'src/common/constants/destination-folders';
import {
  regexClassType,
  regexSemester,
} from 'src/common/constants/import-file-config';
import { ClassService } from 'src/modules/class/class.service';
import { ClassRequestDto } from 'src/modules/class/dto/Class.request.dto';
import { ClassResponseDto } from 'src/modules/class/dto/Class.response.dto';
import { CommentService } from 'src/modules/comment/comment.service';
import { InitCommentRequestDto } from 'src/modules/comment/dto/InitComment.request.dto';
import { AsbaService } from 'src/modules/external/asba.service';
import { FacultyDto } from 'src/modules/faculty/dto/faculty.dto';
import { FacultyService } from 'src/modules/faculty/faculty.service';
import { LecturerDto } from 'src/modules/lecturer/dto/lecturer.dto';
import { LecturerService } from 'src/modules/lecturer/lecturer.service';
import { PointService } from 'src/modules/point/point.service';
import { SemesterDto } from 'src/modules/semester/dto/Semester.dto';
import { SemesterRequestDto } from 'src/modules/semester/dto/Semester.request.dto';
import { SemesterService } from 'src/modules/semester/semester.service';
import { SubjectResponseDto } from 'src/modules/subject/dto/Subject.response.dto';
import { SubjectService } from 'src/modules/subject/subject.service';
import { S3Service } from 'src/shared/services/s3Service.service';
import { Comment } from '../../comment/entities/comment.entity';
import { PublicImageDto } from '../dtos/responses/CustomFile.dto';
import { FileDto } from '../dtos/responses/File.dto';
import { FileRepository } from '../repositories/file.repository';
@Injectable()
export class FileService {
  public logger: Logger;

  constructor(
    private readonly semesterService: SemesterService,
    private readonly commentService: CommentService,
    private readonly awsS3Service: S3Service,
    private readonly fileRepository: FileRepository,
    private readonly facultyService: FacultyService,
    private readonly lecturerService: LecturerService,
    private readonly pointService: PointService,
    private readonly subjectService: SubjectService,
    private readonly classService: ClassService,
    public readonly asbaService: AsbaService,
  ) {
    this.logger = new Logger(FileService.name);
  }

  async getImageById(id: string): Promise<PublicImageDto> {
    try {
      const fileEntity = await this.fileRepository.findImageById(id);

      if (!fileEntity) {
        throw new NotFoundException(`Cannot found image with id: ${id}`);
      }

      const imageUrl = this.awsS3Service.getImageUrl(fileEntity.key);

      const uploadedImageResponse: PublicImageDto = {
        url: imageUrl,
      };

      return uploadedImageResponse;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  async importAndPredict(file: Express.Multer.File) {
    const targetFolder: string = destinationFolders.import;

    const result = await this.uploadAndProcessFile(file, targetFolder);
    await this.predictFeedback(result);
    return {
      message: 'File imported successfully',
      result,
    };
  }

  async uploadAndProcessFile(
    file: Express.Multer.File,
    targetFolder: string,
  ): Promise<Comment[]> {
    const fileDto = new FileDto(
      file.path,
      file.encoding,
      file.filename,
      file.mimetype,
      file.originalname,
      file.size,
      file.buffer,
    );
    const fileKey = await this.awsS3Service.uploadFile(fileDto, targetFolder);

    const uploadedFile = await this.fileRepository.createFile(
      new FileDto(fileKey, file.mimetype, file.originalname),
    );

    this.logger.log(`File uploaded: ${uploadedFile.key}`);

    const fileBuffer = await this.awsS3Service.downloadFile(fileKey);
    return this.processImportFile(fileBuffer, uploadedFile.originalName);
  }

  private async processImportFile(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<Comment[]> {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: null,
      });

      if (rawData.length === 0) {
        throw new BadRequestException('No data in file');
      }

      const isValid = this.validateFile(rawData);
      if (!isValid) {
        throw new BadRequestException('Invalid file');
      }

      return this.processFile(rawData);
    } catch (error) {
      this.logger.error(`Error when hadling ${fileName}: ${error.message}`);
      throw new BadRequestException('Error when handle file');
    }
  }

  private validateFile(dataFile: any[]): boolean {
    if (!Array.isArray(dataFile) || dataFile.length === 0) {
      this.logger.error('Data file is empty or not an array');
      return false;
    }

    const firstRow = dataFile[0];
    const firstColumnKey = Object.keys(firstRow)[0];
    const cleanedKey = firstColumnKey.replace(/[–—]/g, '-');

    if (
      typeof cleanedKey === 'string' &&
      regexSemester.test(cleanedKey.trim())
    ) {
      return true;
    } else {
      this.logger.error(
        `First row name does not match regex: ${firstColumnKey}`,
      );
      return false;
    }
  }

  private async updateRecord(
    rowData,
    colIndexes,
    semester: SemesterDto,
    regexClassType: string,
  ): Promise<Comment[]> {
    const lecturerName = rowData[colIndexes.name] as string;
    const facultyName = rowData[colIndexes.department] as string;
    const subject = rowData[colIndexes.subject] as string;
    const program = rowData[colIndexes.program] as string;
    const className = rowData[colIndexes.className] as string;
    const point = rowData[colIndexes.avgScore] as number;
    const totalStudent = rowData[colIndexes.totalStudent] as string;
    const participant = rowData[colIndexes.participant];
    const loop = rowData[colIndexes.loop];

    let faculty: FacultyDto;
    if (facultyName) {
      faculty = await this.facultyService.findOrCreateFaculty(facultyName);
    }

    let subjectDto: SubjectResponseDto;
    if (subject) {
      subjectDto = await this.subjectService.findOrCreateSubject(
        subject,
        faculty?.faculty_id,
      );
    }

    let lecturer: LecturerDto;
    if (lecturerName) {
      lecturer = await this.lecturerService.findOrCreateLecturer(
        lecturerName,
        faculty?.faculty_id,
      );
    }
    let classDto: ClassResponseDto;

    if (className) {
      const classRequestDto = new ClassRequestDto(
        className,
        program,
        semester?.id,
        subjectDto?.subject_id,
        lecturer?.lecturer_id,
        totalStudent,
        participant,
        regexClassType,
      );

      classDto =
        await this.classService.findOrCreateClassByNameAndSemesterId(
          classRequestDto,
        );
    }

    if (point) {
      await this.pointService.createPoint(point, classDto?.class_id);
    }
    const commentsToPredict = [];

    if (classDto) {
      for (let i = 0; i < parseInt(loop, 10); i++) {
        const positiveFeedback = rowData[
          colIndexes.positiveFeedback + i
        ] as string;

        if (positiveFeedback) {
          const initCommentRequestDto = new InitCommentRequestDto(
            positiveFeedback,
            classDto?.class_id,
            semester?.id,
          );
          const newComment = await this.commentService.createComment(
            initCommentRequestDto,
          );
          commentsToPredict.push(newComment);
        }
        const negativeFeedback = rowData[
          colIndexes.negativeFeedback + i
        ] as string;

        if (negativeFeedback) {
          const initCommentRequestDto = new InitCommentRequestDto(
            negativeFeedback,
            classDto?.class_id,
            semester?.id,
          );
          const newComment = await this.commentService.createComment(
            initCommentRequestDto,
          );
          commentsToPredict.push(newComment);
        }
      }
    }
    return commentsToPredict;
  }

  private async processFile(dataFile: any[]): Promise<Comment[]> {
    const firstRow = dataFile[0];
    const semesterMatch = regexSemester.exec(Object.keys(firstRow)[0]);
    const classType = Object.values(firstRow)[0] as string;

    if (!semesterMatch) {
      throw new BadRequestException('Semester information is invalid');
    }
    if (!regexClassType.test(classType)) {
      throw new BadRequestException('Class type does not match');
    }
    const [_, type, year] = semesterMatch;
    const semesterRequest = new SemesterRequestDto(type, year);
    const semester =
      await this.semesterService.findOrCreateSemester(semesterRequest);

    const headers = dataFile[1];

    const rawColumns = Object.values(headers) as string[];
    const columns = rawColumns.map((col) => col?.trim().toLowerCase());

    const colIndexes = {
      name: columns.indexOf('họ và tên gv'),
      department: columns.indexOf('khoa'),
      subject: columns.indexOf('môn học'),
      program: columns.indexOf('chương trình'),
      className: columns.indexOf('lớp'),
      totalStudent: columns.indexOf('sỉ số'),
      participant: columns.indexOf('tham gia'),
      avgScore: columns.indexOf('điểm trung bình'),
      positiveFeedback: columns.indexOf(
        'điều anh/ chị hài lòng nhất về hoạt động giảng dạy của gv',
      ),
      negativeFeedback: columns.indexOf(
        'điều anh/ chị không hài lòng nhất về hoạt động giảng dạy của gv',
      ),
      loop: columns.indexOf('lượt ý kiến'),
    };

    if (Object.values(colIndexes).some((index) => index === -1)) {
      throw new BadRequestException('Missing required columns in the file');
    }
    const predictList: Comment[] = [];
    for (let i = 2; i < dataFile.length; i++) {
      const row = dataFile[i];
      const rowData = Object.values(row);

      predictList.push(
        ...(await this.updateRecord(rowData, colIndexes, semester, classType)),
      );
    }

    return predictList;
  }

  async predictFeedback(comments: Comment[]) {
    for (const comment of comments) {
      if (!comment?.content) continue;
      const result = await this.asbaService.predict(comment.content);
      let foundValidAspect = false;
      for (const key in result.prediction) {
        if (result.prediction[key] != null) {
          await this.commentService.updatePredictComment(
            comment.comment_id,
            key,
            result.prediction[key],
          );
          foundValidAspect = true;
          break;
        }
      }
      if (!foundValidAspect) {
        await this.commentService.updatePredictComment(
          comment.comment_id,
          'OTHERS',
          'neutral',
        );
      }
    }
  }
}
