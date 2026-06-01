/**
 * Seed script for importing navigation data from itab-default-nav.json
 *
 * This script is idempotent - it can be run multiple times without creating duplicates.
 * It uses originalId to track which items have already been imported.
 */

import dataSource from '../data-source';
import { Repository } from 'typeorm';
import { NavGroup } from './entities/nav-group.entity';
import { NavItem } from './entities/nav-item.entity';

// Type definitions for the source JSON structure
interface SourceNavItem {
  id: string;
  name: string;
  url?: string;
  src?: string;
  type?: 'icon' | 'text' | 'component';
  backgroundColor?: string;
  iconText?: string;
  size?: string;
  component?: string;
  view?: number;
  config?: Record<string, unknown>;
  insetType?: string;
}

interface SourceNavGroup {
  id: string;
  name: string;
  icon?: string;
  children: SourceNavItem[];
}

interface SourceNavigationData {
  navConfig: SourceNavGroup[];
}

// Path to the source JSON file
const SOURCE_JSON_PATH = '../../../coeurvers/lib/itab-default-nav.json';

/**
 * Transform source NavItem to NavItem entity structure
 */
function transformNavItem(item: SourceNavItem, sortOrder: number): Partial<NavItem> {
  return {
    name: item.name.trim(),
    url: item.url ?? null,
    src: item.src ?? null,
    type: item.type ?? 'icon',
    backgroundColor: item.backgroundColor ?? null,
    iconText: item.iconText?.trim() ?? null,
    size: item.size ?? null,
    component: item.component ?? null,
    sortOrder,
    originalId: item.id,
  };
}

/**
 * Transform source NavGroup to NavGroup entity structure
 */
function transformNavGroup(
  group: SourceNavGroup,
  sortOrder: number,
): {
  group: Partial<NavGroup>;
  items: Array<Partial<NavItem> & { originalId: string }>;
} {
  const items = group.children.map((child, index) => ({
    ...transformNavItem(child, index),
    originalId: child.id,
  }));

  return {
    group: {
      name: group.name.trim(),
      icon: group.icon ?? null,
      sortOrder,
    },
    items,
  };
}

/**
 * Check if data already exists in the database
 */
async function hasExistingData(groupRepo: Repository<NavGroup>): Promise<boolean> {
  const count = await groupRepo.count();
  return count > 0;
}

/**
 * Check if an item with the given originalId already exists
 */
async function findItemByOriginalId(
  itemRepo: Repository<NavItem>,
  originalId: string,
): Promise<NavItem | null> {
  return itemRepo.findOne({ where: { originalId } });
}

/**
 * Main seed function - imports navigation data idempotently
 */
async function seedNavigation(): Promise<void> {
  console.log('🌱 Starting navigation seed...');

  // Initialize data source
  const ds = await dataSource.initialize();
  const groupRepo = ds.getRepository(NavGroup);

  try {
    // Check if data already exists
    const existingData = await hasExistingData(groupRepo);
    if (existingData) {
      console.log('✅ Database already contains navigation data. Checking for new items...');
    }

    // Load source JSON
    const fs = await import('fs');
    const path = await import('path');
    const jsonPath = path.resolve(__dirname, SOURCE_JSON_PATH);

    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Source JSON file not found at ${jsonPath}`);
    }

    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const sourceData: SourceNavigationData = JSON.parse(jsonData) as SourceNavigationData;

    console.log(`📋 Found ${sourceData.navConfig.length} groups in source JSON`);

    let newGroupsCount = 0;
    let newItemsCount = 0;
    let skippedItemsCount = 0;

    // Use transaction for data integrity
    await ds.transaction(async (manager) => {
      for (let groupIndex = 0; groupIndex < sourceData.navConfig.length; groupIndex++) {
        const sourceGroup = sourceData.navConfig[groupIndex];
        const { group: groupData, items } = transformNavGroup(sourceGroup, groupIndex);

        // For idempotency: check if this group's items already exist by originalId
        const existingItems = await Promise.all(
          items.map((item) =>
            findItemByOriginalId(manager.getRepository(NavItem), item.originalId),
          ),
        );

        const hasExistingGroupItems = existingItems.some((item) => item !== null);

        if (hasExistingGroupItems) {
          // Group already exists, skip
          skippedItemsCount += items.length;
          console.log(
            `  ⏭️  Group "${sourceGroup.name}" already exists, skipping ${items.length} items`,
          );
          continue;
        }

        // Create new group
        const group = manager.create(NavGroup, groupData);
        const savedGroup = await manager.save(group);
        newGroupsCount++;

        // Create items for this group
        for (const itemData of items) {
          const item = manager.create(NavItem, {
            ...itemData,
            groupId: savedGroup.id,
          });
          await manager.save(item);
          newItemsCount++;
        }

        console.log(`  ✅ Created group "${sourceGroup.name}" with ${items.length} items`);
      }
    });

    console.log('\n📊 Seed summary:');
    console.log(`   New groups created: ${newGroupsCount}`);
    console.log(`   New items created: ${newItemsCount}`);
    console.log(`   Items skipped (already exist): ${skippedItemsCount}`);
    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await ds.destroy();
  }
}

// Run the seed function
seedNavigation().catch((error) => {
  console.error('Failed to run seed:', error);
  process.exit(1);
});
