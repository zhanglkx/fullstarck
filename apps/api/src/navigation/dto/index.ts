export * from './create-nav-group.dto';
export * from './update-nav-group.dto';
export * from './reorder-groups.dto';
export * from './create-nav-item.dto';
export * from './update-nav-item.dto';
export * from './reorder-items.dto';
export * from './move-item.dto';
export * from './merge-items.dto';
export * from './import-navigation.dto';

// Re-export response types for convenience
export type NavGroupResponse = import('../entities/nav-group.entity').NavGroup;
export type NavItemResponse = import('../entities/nav-item.entity').NavItem;
