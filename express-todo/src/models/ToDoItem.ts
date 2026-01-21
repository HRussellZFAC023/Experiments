/**
 * ToDoItem Entity
 * ===============
 *
 * This module defines the data model for the todo application using TypeORM.
 *
 * MVC Pattern - The "M" (Model)
 * -----------------------------
 * In the MVC architecture:
 *  - **Model**: Defines the data structure and business logic (this file).
 *  - **View**: Renders the user interface (EJS templates in `src/views`).
 *  - **Controller**: Handles user input and interactions (Routes in `src/routes`).
 *
 * TypeORM Concepts
 * ----------------
 * 1. **Entity**: A class that maps to a database table. We use the `@Entity()` decorator.
 * 2. **Active Record Pattern**: By extending `BaseEntity`, this class gains static methods
 *    like `.find()`, `.save()`, and `.delete()`. This allows us to perform database
 *    operations directly on the model class or instances, similar to Django's `Model`.
 * 3. **Decorators**: Creating metadata for the database schema:
 *    - `@PrimaryGeneratedColumn()`: Auto-incrementing primary key.
 *    - `@Column()`: Defines a standard table column.
 *    - `@CreateDateColumn()`: Special column that automatically sets the timestamp on creation.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";

@Entity()
export class ToDoItem extends BaseEntity {
  /**
   * The primary key.
   * TypeORM automatically generates unique IDs for us.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The text description of the task.
   * specific length constraint (100 chars) to valid data at the database level.
   */
  @Column({ length: 100 })
  text!: string;

  /**
   * Creation timestamp.
   * The `@CreateDateColumn` decorator ensures this is set automatically
   * when the record is first inserted.
   */
  @CreateDateColumn()
  createdOn!: Date;

  /**
   * Completion status.
   * Defaults to `false` (incomplete) for new tasks.
   */
  @Column({ default: false })
  completed!: boolean;

  /**
   * Returns a string representation of the task.
   * Useful for logging and debugging, similar to `__str__` in Python.
   */
  toString(): string {
    return this.text;
  }
}
