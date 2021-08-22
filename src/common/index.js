/** @format */

import _Color from "./Color";

import _Constants from "./Constants";

import _Config from "./Config";

import _Icons from "./Icons";

import _Images from "./Images";

import _Languages from "./Languages";

import _Styles from "./Styles";

import _Tools from "./Tools";

import _Layout from "./Layout";

import _Validator from "./Validator";

import _GlobalStyle from "./GlobalStyle"
//import _Events from "./Events";

export const Color = _Color;
export const Constants = _Constants;
export const Config = _Config;
export const Icons = _Icons;
export const Images = _Images;
export const Languages = _Languages;
export const Styles = _Styles;
export const Tools = _Tools;
export const Layout = _Layout;
export const GlobalStyle = _GlobalStyle;
export const HorizonLayouts = Config.HorizonLayout;
export const Validator = _Validator;
//export const Events = _Events;

import _Device from "./Device";
export const Device = _Device;

import _Theme from "./Theme";
export const Theme = _Theme;

import { withTheme as _withTheme } from "react-native-paper";
export const withTheme = _withTheme;

import { withNavigation as _withNavigation } from "react-navigation";
export const withNavigation = _withNavigation;
