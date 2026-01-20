import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";

@Entity()
export class ToDoItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  text!: string;

  @CreateDateColumn()
  createdOn!: Date;

  @Column({ default: false })
  completed!: boolean;

  toString(): string {
    return this.text;
  }
}
