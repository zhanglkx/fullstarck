import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { NavItem } from './nav-item.entity';

@Entity('nav_groups')
@Index(['sortOrder'])
export class NavGroup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @OneToMany(() => NavItem, (item) => item.group, { cascade: true, eager: true })
  items!: NavItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
