module.exports = {
  apps: [
    {
      name: "sims-hms",
      script: "backend/dist/src/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      max_memory_restart: "500M",
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
