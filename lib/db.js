import mongoose from 'mongoose';

let cached = globalThis.mongooseConnection;

if (!cached) {
  cached = globalThis.mongooseConnection = { connection: null, promise: null };
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured. Add it to .env.local.');

  if (cached.connection && mongoose.connection.readyState === 1) {
    return cached.connection;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      cached.connection = mongooseInstance;
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.connection = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.connection;
}
