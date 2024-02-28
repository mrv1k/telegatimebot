/* eslint-disable no-undef */
module.exports = {
  apps: [{
    name: 'telegatimebot',
    script: './dist/bot.js',
    watch: './dist',
    instances: 1, // Error: 409: Conflict: terminated by other getUpdates request; make sure that only one bot instance is running
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
};
