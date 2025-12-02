/**
 * Web shim for react-native-worklets
 *
 * react-native-worklets is a native-only module used by react-native-reanimated.
 * On web, we provide mock implementations since worklets/native threads don't exist.
 */

// Version that satisfies reanimated's version check (0.5.x or 0.6.x)
export const version = "0.6.0"

// Runtime kinds
export const RuntimeKind = {
  UI: "UI",
  WORKLET: "WORKLET",
}

// Feature flags
export function getStaticFeatureFlag() {
  return false
}
export function setDynamicFeatureFlag() {}

// Shareables (deprecated but still used)
export function isShareableRef() {
  return false
}
export function makeShareable(value) {
  return value
}
export function makeShareableCloneOnUIRecursive(value) {
  return value
}
export function makeShareableCloneRecursive(value) {
  return value
}
export const shareableMappingCache = new Map()

// Serializable
export function createSerializable(value) {
  return { current: value }
}
export function isSerializableRef() {
  return false
}
export const serializableMappingCache = new Map()

// Synchronizable
export function isSynchronizable() {
  return false
}
export function createSynchronizable(value) {
  return value
}

// Runtimes
export function getRuntimeKind() {
  return RuntimeKind.UI
}
export function createWorkletRuntime() {
  return {}
}
export function runOnRuntime(runtime, fn) {
  return fn
}
export function scheduleOnRuntime(runtime, fn) {
  fn()
}

// Threads - these run synchronously on web
export function callMicrotasks() {}
export function executeOnUIRuntimeSync(fn) {
  return fn()
}
export function runOnJS(fn) {
  return fn
}
export function runOnUI(fn) {
  return fn
}
export function runOnUIAsync(fn) {
  return Promise.resolve(fn())
}
export function runOnUISync(fn) {
  return fn()
}
export function scheduleOnRN(fn) {
  setTimeout(fn, 0)
}
export function scheduleOnUI(fn) {
  fn()
}
export function unstable_eventLoopTask(fn) {
  fn()
}

// Worklet function
export function isWorkletFunction() {
  return false
}

// WorkletsModule
export const WorkletsModule = {
  version: "0.6.0",
}

export default {
  version: "0.6.0",
}
