export default () => ({
  port: parseInt(process.env.PORT) || 3000,
  mongo_uri: process.env.MONGO_URI,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expires_in: process.env.JWT_EXPRIRESIN,
  },
});
