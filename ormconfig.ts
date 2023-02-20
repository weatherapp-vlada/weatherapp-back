import { DataSource, DataSourceOptions } from 'typeorm';

import { dataSourceOptions } from './src/config/db.config';

export default new DataSource(dataSourceOptions as DataSourceOptions);
