import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('posts', (table) => {
    table.string('image', 1000);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('posts', (table) => {
    table.dropColumn('image');
  });
}
