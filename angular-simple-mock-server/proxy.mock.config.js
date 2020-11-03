const proxiesConfig = [
  {
    context: [
      "/example"
    ],
    target: "http://localhost:3000",
    secure: false,
    rejectUnhauthorized: false,
    logLevel: "debug"
  },
];

module.exports = proxiesConfig;
