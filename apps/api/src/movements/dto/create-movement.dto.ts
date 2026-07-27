import { IsNotEmpty, IsEnum, IsOptional, IsString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MovementType, MovementStatus } from '@prisma/client';

export class MovementItemDto {
  @IsNotEmpty({ message: 'ProductId không được để trống' })
  @IsString()
  productId: string;

  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsNumber()
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;

  @IsNotEmpty({ message: 'Đơn giá không được để trống' })
  @IsNumber()
  @Min(0, { message: 'Đơn giá không được âm' })
  price: number;
}

export class CreateMovementDto {
  @IsNotEmpty({ message: 'Loại phiếu nhập/xuất không được để trống' })
  @IsEnum(MovementType, { message: 'Loại phiếu phải là IMPORT hoặc EXPORT' })
  type: MovementType;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovementItemDto)
  items: MovementItemDto[];
}

export class UpdateMovementStatusDto {
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(MovementStatus, { message: 'Trạng thái phải là COMPLETED hoặc CANCELLED' })
  status: MovementStatus;
}
