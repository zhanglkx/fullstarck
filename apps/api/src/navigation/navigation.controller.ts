import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import {
  CreateNavGroupDto,
  UpdateNavGroupDto,
  ReorderGroupsDto,
  CreateNavItemDto,
  UpdateNavItemDto,
  ReorderItemsDto,
  MoveItemDto,
  MergeItemsDto,
  ImportNavigationDto,
} from './dto';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  // ==================== Group Endpoints ====================

  @Get('groups')
  findAllGroups() {
    return this.navigationService.findAllGroups();
  }

  @Get('groups/:id')
  findOneGroup(@Param('id') id: string) {
    return this.navigationService.findOneGroup(id);
  }

  @Post('groups')
  createGroup(@Body() dto: CreateNavGroupDto) {
    return this.navigationService.createGroup(dto);
  }

  @Patch('groups/:id')
  updateGroup(@Param('id') id: string, @Body() dto: UpdateNavGroupDto) {
    return this.navigationService.updateGroup(id, dto);
  }

  @Delete('groups/:id')
  async removeGroup(@Param('id') id: string) {
    await this.navigationService.removeGroup(id);
    return { message: 'Group deleted successfully' };
  }

  @Patch('groups/reorder')
  async reorderGroups(@Body() dto: ReorderGroupsDto) {
    await this.navigationService.reorderGroups(dto);
    return { message: 'Groups reordered successfully' };
  }

  // ==================== Item Endpoints ====================

  @Post('groups/:groupId/items')
  createItem(@Param('groupId') groupId: string, @Body() dto: CreateNavItemDto) {
    return this.navigationService.createItem(groupId, dto);
  }

  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateNavItemDto) {
    return this.navigationService.updateItem(id, dto);
  }

  @Delete('items/:id')
  async removeItem(@Param('id') id: string) {
    await this.navigationService.removeItem(id);
    return { message: 'Item deleted successfully' };
  }

  @Patch('items/reorder')
  async reorderItems(@Body() dto: ReorderItemsDto) {
    await this.navigationService.reorderItems(dto);
    return { message: 'Items reordered successfully' };
  }

  @Patch('items/:id/move')
  moveItem(@Param('id') id: string, @Body() dto: MoveItemDto) {
    return this.navigationService.moveItem(id, dto);
  }

  // ==================== Batch Operations ====================

  @Post('items/merge')
  mergeItems(@Body() dto: MergeItemsDto) {
    return this.navigationService.mergeItems(dto);
  }

  @Post('import')
  importNavigation(@Body() dto: ImportNavigationDto) {
    return this.navigationService.importNavigation(dto);
  }

  @Get('export')
  exportNavigation() {
    return this.navigationService.exportNavigation();
  }
}
