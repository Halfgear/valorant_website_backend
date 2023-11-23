import * as dotenv from 'dotenv';
import dotenvConfigObject from 'src/utils/dotenvConfigObject';

dotenv.config(dotenvConfigObject);

const password = encodeURIComponent(process.env.MONGO_DB_PASSWORD)

export const mongoRiotConfigUri: string = `mongodb://${process.env.MONGO_DB_USER}:${password}@${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB_NAME}`;
export const mongoMatchConfigUri: string = `mongodb://${process.env.MONGO_DB_USER}:${password}@${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_MATCH_DB_NAME}`;