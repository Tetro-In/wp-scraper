module.exports = {
  apps: [
    {
      name: 'wp-dashboard',
      cwd: './dashboard',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Restart settings
      restart_delay: 3000,
      max_restarts: 10,
      exp_backoff_restart_delay: 100,
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/dashboard-error.log',
      out_file: './logs/dashboard-out.log',
      merge_logs: true,
      // Watch for changes (disable in production)
      watch: false,
    },
  ],
}
