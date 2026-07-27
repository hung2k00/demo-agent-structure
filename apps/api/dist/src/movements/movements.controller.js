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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementsController = void 0;
const common_1 = require("@nestjs/common");
const movements_service_1 = require("./movements.service");
const create_movement_dto_1 = require("./dto/create-movement.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let MovementsController = class MovementsController {
    movementsService;
    constructor(movementsService) {
        this.movementsService = movementsService;
    }
    async create(req, dto) {
        return this.movementsService.create(req.user.tenantId, req.user.id, dto);
    }
    async findAll(req, type, status) {
        return this.movementsService.findAll(req.user.tenantId, type, status);
    }
    async getStockLogs(req) {
        return this.movementsService.getStockLogs(req.user.tenantId);
    }
    async findOne(req, id) {
        return this.movementsService.findOne(req.user.tenantId, id);
    }
    async updateStatus(req, id, dto) {
        return this.movementsService.updateStatus(req.user.tenantId, id, dto);
    }
};
exports.MovementsController = MovementsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.WAREHOUSE_MANAGER, client_1.UserRole.STAFF),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_movement_dto_1.CreateMovementDto]),
    __metadata("design:returntype", Promise)
], MovementsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.WAREHOUSE_MANAGER, client_1.UserRole.STAFF),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MovementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('logs/history'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.WAREHOUSE_MANAGER, client_1.UserRole.STAFF),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MovementsController.prototype, "getStockLogs", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.WAREHOUSE_MANAGER, client_1.UserRole.STAFF),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MovementsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.WAREHOUSE_MANAGER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_movement_dto_1.UpdateMovementStatusDto]),
    __metadata("design:returntype", Promise)
], MovementsController.prototype, "updateStatus", null);
exports.MovementsController = MovementsController = __decorate([
    (0, common_1.Controller)('movements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [movements_service_1.MovementsService])
], MovementsController);
//# sourceMappingURL=movements.controller.js.map