import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Mã danh mục không được để trống' })
  @IsString()
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'Mã danh mục chỉ được chứa chữ cái viết hoa (A-Z), chữ số (0-9) và dấu gạch nối (-)',
  })
  code: string;

  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'Mã danh mục chỉ được chứa chữ cái viết hoa (A-Z), chữ số (0-9) và dấu gạch nối (-)',
  })
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
