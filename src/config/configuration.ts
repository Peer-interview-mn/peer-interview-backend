export default () => ({
  port: parseInt(process.env.PORT) || 3000,
  mongo_uri: process.env.MONGO_URI,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expires_in: process.env.JWT_EXPRIRESIN,
  },
  ref: {
    secret: process.env.REF_SECRET,
    expires_in: process.env.REF_EXPRIRESIN,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
    from: process.env.HOSTMAIL,
  },
  google: {
    id: process.env.GOOGLE_ID,
    secret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
});
