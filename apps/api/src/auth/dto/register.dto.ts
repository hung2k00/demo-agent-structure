import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @Length(2, 50, { message: 'Họ và tên phải có độ dài từ 2 đến 50 ký tự' })
  fullName: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @Length(8, 32, { message: 'Mật khẩu phải từ 8 đến 32 ký tự' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt',
  })
  password: string;

  @IsOptional()
  @IsString({ message: 'Tên công ty/kho phải là chuỗi' })
  companyName?: string;

  @IsOptional()
  @IsString({ message: 'ID công ty/kho phải là chuỗi' })
  tenantId?: string;
}
