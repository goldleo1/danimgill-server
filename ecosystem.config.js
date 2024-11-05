module.exports = {
  apps: [
    {
      name: "project-dev",
      script: "./src/server.js",
      watch: true,
      autorestart: true,
      ignore_watch: [
        "node_modules",
        "./src/views",
        "./src/public",
        "./uploads",
        "./downloads",
        "*.py",
      ],
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "project-pd",
      script: "./src/server.js",
      watch: false,
      autorestart: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
