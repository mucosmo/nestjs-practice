module.exports = {
  apps: [
    {
      name: 'nestjs-practice',
      namespace: 'api',
      script: 'dist/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'prod',
      },
    },
  ],
};
