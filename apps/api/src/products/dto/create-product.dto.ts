import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Matches } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Mã SKU không được để trống' })
  @IsString()
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'Mã SKU chỉ được chứa chữ cái viết hoa (A-Z), chữ số (0-9) và dấu gạch nối (-)',
  })
  sku: string;

  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsNotEmpty({ message: 'Đơn vị tính không được để trống' })
  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Ngưỡng tồn kho tối thiểu không được âm' })
  minQuantity?: number;

  @IsNotEmpty({ message: 'Giá sản phẩm không được để trống' })
  @IsNumber()
  @Min(0, { message: 'Giá sản phẩm không được âm' })
  price: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'Mã SKU chỉ được chứa chữ cái viết hoa (A-Z), chữ số (0-9) và dấu gạch nối (-)',
  })
  sku?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
