import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { NavGroup } from './entities/nav-group.entity';
import { NavItem } from './entities/nav-item.entity';
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

@Injectable()
export class NavigationService {
  constructor(
    @InjectRepository(NavGroup)
    private readonly groupRepo: Repository<NavGroup>,
    @InjectRepository(NavItem)
    private readonly itemRepo: Repository<NavItem>,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== Group CRUD ====================

  async findAllGroups(): Promise<NavGroup[]> {
    const groups = await this.groupRepo.find({
      order: { sortOrder: 'ASC' },
    });
    // Items are eager loaded, sort them
    return groups.map((group) => ({
      ...group,
      items: group.items.sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  }

  async findOneGroup(id: string): Promise<NavGroup> {
    const group = await this.groupRepo.findOne({
      where: { id },
    });
    if (!group) {
      throw new NotFoundException(`NavGroup with id "${id}" not found`);
    }
    return {
      ...group,
      items: group.items.sort((a, b) => a.sortOrder - b.sortOrder),
    };
  }

  async createGroup(dto: CreateNavGroupDto): Promise<NavGroup> {
    // Get the max sortOrder if not provided
    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const result = await this.groupRepo
        .createQueryBuilder('group')
        .select('MAX(group.sortOrder)', 'max')
        .getRawOne<{ max: number | null }>();
      sortOrder = (result?.max ?? -1) + 1;
    }

    const group = this.groupRepo.create({
      ...dto,
      sortOrder,
    });
    return this.groupRepo.save(group);
  }

  async updateGroup(id: string, dto: UpdateNavGroupDto): Promise<NavGroup> {
    const group = await this.findOneGroup(id);
    Object.assign(group, dto);
    return this.groupRepo.save(group);
  }

  async removeGroup(id: string): Promise<void> {
    const group = await this.findOneGroup(id);
    // Cascade delete is configured in entity
    await this.groupRepo.remove(group);
  }

  async reorderGroups(dto: ReorderGroupsDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Verify all groups exist
      const groups = await manager.find(NavGroup, {
        where: { id: In(dto.ids) },
      });
      if (groups.length !== dto.ids.length) {
        throw new NotFoundException('One or more groups not found');
      }

      // Update sortOrder for each group
      for (let i = 0; i < dto.ids.length; i++) {
        await manager.update(NavGroup, dto.ids[i], { sortOrder: i });
      }
    });
  }

  // ==================== Item CRUD ====================

  async createItem(groupId: string, dto: CreateNavItemDto): Promise<NavItem> {
    // Verify group exists
    const group = await this.findOneGroup(groupId);

    // Get the max sortOrder if not provided
    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const result = await this.itemRepo
        .createQueryBuilder('item')
        .select('MAX(item.sortOrder)', 'max')
        .where('item.groupId = :groupId', { groupId })
        .getRawOne<{ max: number | null }>();
      sortOrder = (result?.max ?? -1) + 1;
    }

    const item = this.itemRepo.create({
      ...dto,
      groupId,
      sortOrder,
    });
    const savedItem = await this.itemRepo.save(item);

    // Return with group relation
    return {
      ...savedItem,
      group,
    };
  }

