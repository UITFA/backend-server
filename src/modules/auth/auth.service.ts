import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as moment from 'moment';
import API_URL from 'src/common/constants/url';
import { v4 as uuidv4 } from 'uuid';
import { MoodleException } from '../api/errors/moodle.error';
import { UserApiService } from '../api/services/user-api.service';
import { LecturerService } from '../lecturer/lecturer.service';
import { UserDto } from '../user/dto/response/user.dto';
import { Role } from '../user/enums/role.enum';
import { UserService } from '../user/user.service';
import { RequestUserDto } from './dtos/request/user.dto';
import { AuthDto } from './dtos/response/auth.dto';
import { RuleService } from '../../shared/services/rule.service';
import { RuleEngineService } from 'src/shared/services/rule-engine.service';
import { RuleType } from '../user/enums/rule.type';
import { Fact, RuleProperties } from 'json-rules-engine';
import bcrypt from 'bcryptjs';
import { IRoleEvent as IRoleEvent } from 'src/shared/entities/rule.entity';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userApiService: UserApiService,
    private readonly configService: ConfigService,
    private readonly lecturerService: LecturerService,
    private readonly ruleService: RuleService,
  ) {}

  async validateUser(userRequest: RequestUserDto) {
    const user = await this.userService.findByUsername(userRequest.username);

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

      const lecturer = await this.lecturerService.mapLecturer(
        userData.fullname,
      );

      const role = await this.handleRuleEngine(userData.fullname);

      const newUser = await this.userService.createDefault({
        ...userData,
        user_id: uuidv4(),
        displayName: userData.fullname,
        id: userData.id,
        role: role ? role : Role.LECTURER,
        email: userData.email,
        lecturer: lecturer,
        faculty: lecturer.faculty,
      });

      await this.handleRuleEngine(newUser.displayName);

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
        const isMatch = await bcrypt.compare(
          userRequest.password,
          user.password,
        );

        if (isMatch) {
          return {user};
        }
        return { user };
      }
    }
  }

  async handleRuleEngine(name: string): Promise<Role> {
    const engine = new RuleEngineService();

    const rule = await this.ruleService.findByName(RuleType.ROLE);

    engine.importRules(rule.ruleData as RuleProperties[]);
    const fact = new Fact('name', name);
    engine.addFact(fact);

    const result = await engine.run();

    const event = result.events[0] as IRoleEvent;
    const message = event.params.role;

    const role = Role[message as keyof typeof Role];
    if (!role) {
      throw new Error(`Invalid role ne: ${message}`);
    }

    return role;
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
