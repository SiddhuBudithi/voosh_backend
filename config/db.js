import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.MYSQL_URI, { logging: false });
export default sequelize;
