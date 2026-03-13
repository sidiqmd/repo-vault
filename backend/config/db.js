import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import log from './logger.js';

let mongoClient;

export async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  log.info('Mongoose connected');

  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  log.info('MongoClient connected');
}

export function getMongoClient() {
  return mongoClient;
}

export function getDb() {
  return mongoClient.db();
}
