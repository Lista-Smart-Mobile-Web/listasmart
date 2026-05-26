const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Watch all workspace packages (packages/shared, etc.) for hot-reload
config.watchFolders = [workspaceRoot]

// Module lookup order: project first, then workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// Fix: @expo/metro-runtime@4.0.1 messageSocket.native.ts uses dynamic require()
// on two ESM default-export modules. Metro 0.83 changed require() of an
// `export default` to return { __esModule, default } instead of the value,
// so both callers fail. These shims unwrap .default before returning.
// The originModulePath guard prevents the shim from re-entering itself.
const GET_DEV_SERVER_SHIM = path.resolve(projectRoot, 'shims/getDevServer.js')
const WEBSOCKET_SHIM = path.resolve(projectRoot, 'shims/WebSocket.js')

config.resolver.resolveRequest = (context, moduleName, _platform) => {
  if (
    moduleName === 'react-native/Libraries/Core/Devtools/getDevServer' &&
    context.originModulePath !== GET_DEV_SERVER_SHIM
  ) {
    return { filePath: GET_DEV_SERVER_SHIM, type: 'sourceFile' }
  }
  if (
    moduleName === 'react-native/Libraries/WebSocket/WebSocket' &&
    context.originModulePath !== WEBSOCKET_SHIM
  ) {
    return { filePath: WEBSOCKET_SHIM, type: 'sourceFile' }
  }
  return context.resolveRequest(context, moduleName, _platform)
}

module.exports = config
