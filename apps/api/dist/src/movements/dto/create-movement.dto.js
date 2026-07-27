"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMovementStatusDto = exports.CreateMovementDto = exports.MovementItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class MovementItemDto {
    productId;
    quantity;
    price;
}
exports.MovementItemDto = MovementItemDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'ProductId không được để trống' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MovementItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Số lượng không được để trống' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: 'Số lượng phải lớn hơn 0' }),
    __metadata("design:type", Number)
], MovementItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Đơn giá không được để trống' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: 'Đơn giá không được âm' }),
    __metadata("design:type", Number)
], MovementItemDto.prototype, "price", void 0);
class CreateMovementDto {
    type;
    supplierId;
    note;
    items;
}
exports.CreateMovementDto = CreateMovementDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Loại phiếu nhập/xuất không được để trống' }),
    (0, class_validator_1.IsEnum)(client_1.MovementType, { message: 'Loại phiếu phải là IMPORT hoặc EXPORT' }),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "supplierId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MovementItemDto),
    __metadata("design:type", Array)
], CreateMovementDto.prototype, "items", void 0);
class UpdateMovementStatusDto {
    status;
}
exports.UpdateMovementStatusDto = UpdateMovementStatusDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Trạng thái không được để trống' }),
    (0, class_validator_1.IsEnum)(client_1.MovementStatus, { message: 'Trạng thái phải là COMPLETED hoặc CANCELLED' }),
    __metadata("design:type", String)
], UpdateMovementStatusDto.prototype, "status", void 0);
//# sourceMappingURL=create-movement.dto.js.map