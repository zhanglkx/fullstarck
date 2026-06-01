-- Navigation 模块表结构（与 TypeORM migration CreateNavTables1735680000000 等价）
-- 后端 synchronize=false，依赖 migration 建表。生产容器仅含 dist 无法跑 ts-node migration，
-- 故在此提供幂等 SQL：
--   1) 首次启动容器（数据卷为空）时由 /docker-entrypoint-initdb.d 自动执行；
--   2) 对已存在的库可手动执行：docker exec -i fullstack-postgres psql -U postgres -d fullstack < 02-nav-schema.sql
-- 全部使用 IF NOT EXISTS，可重复执行。

-- nav_groups
CREATE TABLE IF NOT EXISTS nav_groups (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        varchar(100) NOT NULL,
  icon        varchar(50),
  "sortOrder" int NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- nav_items
CREATE TABLE IF NOT EXISTS nav_items (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              varchar(100) NOT NULL,
  url               varchar(500),
  src               varchar(500),
  type              varchar(20) NOT NULL DEFAULT 'icon',
  "backgroundColor" varchar(20),
  "iconText"        varchar(50),
  size              varchar(10),
  component         varchar(100),
  "sortOrder"       int NOT NULL DEFAULT 0,
  "originalId"      varchar(100),
  "groupId"         uuid NOT NULL,
  "createdAt"       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS "IDX_nav_groups_sortOrder" ON nav_groups ("sortOrder");
CREATE INDEX IF NOT EXISTS "IDX_nav_items_sortOrder" ON nav_items ("sortOrder");

-- 外键（nav_items.groupId → nav_groups.id，级联删除）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'FK_nav_items_groupId' AND table_name = 'nav_items'
  ) THEN
    ALTER TABLE nav_items
      ADD CONSTRAINT "FK_nav_items_groupId"
      FOREIGN KEY ("groupId") REFERENCES nav_groups (id) ON DELETE CASCADE;
  END IF;
END $$;
