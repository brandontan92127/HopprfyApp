/**
 * Created by InspireUI on 17/02/2017.
 *
 * @format
 */
import reactotron from 'reactotron-react-native';
import {PixelRatio} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import store from '@store/configureStore';
import _EventEmitter from 'EventEmitter';
import _ from 'lodash';
import _currencyFormatter from 'currency-formatter';
import {Images, Constants, Config} from '@common';
import _Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import _IconIO from 'react-native-vector-icons/Ionicons';
import _Timer from 'react-timer-mixin';
import _Validate from './ultils/Validate';
import _BlockTimer from './ultils/BlockTimer';
import _FacebookAPI from './services/FacebookAPI';

// const { actions: SideMenuActions } = require('@redux/SideMenuRedux')

export const Icon = _Icon;
export const IconIO = _IconIO;
export const EventEmitter = new _EventEmitter();
export const Timer = _Timer;
export const Validate = _Validate;
export const BlockTimer = _BlockTimer;
export const FacebookAPI = _FacebookAPI;
export const Reactotron = reactotron;

const TOASTS_ENABLED = Config.ToastsEnabled;

const _log = values => __DEV__ && reactotron.log(values);
const _warn = values => __DEV__ && reactotron.warn(values);
const _error = values => __DEV__ && reactotron.error(values);
export function connectConsoleToReactotron() {
  // console.debug = _log;
  // console.warn = _warn;
  // console.debug = _error;
}
export const log = _log;
export const warn = _warn;
export const error = _error;

/**
 * An async fetch with error catch
 * @param url
 * @param data
 * @returns {Promise.<*>}
 */
export const request = async (url, data = {}) => {
  try {
    const response = await fetch(url, data);

    return await response.json();
  } catch (err) {
    error(err);
    return {error: err};
  }
};

// Drawer
export const openDrawer = () =>
  // EventEmitter.emit(Constants.EmitCode.SideMenuOpen)
  store.dispatch({
    type: Constants.EmitCode.SideMenuOpen,
  });
export const closeDrawer = () =>
  // EventEmitter.emit(Constants.EmitCode.SideMenuClose)
  store.dispatch({
    type: Constants.EmitCode.SideMenuClose,
  });
export const toggleDrawer = () =>
  // EventEmitter.emit(Constants.EmitCode.SideMenuClose)
  store.dispatch({
    type: Constants.EmitCode.SideMenuToggle,
  });

/**
 * Display the message toast-like (work both with Android and iOS)
 * @param msg Message to display
 * @param duration Display duration
 */
export const toast = (msg, duration = 4000) => {
  if (TOASTS_ENABLED) {
    EventEmitter.emit(Constants.EmitCode.Toast, msg, duration);
  }
};

export const currencyFormatter = _.bind(
  _currencyFormatter.format,
  undefined,
  _,
  Config.DefaultCurrency,
);

export const getProductImage = (uri, containerWidth) => {
  // Enhance number if you want to fetch a better quality image (may affect performance
  const DPI_NUMBER = 0.5; // change this to 1 for high quality image

  console.debug('in get product image with URI:' + uri);
  if (!Config.ProductSize.enable) {
    return uri;
  }

  if (typeof uri !== 'string') {
    return Images.PlaceHolderURL;
  }

  // parse uri into parts
  const index = uri.lastIndexOf('.');
  let editedURI = uri.slice(0, index);
  const defaultType = uri.slice(index);

  const SMALL = Config.ProductSize.ProductThumbnails;
  const MEDIUM = Config.ProductSize.CatalogImages;
  const LARGE = Config.ProductSize.SingleProductImage;

  const pixelWidth = PixelRatio.getPixelSizeForLayoutSize(containerWidth);

  switch (true) {
    case pixelWidth * DPI_NUMBER < SMALL.width:
      editedURI = `${editedURI}-${SMALL.width}x${SMALL.height}${defaultType}`;
      break;
    case pixelWidth * DPI_NUMBER < MEDIUM.width:
      editedURI = `${editedURI}-${MEDIUM.width}x${MEDIUM.height}${defaultType}`;
      break;
    case pixelWidth * DPI_NUMBER < LARGE.width:
      editedURI = `${editedURI}-${LARGE.width}x${LARGE.height}${defaultType}`;
      break;
    default:
      editedURI += defaultType;
  }

  return editedURI;
};

export const getNotification = async () => {
  try {
    const notification = await AsyncStorage.getItem('@notification');
    return JSON.parse(notification);
  } catch (error) {
    console.debug(error);
  }
};
