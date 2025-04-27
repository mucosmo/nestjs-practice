export default () => ({
  env: process.env.NODE_ENV ?? 'dev',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX,
});
