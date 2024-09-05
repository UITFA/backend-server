import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiService } from '../api/services/api.service';
import { SharedModule } from 'src/shared/shared.module';
import { ApiModule } from '../api/api.module';
import { LecturerModule } from '../lecturer/lecturer.module';

@Module({
  imports: [
    UserModule,
    ApiModule,
    SharedModule,
    LecturerModule,
    PassportModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '10d' },
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
