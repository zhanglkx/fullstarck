import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { NavGroup } from './nav-group.entity';

@Entity('nav_items')
@Index(['sortOrder'])
export class NavItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  src!: string | null;

  @Column({
    type: 'enum',
    enum: ['icon', 'text', 'component'],
    default: 'icon',
  })
  type!: 'icon' | 'text' | 'component';

  @Column({ type: 'varchar', length: 20, nullable: true })
  backgroundColor!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  iconText!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  size!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  component!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  originalId!: string | null;

  @ManyToOne(() => NavGroup, (group) => group.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group!: NavGroup;

  @Column({ type: 'uuid' })
  groupId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
