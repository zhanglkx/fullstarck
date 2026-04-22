-- PostgreSQL 初始化脚本
-- 首次启动容器时（数据卷为空）会自动执行此目录下的 *.sql / *.sh 文件
-- 可在此处按需创建 schema、扩展、初始用户等

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
