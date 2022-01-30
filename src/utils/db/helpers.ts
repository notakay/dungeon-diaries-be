import knex from '../../config/knex';

export const existsInTable: (
  table: string,
  column: string,
  value: string
) => Promise<boolean> = async (table, column, value) => {
  return knex(table)
    .select('id')
    .where(column, value)
    .first()
    .then((record) => {
      if (!record) return false;
      return true;
    });
};
