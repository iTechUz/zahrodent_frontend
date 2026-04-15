module.exports = {
  apps: [
    {
      name: 'e-commerse',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1, // `max` qilsangiz barcha CPU core'laridan foydalanadi (cluster mode) 
      exec_mode: 'fork', // cluster mode uchun `cluster` ga o'zgartiring
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3002 // dev scriptda pm 3002 ko'rsatilgan, shuning uchun default 3002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002, // Production uchun portni shu yerda o'zgartirishingiz mumkin
      }
    }
  ]
};
