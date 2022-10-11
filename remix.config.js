/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  serverDependenciesToBundle: [
    'react-dnd',
    'react-dnd-touch-backend',
    'dnd-core',
    '@react-dnd/invariant',
    '@react-dnd/shallowequal',
    '@react-dnd/asap',
  ]
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
}
