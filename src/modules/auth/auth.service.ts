import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as moment from 'moment';
import API_URL from 'src/common/constants/url';
import { MoodleException } from '../api/errors/moodle.error';
import { UserApiService } from '../api/services/user-api.service';
import { UserDto } from '../user/dto/response/user.dto';
import { UserService } from '../user/user.service';
import { RequestUserDto } from './dtos/request/user.dto';
import { AuthDto } from './dtos/response/auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../user/enums/role.enum';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userApiService: UserApiService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(userRequest: RequestUserDto) {
    const user = await this.userService.findByUsername(userRequest.username);
    console.log('user ne', JSON.stringify(user), 'aaaa');

    const { username, password } = { ...userRequest };

    if (!user || user == null || user.user_id == null) {
      const response = await axios.post(API_URL.authentication, null, {
        params: { username, password, service: 'moodle_mobile_app' },
      });

      if (!response.data.token) {
        throw new MoodleException(
          response.data.exception,
          response.data.errorcode,
          response.data.error,
        );
      }

      const userData = await this.userApiService.getUserProfile({
        username,
        token: response.data.token,
      });

      const newUser = await this.userService.createDefault({
        ...userData,
        displayName: userData.fullname,
        id: userData.id,
        role: Role.LECTURER,
        email: userData.email,
        user_id: uuidv4(),
      });

      const auth = new AuthDto(
        {
          isFirstTimeLogin: true,
          token: response.data.token,
          ...newUser,
        },
        newUser,
        null,
      );

      return { auth, newUser };
    } else {
      if (user.isDefault) {

        const response = await axios.post(API_URL.authentication, null, {
          params: { username, password, service: 'moodle_mobile_app' },
        });

        const auth = new AuthDto(
          {
            isFirstTimeLogin: false,
            token: response.data.token,
            ...user,
          },
          user,
          null,
        );

        return { auth, user };
      } else {
        // const isMatch = await bcrypt.compare(
        //   userRequest.password,
        //   user.password,
        // );

        // if (isMatch) {
        //   return user;
        // }
        return { user };
      }
    }
  }

  async login(user: UserDto) {
    const payload = { ...user, sub: user.user_id };

    const result = {
      access_token: this.jwtService.sign(payload, { expiresIn: '100d' }),
      user,
    };
    return result;
  }

  
  generateToken(authDto: AuthDto) {
    const access_token = this.jwtService.sign(
      {
        ...authDto,
        sub: authDto.username,
      },
      {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
        expiresIn:
          this.configService.get('ENVIRONMENT') === 'development'
            ? '100d'
            : '1h',
      },
    );
    const accessTokenExpiredDate = moment().add(1, 'hour').toDate();

    const refresh_token = this.jwtService.sign(
      {
        ...authDto,
        sub: authDto.username,
      },
      {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: '14d',
      },
    );
    const refreshTokenExpiredDate = moment().add(14, 'days').toDate();

    return {
      access_token,
      refresh_token,
      accessTokenExpiredDate,
      refreshTokenExpiredDate,
    };
  }

  refreshToken(userDto: UserDto) {
    const access_token = this.jwtService.sign(
      {
        ...userDto,
        sub: userDto.username,
      },
      { secret: this.configService.get('ACCESS_TOKEN_SECRET') },
    );
    const accessTokenExpiredDate = moment().add(1, 'hour').toDate();

    return { access_token, accessTokenExpiredDate };
  }
}
