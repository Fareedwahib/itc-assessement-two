import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('urls')
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  shortCode: string;

  @Column({ type: 'text' })
  originalUrl: string;

  @Column({ default: 0 })
  visitCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
