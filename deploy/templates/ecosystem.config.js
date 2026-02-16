module.exports = {
  apps: [
    {
      name: "myapp",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        NEXT_PUBLIC_API_URL: "https://example.com"
      }
    }
  ]
};
