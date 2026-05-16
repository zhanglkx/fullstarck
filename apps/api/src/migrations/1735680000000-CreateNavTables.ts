import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateNavTables1735680000000 implements MigrationInterface {
  name = 'CreateNavTables1735680000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create nav_groups table
    await queryRunner.createTable(
      new Table({
        name: 'nav_groups',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'sortOrder',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create nav_items table
    await queryRunner.createTable(
      new Table({
        name: 'nav_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'src',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['icon', 'text', 'component'],
            default: "'icon'",
          },
          {
            name: 'backgroundColor',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'iconText',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'size',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'component',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'sortOrder',
            type: 'int',
            default: 0,
          },
          {
            name: 'originalId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'groupId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add index on nav_groups.sortOrder
    await queryRunner.createIndex(
      'nav_groups',
      new TableIndex({
        name: 'IDX_nav_groups_sortOrder',
        columnNames: ['sortOrder'],
      }),
    );

    // Add index on nav_items.sortOrder
    await queryRunner.createIndex(
      'nav_items',
      new TableIndex({
        name: 'IDX_nav_items_sortOrder',
        columnNames: ['sortOrder'],
      }),
    );

    // Add foreign key from nav_items to nav_groups with CASCADE delete
    await queryRunner.createForeignKey(
      'nav_items',
      new TableForeignKey({
        name: 'FK_nav_items_groupId',
        columnNames: ['groupId'],
        referencedTableName: 'nav_groups',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.dropForeignKey('nav_items', 'FK_nav_items_groupId');

    // Drop indexes
    await queryRunner.dropIndex('nav_items', 'IDX_nav_items_sortOrder');
    await queryRunner.dropIndex('nav_groups', 'IDX_nav_groups_sortOrder');

    // Drop tables
    await queryRunner.dropTable('nav_items');
    await queryRunner.dropTable('nav_groups');
  }
}
