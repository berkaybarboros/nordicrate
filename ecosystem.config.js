module.exports = {
  apps: [
    {
      name: 'nordicrate',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/nordicrate',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_BASE_URL: 'https://nordicrate.berkaybarboros.com',
      },
    },
  ],
};
