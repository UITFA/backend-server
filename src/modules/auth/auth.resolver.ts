import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from '../user/decorator/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { RequestUserDto } from './dtos/request/user.dto';
import { AuthDto } from './dtos/response/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './strategies/jwt-refresh-auth.guard';
import { UserDto } from '../user/dto/response/user.dto';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly jwtService: JwtService,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Mutation(() => AuthDto)
  async login(@Args() credential: RequestUserDto): Promise<AuthDto> {
    const user = await this.authService.validateUser(credential);

    if (!user) throw new UnauthorizedException();

    if (user.auth && user.auth != null) {
      const currentUser = user.newUser ? user.newUser : user.user;

      if (currentUser) {
        const {
          access_token,
          refresh_token,
          accessTokenExpiredDate,
          refreshTokenExpiredDate,
        } = this.authService.generateToken(user.auth);

        return new AuthDto(
          {
            access_token,
            refresh_token,
            accessTokenExpiredDate,
            refreshTokenExpiredDate,
            ...currentUser,
          },
          currentUser,
          null,
        );
      }
    } else {
      const result = await this.authService.login(user.user);
      return new AuthDto({}, result.user, result.access_token);
    }
  }

  
  @Mutation(() => AuthDto)
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(@CurrentUser() userDto: UserDto) {
    const { access_token, accessTokenExpiredDate } =
      this.authService.refreshToken(userDto);
    return {
      access_token,
      accessTokenExpiredDate,
      ...userDto,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserEntity)
  async currentUser(@CurrentUser() userDto: UserDto) {
    return this.userService.findByUsername(userDto.username);
  }
}
