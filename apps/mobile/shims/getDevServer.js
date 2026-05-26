'use strict';
// @expo/metro-runtime uses require() on this ESM-default-exporting module.
// In Metro 0.83+ (SDK 54 / RN 0.81), require() of an `export default` returns
// { __esModule: true, default: fn } — not the function itself — so the call
// site getDevServer() throws "not a function (it is Object)".
// This CJS shim unwraps the default export so require() callers get the function.
const mod = require('react-native/Libraries/Core/Devtools/getDevServer');
module.exports = mod && mod.__esModule ? mod.default : mod;
