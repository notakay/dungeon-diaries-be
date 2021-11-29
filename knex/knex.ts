import Knex from 'knex';
import knexfile from '../knexfile';

// TODO: dotenv or config
const env = 'development';

export default Knex(knexfile[env]);
