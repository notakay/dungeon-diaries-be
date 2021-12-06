import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('comments', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table
      .integer('post_id')
      .references('id')
      .inTable('posts')
      .onDelete('SET NULL');
    table.integer('parent_id').defaultTo(null);
    table.string('content', 1000).notNullable();
    table.integer('depth').defaultTo(0);
    table.string('lineage', 1000).defaultTo('/');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('comments');
}
