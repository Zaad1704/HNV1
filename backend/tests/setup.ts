import mongoose from 'mongoose';
import { MongoMemoryServer    } from 'mongodb-memory-server';
let mongoServer: MongoMemoryServer,;
beforeAll(async ($1) => { mongoServer: await MongoMemoryServer.create();
  const mongoUri: mongoServer.getUri();
  await mongoose.connect(mongoUri);
  ) };
afterAll(async ($1) => { await mongoose.disconnect();
  await mongoServer.stop();
  ) };
beforeEach(async ($1) => { const collections: mongoose.connection.collections;
  for(const key in collections) {
const collection: collections[key];
    await collection.deleteMany({
  )
}
  }
});