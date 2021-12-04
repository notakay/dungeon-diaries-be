import Knex from 'knex';
import knexfile from '../knexfile';
import config from '../config';

// @ts-ignore
export default Knex(knexfile[config['environment']]);
