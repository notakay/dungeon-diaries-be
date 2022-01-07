import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTable('upload_intents');
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.createTable('upload_intents', (table) => {
    table.string('session_id', 1000).primary();
    table.string('object_key', 1000).notNullable();
  });
}