  async updateItem(id: string, dto: UpdateNavItemDto): Promise<NavItem> {
    const item = await this.itemRepo.findOne({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`NavItem with id "${id}" not found`);
    }
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async removeItem(id: string): Promise<void> {
    const item = await this.itemRepo.findOne({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`NavItem with id "${id}" not found`);
    }
    await this.itemRepo.remove(item);
  }

  async reorderItems(dto: ReorderItemsDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Get all items to verify they exist and belong to the same group
      const items = await manager.find(NavItem, {
        where: { id: In(dto.ids) },
      });
      if (items.length !== dto.ids.length) {
        throw new NotFoundException('One or more items not found');
      }

      // Verify all items belong to the same group
      const groupIds = new Set(items.map((item) => item.groupId));
      if (groupIds.size > 1) {
        throw new Error('All items must belong to the same group');
      }

      // Update sortOrder for each item
      for (let i = 0; i < dto.ids.length; i++) {
        await manager.update(NavItem, dto.ids[i], { sortOrder: i });
      }
    });
  }

  async moveItem(id: string, dto: MoveItemDto): Promise<NavItem> {
    const item = await this.itemRepo.findOne({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`NavItem with id "${id}" not found`);
    }

    // Verify target group exists
    const targetGroup = await this.findOneGroup(dto.targetGroupId);

    // Get sortOrder if not provided
    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const result = await this.itemRepo
        .createQueryBuilder('item')
        .select('MAX(item.sortOrder)', 'max')
        .where('item.groupId = :groupId', { groupId: dto.targetGroupId })
        .getRawOne<{ max: number | null }>();
      sortOrder = (result?.max ?? -1) + 1;
    }

    // Update item
    item.groupId = dto.targetGroupId;
    item.sortOrder = sortOrder;
    const savedItem = await this.itemRepo.save(item);

    return {
      ...savedItem,
      group: targetGroup,
    };
  }

  // ==================== Batch Operations ====================

  async mergeItems(dto: MergeItemsDto): Promise<NavGroup> {
    return this.dataSource.transaction(async (manager) => {
      // Get all items to merge
      const items = await manager.find(NavItem, {
        where: { id: In(dto.itemIds) },
        relations: ['group'],
      });
      if (items.length !== dto.itemIds.length) {
        throw new NotFoundException('One or more items not found');
      }

      // Create new group (folder)
      const newGroup = manager.create(NavGroup, {
        name: dto.folderName,
        sortOrder: 0, // Will be updated
      });
      const savedGroup = await manager.save(newGroup);

      // Move items to the new group
      for (let i = 0; i < items.length; i++) {
        items[i].groupId = savedGroup.id;
        items[i].sortOrder = i;
        await manager.save(items[i]);
      }

      // Return the new group with items
      const result = await manager.findOne(NavGroup, {
        where: { id: savedGroup.id },
      });
      return result!;
    });
  }

  async importNavigation(dto: ImportNavigationDto): Promise<{ groups: number; items: number }> {
    return this.dataSource.transaction(async (manager) => {
      // Clear existing data (cascade delete items)
      await manager.delete(NavItem, {});
      await manager.delete(NavGroup, {});

      let itemCount = 0;

      // Create groups with items
      for (let groupIndex = 0; groupIndex < dto.groups.length; groupIndex++) {
        const groupData = dto.groups[groupIndex];

        // Create group
        const group = manager.create(NavGroup, {
          name: groupData.name,
          icon: groupData.icon,
          sortOrder: groupIndex,
        });
        const savedGroup = await manager.save(group);

        // Create items
        for (let itemIndex = 0; itemIndex < groupData.items.length; itemIndex++) {
          const itemData = groupData.items[itemIndex];
          const item = manager.create(NavItem, {
            name: itemData.name,
            url: itemData.url,
            src: itemData.src,
            type: itemData.type ?? 'icon',
            backgroundColor: itemData.backgroundColor,
            iconText: itemData.iconText,
            size: itemData.size,
            component: itemData.component,
            sortOrder: itemIndex,
            originalId: itemData.originalId,
            groupId: savedGroup.id,
          });
          await manager.save(item);
          itemCount++;
        }
      }

      return { groups: dto.groups.length, items: itemCount };
    });
  }

  async exportNavigation(): Promise<{
    groups: Array<{
      id: string;
      name: string;
      icon: string | null;
      sortOrder: number;
      createdAt: Date;
      updatedAt: Date;
      items: Array<{
        id: string;
        name: string;
        url: string | null;
        src: string | null;
        type: 'icon' | 'text' | 'component';
        backgroundColor: string | null;
        iconText: string | null;
        size: string | null;
        component: string | null;
        sortOrder: number;
        originalId: string | null;
        groupId: string;
        createdAt: Date;
        updatedAt: Date;
      }>;
    }>;
  }> {
    const groups = await this.findAllGroups();
    return { groups };
  }
}
