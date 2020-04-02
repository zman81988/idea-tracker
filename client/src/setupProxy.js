const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(
    ["/api", "/oauth"],
    createProxyMiddleware({
      target: "http://web_service:8080",
      changeOrigin: true
    })
  ),
    app.use(
      "/webhook",
      createProxyMiddleware({
        target: "http://hubspot_service:8080",
        changeOrigin: true
      })
    );
  // app.use(
  //   "/oauth",
  //   createProxyMiddleware({
  //     target: "http://hubspot_service:8080",
  //     changeOrigin: true
  //   })
  // );
};
