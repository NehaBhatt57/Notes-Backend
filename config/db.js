// const mongoose = require('mongoose');

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// const connectDB = async () => {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(process.env.MONGO_URI, {
//       bufferCommands: false,
//       // Add any other options your MongoDB version requires
//     }).then(mongoose => {
//       console.log('MongoDB connected');
//       return mongoose.connection;
//     });
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// };

// module.exports = connectDB;





// // const mongoose = require('mongoose');

// // const connectDB = async () => {
// //   try {
// //     await mongoose.connect(process.env.MONGO_URI);
// //     console.log('MongoDB connected');
// //   } catch (err) {
// //     console.error(err);
// //     process.exit(1);
// //   }
// // };

// // module.exports = connectDB;
