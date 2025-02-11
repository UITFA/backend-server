import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';

import { destinationFolders } from 'src/common/constants/destination-folders';
import { Gender } from 'src/common/constants/gender';
import {
  regexClassType,
  regexSemester,
} from 'src/common/constants/import-file-config';
import { ClassService } from 'src/modules/class/class.service';
import { ClassRequestDto } from 'src/modules/class/dto/request/Class.request.dto';
import { ClassResponseDto } from 'src/modules/class/dto/response/Class.response.dto';
import { CommentService } from 'src/modules/comment/comment.service';
import { InitCommentRequestDto } from 'src/modules/comment/dto/InitComment.request.dto';
import { CriteriaService } from 'src/modules/criteria/criteria.service';
import { UpdateCriteriaDto } from 'src/modules/criteria/dto/request/UpdateCriteriaDto';
import { Criteria } from 'src/modules/criteria/entities/criteria.entity';
import { AsbaService } from 'src/modules/external/asba.service';
import { Faculty } from 'src/modules/faculty/entities/faculty.entity';
import { FacultyService } from 'src/modules/faculty/faculty.service';
import { UpdateLecturerDto } from 'src/modules/lecturer/dto/request/update-lecturer.dto';
import { Lecturer } from 'src/modules/lecturer/entities/lecturer.entity';
import { LecturerService } from 'src/modules/lecturer/lecturer.service';
import { BulkPointDto } from 'src/modules/point/dto/request/BulkPointDto';
import { PointService } from 'src/modules/point/point.service';
import { SemesterRequestDto } from 'src/modules/semester/dto/Semester.request.dto';
import { Semester } from 'src/modules/semester/entities/semester.entity';
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
    public readonly criteriaService: CriteriaService,
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
    const targetFolder: string = destinationFolders.comment;

    const result = await this.uploadAndProcessCommentFile(file, targetFolder);
    await this.predictFeedback(result);
    return {
      message: 'File imported successfully',
      result,
    };
  }

  async uploadAndProcessCommentFile(
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
    return this.processImportCommentFile(fileBuffer, uploadedFile.originalName);
  }

  private async processImportCommentFile(
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

      const isValid = this.validateCommentFile(rawData);
      if (!isValid) {
        throw new BadRequestException('Invalid file');
      }

      return this.processCommentFile(rawData);
    } catch (error) {
      this.logger.error(`Error when hadling ${fileName}: ${error.message}`);
      throw new BadRequestException('Error when handle file');
    }
  }

  private validateCommentFile(dataFile: any[]): boolean {
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

  private async updateCommentRecord(
    rowData,
    colIndexes,
    semester: Semester,
    classType: string,
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

    let faculty: Faculty;
    if (facultyName) {
      faculty = await this.facultyService.findOrCreateFaculty(facultyName);
    }

    let subjectDto: SubjectResponseDto;
    if (subject) {
      subjectDto = await this.subjectService.findOrCreateSubject(
        subject,
        faculty,
      );
    }

    let lecturer: Lecturer;
    if (lecturerName) {
      lecturer = await this.lecturerService.findOrCreateLecturer(
        lecturerName,
        faculty,
      );
    }
    let classDto: ClassResponseDto;

    if (className) {
      const classRequestDto = new ClassRequestDto(
        className,
        program,
        subjectDto?.subject_id,
        lecturer?.lecturer_id,
        totalStudent,
        participant,
        classType,
      );

      classDto = await this.classService.findOrCreateClassByNameAndSemesterId(
        classRequestDto,
        lecturer,
        semester,
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
            semester?.semester_id,
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
            semester?.semester_id,
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

  private async processCommentFile(dataFile: any[]): Promise<Comment[]> {
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
    const columns = rawColumns.map((col) =>
      col ? String(col).trim().toLowerCase() : '',
    );

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
        ...(await this.updateCommentRecord(
          rowData,
          colIndexes,
          semester,
          classType,
        )),
      );
    }

    await this.calculateAndSaveTotalPoint();

    return predictList;
  }

  private async calculateAndSaveTotalPoint(): Promise<void> {
    const subjects = await this.subjectService.findAllSubjects();

    for (const subject of subjects) {
      const classes = await this.classService.findClassesBySubjectId(
        subject.subject_id,
      );

      if (classes.length > 0) {
        const totalPoint =
          await this.pointService.calculateAveragePointForClasses(
            classes.map((cls) => cls.class_id),
          );

        await this.subjectService.updateTotalPoint(
          subject.subject_id,
          totalPoint,
        );
      }
    }
  }

  async predictFeedback(comments: Comment[]) {
    for (const comment of comments) {
      if (!comment?.display_name) continue;
      const result = await this.asbaService.predict(comment.display_name);
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

  async importLecturer(file: Express.Multer.File) {
    const targetFolder: string = destinationFolders.lecturer;

    const result = await this.uploadAndProcessLecturerFile(file, targetFolder);
    return {
      message: 'File imported successfully',
      result,
    };
  }

  async uploadAndProcessLecturerFile(
    file: Express.Multer.File,
    targetFolder: string,
  ) {
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
    return this.processImportLecturerFile(
      fileBuffer,
      uploadedFile.originalName,
    );
  }

  private async processImportLecturerFile(
    fileBuffer: Buffer,
    fileName: string,
  ) {
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

      return this.processLecturerFile(rawData);
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
    return true;
  }

  private async processLecturerFile(dataFile: any[]) {
    const headers = dataFile[0];
    const rawColumns = Object.keys(headers);
    const columns = rawColumns.map((col) =>
      col !== null && col !== undefined ? String(col).trim().toLowerCase() : '',
    );

    const colIndexes = {
      mscb: columns.indexOf('mã gv'),
      username: columns.indexOf('username'),
      displayName: columns.indexOf('họ tên'),
      dateOfBirth: columns.indexOf('ngày sinh'),
      gender: columns.indexOf('giới tính'),
      learningPosition: columns.indexOf('học vị'),
      facultyName: columns.indexOf('đơn vị'),
      email: columns.indexOf('email'),
      phone: columns.indexOf('điện thoại'),
      ngach: columns.indexOf('ngạch'),
      position: columns.indexOf('chức vụ'),
    };

    if (Object.values(colIndexes).some((index) => index === -1)) {
      throw new BadRequestException('Missing required columns in the file');
    }
    for (let i = 1; i < dataFile.length; i++) {
      const row = dataFile[i];
      const rowData = Object.values(row);

      await this.updateLecturerRecord(rowData, colIndexes);
    }
  }

  private async updateLecturerRecord(rowData, colIndexes) {
    const mscb = rowData[colIndexes.mscb] as string;
    const username = rowData[colIndexes.username] as string;
    const lecturerName = rowData[colIndexes.displayName] as string;
    const dateOfBirth = rowData[colIndexes.dateOfBirth] as string;
    const gender = rowData[colIndexes.gender] as string;
    const learningPosition = rowData[colIndexes.learningPosition] as string;
    const facultyName = rowData[colIndexes.facultyName];
    const email = rowData[colIndexes.email];
    const phone = rowData[colIndexes.phone];
    const ngach = rowData[colIndexes.ngach];
    const position = rowData[colIndexes.position];

    let faculty: Faculty;
    if (facultyName) {
      faculty = await this.facultyService.findOrCreateFaculty(facultyName);
    }

    if (lecturerName) {
      const [day, month, year] = dateOfBirth.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);

      const updateLecturerDto = new UpdateLecturerDto(
        lecturerName,
        mscb,
        username,
        learningPosition,
        parsedDate,
        gender == 'Nam' ? Gender.M : Gender.F,
        email,
        phone,
        ngach,
        position,
      );

      await this.lecturerService.updatOrCreateLecturer(
        updateLecturerDto,
        faculty,
      );
    }
  }

  async importPoint(file: Express.Multer.File) {
    const targetFolder: string = destinationFolders.point;

    const result = await this.uploadAndProcessPointFile(file, targetFolder);
    return {
      message: 'File imported successfully',
      result,
    };
  }

  async uploadAndProcessPointFile(
    file: Express.Multer.File,
    targetFolder: string,
  ) {
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

    return this.processImportPointFile(fileBuffer, uploadedFile.originalName);
  }

  private async processImportPointFile(fileBuffer: Buffer, fileName: string) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      //Sheet 1 is Ti le danh gia cac lop >50%
      const criteriaSheet = workbook.SheetNames[1];

      //Sheet 3 is DTB cac lop >50%
      const pointSheet = workbook.SheetNames[3];

      const rawCriteriaData = XLSX.utils.sheet_to_json(
        workbook.Sheets[criteriaSheet],
        {
          defval: null,
        },
      );

      const rawPointData = XLSX.utils.sheet_to_json(
        workbook.Sheets[pointSheet],
        {
          defval: null,
        },
      );

      if (rawCriteriaData.length === 0 || rawPointData.length === 0) {
        throw new BadRequestException('No data in file');
      }

      const isCriteriaValid = this.validateFile(rawCriteriaData);
      const isPointValid = this.validateFile(rawPointData);

      if (!isCriteriaValid || !isPointValid) {
        throw new BadRequestException('Invalid file');
      }

      return this.processPointFile(rawCriteriaData, rawPointData);
    } catch (error) {
      this.logger.error(`Error when hadling ${fileName}: ${error.message}`);
      throw new BadRequestException('Error when handle file');
    }
  }

  private async processPointFile(
    criteriaDataFile: any[],
    pointDataFile: any[],
  ) {
    const firstCriteriaRow = criteriaDataFile[0];
    const firstPointRow = pointDataFile[0];

    const semesterCriteriaMatch = regexSemester.exec(
      Object.keys(firstCriteriaRow)[0].trim(),
    );
    const semesterPointMatch = regexSemester.exec(
      Object.keys(firstPointRow)[0].trim(),
    );

    const classTypeRow = Object.entries(pointDataFile[0]).find(
      ([key, value]) => value !== null,
    );

    const classType = classTypeRow ? (classTypeRow[1] as string) : null;

    if (!classType && !regexClassType.test(classType.trim())) {
      throw new BadRequestException('Class type does not match');
    }

    if (!semesterCriteriaMatch || !semesterPointMatch) {
      throw new BadRequestException('Semester information is invalid');
    }

    const [_, type, year] = semesterCriteriaMatch;
    const semesterRequest = new SemesterRequestDto(type, year, classType);
    const semester =
      await this.semesterService.findOrCreateSemester(semesterRequest);

    //Column Header
    const criteriaHeaders = criteriaDataFile[1];
    const pointHeaders = pointDataFile[1];
    const pointCriteriaHeaders = pointDataFile[2];

    const rawCriteriaColumns = Object.values(criteriaHeaders);
    const rawPointColumns = Object.values(pointHeaders);
    const rawPointCriteriaColumns = Object.values(pointCriteriaHeaders);

    const criteriaColumns = rawCriteriaColumns.map((col) =>
      col ? String(col).trim().toLowerCase() : rawCriteriaColumns.pop(),
    );

    const pointColumns = rawPointColumns.map((col) =>
      col ? String(col).trim().toLowerCase() : rawPointColumns.pop(),
    );

    const pointCriteriaColumns = rawPointCriteriaColumns.map((col) =>
      col ? String(col).trim().toLowerCase() : rawPointCriteriaColumns.pop(),
    );

    const criteriaColumnIndexes = {
      index: criteriaColumns.indexOf('stt'),
      criteria: criteriaColumns.indexOf('câu hỏi'),
    };
    const pointColumnIndexes = {
      index: pointColumns.indexOf('stt'),
      lecturerName: pointColumns.indexOf('giảng viên'),
      facultyName: pointColumns.indexOf('khoa/bộ môn'),
      className: pointColumns.indexOf('lớp'),
      program: pointColumns.indexOf('chương trình'),
      subject: pointColumns.indexOf('môn học'),
      totalStudent: pointColumns.indexOf('sỉ số'),
      participant: pointColumns.indexOf('tham gia'),
      avgPoint:
        [
          'M/4 (không tính các tiêu chí về trang thiết bị, CSVC)',
          'M/5 (không tính các tiêu chí về trang thiết bị, CSVC)',
          'm/4 (không tính các tiêu chí về trang thiết bị, csvc)',
          'm/5 (không tính các tiêu chí về trang thiết bị, csvc)',
        ]
          .map((label) => pointColumns.indexOf(label))
          .find((index) => index !== -1) || -1,
    };

    if (
      Object.values(criteriaColumnIndexes).some((index) => index === -1) ||
      Object.values(pointColumnIndexes).some((index) => index === -1)
    ) {
      throw new BadRequestException('Missing required columns in the file');
    }

    const importedCriteria: Criteria[] = [];
    for (let i = 2; i < criteriaDataFile.length; i++) {
      const row = criteriaDataFile[i];
      const rowData = Object.values(row);

      const criteria = await this.updateCriteriaRecord(
        rowData,
        criteriaColumnIndexes,
        semester,
      );

      importedCriteria.push(criteria);
    }

    for (let i = 3; i < pointDataFile.length; i++) {
      const row = pointDataFile[i];
      const rowData = Object.values(row);

      await this.updatePointRecord(
        rowData,
        pointColumnIndexes,
        semester,
        importedCriteria,
        pointCriteriaColumns,
        classType,
      );
    }
  }

  private async updateCriteriaRecord(
    rowData,
    colIndexes,
    semester: Semester,
  ): Promise<Criteria> {
    const index = rowData[colIndexes.index];
    const criteria = rowData[colIndexes.criteria];

    if (!criteria) {
      throw new BadRequestException('criteria is invalid');
    }
    const updateCriteriaDto = new UpdateCriteriaDto(criteria, index);

    return this.criteriaService.updateOrCreateCriteria(
      updateCriteriaDto,
      semester,
    );
  }

  private async updatePointRecord(
    rowData,
    colIndexes,
    semester: Semester,
    importedCriteria: Criteria[],
    pointCriteriaColumns,
    classType,
  ) {
    const lecturerName = rowData[colIndexes.lecturerName];
    const facultyName = rowData[colIndexes.facultyName];
    const className = rowData[colIndexes.className];
    const program = rowData[colIndexes.program];
    const subjectName = rowData[colIndexes.subject];
    const avgPoint = rowData[colIndexes.avgPoint];
    const totalStudent = rowData[colIndexes.totalStudent];
    const participant = rowData[colIndexes.totalStudent];

    const faculty = await this.facultyService.findOrCreateFaculty(facultyName);
    const subject = await this.subjectService.findOrCreateSubject(
      subjectName,
      faculty,
    );

    let lecturer: Lecturer;

    if (lecturerName) {
      lecturer = await this.lecturerService.updateOrCreateLecturer(
        lecturerName,
        faculty,
        avgPoint,
      );
    }
    let classDto: ClassResponseDto;

    if (className) {
      const classRequestDto = new ClassRequestDto(
        className,
        program,
        subject?.subject_id,
        lecturer?.lecturer_id,
        totalStudent,
        participant,
        classType,
      );

      classDto = await this.classService.findOrCreateClassByNameAndSemesterId(
        classRequestDto,
        lecturer,
        semester,
      );
    }

    for (let i = 0; i < pointCriteriaColumns.length; i++) {
      const pointValue = rowData[9 + i];

      if (pointValue && importedCriteria[i]) {
        const bulkPointDto = new BulkPointDto(
          parseFloat(pointValue),
          classDto.class_id,
          importedCriteria[i].criteria_id,
        );

        await this.pointService.createPointFromImport(bulkPointDto);
      }
    }
  }
}
