export default () => ({
  port: parseInt(process.env.PORT) || 3000,
  mongo_uri: process.env.MONGO_URI,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expires_in: process.env.JWT_EXPRIRESIN,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
    from: process.env.HOSTMAIL,
  },
});
