import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async getTenants() {
    return this.prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    if (!dto.tenantId && (!dto.companyName || !dto.companyName.trim())) {
      throw new BadRequestException('Vui lòng chọn hoặc nhập tên kho/cửa hàng');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng trong hệ thống');
    }

    try {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(dto.password, saltRounds);

      let tenant;
      let defaultRole: 'ADMIN' | 'WAREHOUSE_MANAGER' | 'STAFF' = 'ADMIN';

      if (dto.tenantId) {
        tenant = await this.prisma.tenant.findUnique({
          where: { id: dto.tenantId },
        });
        if (!tenant) {
          throw new BadRequestException('Kho/Cửa hàng được chọn không tồn tại');
        }
        const existingUsersCount = await this.prisma.user.count({
          where: { tenantId: tenant.id },
        });
        defaultRole = existingUsersCount === 0 ? 'ADMIN' : 'STAFF';
      } else if (dto.companyName) {
        const inputName = dto.companyName.trim();
        tenant = await this.prisma.tenant.findFirst({
          where: {
            name: {
              equals: inputName,
              mode: 'insensitive',
            },
          },
        });

        if (tenant) {
          const existingUsersCount = await this.prisma.user.count({
            where: { tenantId: tenant.id },
          });
          defaultRole = existingUsersCount === 0 ? 'ADMIN' : 'STAFF';
        } else {
          tenant = await this.prisma.tenant.create({
            data: {
              name: inputName,
            },
          });
          defaultRole = 'ADMIN';
        }
      }

      const newUser = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          fullName: dto.fullName.trim(),
          passwordHash,
          role: defaultRole,
          tenantId: tenant.id,
        },
        include: {
          tenant: true,
        },
      });

      const payload = {
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
      };

      const accessToken = this.jwtService.sign(payload);

      const { passwordHash: _, ...sanitizedUser } = newUser;

      return {
        accessToken,
        user: {
          ...sanitizedUser,
          tenantName: tenant.name,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi hệ thống khi đăng ký tài khoản');
    }
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);

    const { passwordHash: _, ...sanitizedUser } = user;

    return {
      accessToken,
      user: {
        ...sanitizedUser,
        tenantName: user.tenant.name,
      },
    };
  }
}
