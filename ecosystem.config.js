module.exports = {
  apps: [{
    script: 'server.js',
    watch: true,
    ignore_watch: ['uploads'],
    env: {
      PORT: 8080,
      NODE_ENV: "local",
      DB_USERNAME:"codemaddy47",
      DB_PASSWORD:"codemaddy47",
      DB_HOST:"cluster0.nvdqygb.mongodb.net",
      DB_NAME:"chatapplication",
      // dbUrl: "mongodb+srv://codemaddy47:codemaddy47@cluster0.nvdqygb.mongodb.net/imageupload_s3"
    }
  }],
};
