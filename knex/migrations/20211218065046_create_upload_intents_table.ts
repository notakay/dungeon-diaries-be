import { Knex } from 'knex';

// using a table for the time being
// will move onto a cache based solution later
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('upload_intents', (table) => {
    table.string('session_id', 1000).primary();
    table.string('object_key', 1000).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('upload_intents');
}
