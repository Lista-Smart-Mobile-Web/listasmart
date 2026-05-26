'use strict';
// @expo/metro-runtime messageSocket.native.ts uses require() on this ESM module.
// Metro 0.83+ returns { __esModule: true, default: WebSocket } instead of the
// class itself, so `new WebSocket(...)` throws "constructor is not callable".
// This shim unwraps .default so the caller receives the actual constructor.
const mod = require('react-native/Libraries/WebSocket/WebSocket');
module.exports = mod && mod.__esModule ? mod.default : mod;
