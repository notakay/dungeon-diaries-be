import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('post_votes', (table) => {
    table.unique(['user_id', 'post_id']);
    table.integer('user_id').references('id').inTable('users');
    table.integer('post_id').references('id').inTable('posts');
    table.integer('vote').defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('post_votes');
}
