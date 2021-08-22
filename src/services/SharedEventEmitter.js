import { NativeEventEmitter, NativeModules } from "react-native";
const { NetworkManager } = NativeModules;

var SharedEventEmitter = new NativeEventEmitter(NetworkManager)

export default SharedEventEmitter;