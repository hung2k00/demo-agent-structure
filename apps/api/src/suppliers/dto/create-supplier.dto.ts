import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty({ message: 'Mã nhà cung cấp không được để trống' })
  @IsString()
  code: string;

  @IsNotEmpty({ message: 'Tên nhà cung cấp không được để trống' })
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
