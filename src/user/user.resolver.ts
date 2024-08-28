import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Faculty } from 'src/faculty/entities/faculty.entity';
import { CurrentUser } from './decorator/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { Lecturer } from 'src/lecturer/entities/lecturer.entity';
import { MailService } from 'src/mail/mail.service';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Query(() => [UserEntity], { name: 'users' })
  findAll(@Args('name', { nullable: true }) name?: string) {
    return this.userService.findAll(name);
  }

  @Mutation(() => UserEntity)
  async registerUser(
    @Args('user')
    user: UserDto,
  ): Promise<UserEntity> {
    const createdUser = await this.userService.create(user);
    const userEntity = await this.userService.findById(createdUser.id);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(user.username)) {
      this.mailService.sendMail({
        to: user.username,
        subject: 'Thông tin đăng nhập hệ thống AQA',
        html: `<body style="box-sizing: border-box; margin: 0;">
          <table class="main-body" style="box-sizing: border-box; min-height: 150px; padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 5px; width: 100%; height: 100%; background-color: rgb(234, 236, 237);" width="100%" height="100%" bgcolor="rgb(234, 236, 237)">
            <tbody style="box-sizing: border-box;">
              <tr class="row" style="box-sizing: border-box; vertical-align: top;" valign="top">
                <td class="main-body-cell" id="injs" style="box-sizing: border-box;">
                  <table class="container" id="ig1s" style="box-sizing: border-box; font-family: Helvetica, serif; min-height: 150px; padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 5px; margin-top: auto; margin-right: auto; margin-bottom: auto; margin-left: auto; height: 0px; width: 90%; max-width: 800px;" width="90%" height="0">
                    <tbody style="box-sizing: border-box;">
                      <tr style="box-sizing: border-box;">
                        <td class="container-cell" id="ik8b" style="box-sizing: border-box; vertical-align: top; font-size: medium; padding-bottom: 50px;" valign="top">
                          <table class="card" style="box-sizing: border-box; min-height: 150px; padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 5px; margin-bottom: 20px; height: 0px;" height="0">
                            <tbody style="box-sizing: border-box;">
                              <tr style="box-sizing: border-box;">
                                <td class="card-cell" style="box-sizing: border-box; background-color: rgb(255, 255, 255); overflow-x: hidden; overflow-y: hidden; border-top-left-radius: 3px; border-top-right-radius: 3px; border-bottom-right-radius: 3px; border-bottom-left-radius: 3px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; text-align: center;" bgcolor="rgb(255, 255, 255)" align="center">
                                  <table class="table100 c1357" style="box-sizing: border-box; width: 100%; min-height: 150px; padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 5px; height: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; border-collapse: collapse;" width="100%" height="0">
                                    <tbody style="box-sizing: border-box;">
                                      <tr style="box-sizing: border-box;">
                                        <td class="card-content" id="ih82l" style="box-sizing: border-box; font-size: 13px; line-height: 20px; color: rgb(111, 119, 125); padding-top: 10px; padding-right: 20px; padding-bottom: 0px; padding-left: 20px; vertical-align: top;" valign="top">
                                          <h1 class="card-title" id="i7pgn" style="box-sizing: border-box; font-size: 25px; font-weight: 300; color: rgb(68, 68, 68);">Thông tin đăng nhập hệ thống AQA
                                            <br style="box-sizing: border-box;">
                                          </h1>
                                          <p class="card-text" id="ijjm6" style="box-sizing: border-box; margin: 40px 0 0 0;">Kính gửi ${userEntity.lecturer?.gender ? 'thầy' : 'cô'} ${userEntity.lecturer?.display_name},
                                            <br style="box-sizing: border-box;">Hiện tại nhóm nghiên cứu khoa học đang thực hiện đề tài "PHÂN TÍCH NHU CẦU VÀ TRỰC QUAN HOÁ DỮ LIỆU KHẢO SÁT NHẰM HỖ TRỢ LÃNH ĐẠO, GIẢNG VIÊN TRONG CÔNG TÁC QUẢN LÝ TẠI TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN, ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH" do ThS. Trịnh Thị Mỹ Hiền làm chủ nhiệm.
                                            <br style="box-sizing: border-box;">
                                            <br style="box-sizing: border-box;">Mời quý thầy cô xem qua chương trình do nhóm thực hiện tại đường dẫn này.
                                            <br style="box-sizing: border-box;"><a href="https://aqa-uit.netlify.app/">AQA UIT Web</a>
                                          </p>
                                          <p class="card-text" id="i7ina" style="box-sizing: border-box; margin: 20px 0 0 0;">Sau đây là thông tin đăng nhập của quý thầy/cô.
                                          </p>
                                          <p class="card-text" id="if0j3" style="box-sizing: border-box; margin: 20px 0 0 0;">Tên đăng nhập
                                          </p>
                                          <p class="card-text" id="iyv6t" style="box-sizing: border-box; margin: 5px 0px 0px 0px; font-size: 20px; font-weight: 600;">${userEntity.username}
                                          </p>
                                          <p class="card-text" id="ire57" style="box-sizing: border-box; margin: 20px 0 0 0;">Mật khẩu
                                          </p>
                                          <p class="card-text" id="iq4u3" style="box-sizing: border-box; margin: 5px 0px 0px 0px; font-size: 20px; font-weight: 600;">${user.password}
                                          </p>
                                          <table class="c1542" style="box-sizing: border-box; margin-top: 0px; margin-right: auto; margin-bottom: 10px; margin-left: auto; padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 5px; width: 100%;" width="100%">
                                            <tbody style="box-sizing: border-box;">
                                              <tr style="box-sizing: border-box;">
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </body>`,
      });
    }
    return userEntity;
  }

  @Mutation(() => UserEntity)
  updateUser(
    @Args('user')
    user: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userService.update(user.id, user);
  }

  @Mutation(() => Boolean)
  async removeUser(
    @Args('id')
    id: string,
  ): Promise<any> {
    await this.userService.remove(id);
    return true;
  }

  @Query(() => UserEntity)
  @UseGuards(JwtAuthGuard)
  profile(@CurrentUser() user: UserEntity) {
    return user;
  }

  @ResolveField(() => Faculty, { nullable: true })
  faculty(@Parent() user: UserEntity) {
    return user.faculty;
  }

  @ResolveField(() => Lecturer, { nullable: true })
  lecturer(@Parent() user: UserEntity) {
    return user.lecturer;
  }
}
