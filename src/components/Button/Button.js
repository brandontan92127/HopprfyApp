/** @format */

import React from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  ActivityIndicator,
  I18nManager
} from "react-native";
import { Color, Images, GlobalStyle, Constants } from "@common";

const Button = props => {
  console.debug("generating button");

  if (props.type === "border") {
    return <BorderButton {...props} />;
  } else if (props.type === "image") {
    return <ImageButton {...props} />;
  } else if (props.type === "text") {
    return <TextButton {...props} />;
  } else if (props.type === "tab") {
    return <TabButton {...props} />;
  } else if (props.type === "tabimage") {
    return <TabImageButton {...props} />;
  } else if (props.type === "reskintabimage") {
    return <ReskinTabImageButton {...props} />;
  } else if (props.type === "standard") {
    return <StandardTabButton {...props} />;
  }

  return <StandardButton {...props} />;
};

Button.propTypes = {
  type: PropTypes.string
};

const TextButton = props => (
  <TouchableOpacity
    disabled={props.disabled || props.isLoading}
    onPress={() => props.onPress()}
    style={[
      styles.button,
      props.style,
      props.inactive && { backgroundColor: "#C6D8E4" }
    ]}
    activeOpacity={0.9}
    underlayColor='#ccc'
  >
    <View style={styles.buttonView}>
      {props.icon && (
        <Image
          source={props.icon}
          defaultSource={props.defaultSource}
          style={[
            styles.imageIcon,
            { tintColor: props.color },
            I18nManager.isRTL && {
              transform: [{ rotate: "180deg" }]
            }
          ]}
        />
      )}
      <Text {...props} style={[styles.text, props.textStyle]}>
        {props.text}
      </Text>
      {props.isLoading && (
        <ActivityIndicator style={styles.loading} color='#FFF' />
      )}
    </View>
  </TouchableOpacity>
);

const BorderButton = props => (
  <TouchableOpacity
    disabled={props.disabled || props.isLoading}
    onPress={() => props.onPress()}
    style={[
      styles.button,
      props.style,
      props.inactive && { backgroundColor: "#C6D8E4" }
    ]}
    activeOpacity={0.9}
    underlayColor='#ccc'
  >
    <View style={styles.buttonView}>
      {props.icon && (
        <Image
          source={props.icon}
          defaultSource={props.defaultSource}
          style={[
            styles.imageIcon,
            { tintColor: props.color },
            I18nManager.isRTL && {
              transform: [{ rotate: "180deg" }]
            }
          ]}
        />
      )}
      <Text {...props} style={[styles.text, props.textStyle]}>
        {props.text}
      </Text>
      {props.isLoading && (
        <ActivityIndicator style={styles.loading} color='#FFF' />
      )}
    </View>
  </TouchableOpacity>
);

const StandardButton = props => (
  <TouchableOpacity
    disabled={props.disabled || props.isLoading}
    onPress={() => props.onPress()}
    style={[
      styles.button,
      props.style,
      props.inactive && { backgroundColor: "#C6D8E4" }
    ]}
    activeOpacity={0.9}
    underlayColor='#ccc'
  >
    <View style={[styles.buttonView, props.buttonView]}>
      {props.icon && (
        <Image
          source={props.icon}
          defaultSource={props.defaultSource}
          style={[
            styles.imageIcon,
            { tintColor: props.color },
            I18nManager.isRTL && {
              transform: [{ rotate: "180deg" }]
            }
          ]}
        />
      )}
      <Text {...props} style={[styles.text, props.textStyle]}>
        {props.text}
      </Text>
      {props.isLoading && (
        <ActivityIndicator style={styles.loading} color='#FFF' />
      )}
    </View>
  </TouchableOpacity>
);

const ImageButton = props => (
  <TouchableOpacity
    disabled={props.disabled}
    onPress={() => props.onPress()}
    activeOpacity={0.8}
    underlayColor='#eeeeee'
    style={props.buttonStyle}
  >
    <Image
      {...props}
      defaultSource={props.defaultSource}
      style={[
        props.imageStyle,
        props.isAddWishList && { tintColor: Color.heartActiveWishList },
        props.isAddToCart && { tintColor: Color.product.TabActive }
      ]}
      resizeMode='contain'
    />
  </TouchableOpacity>
);

const TabButton = props => (
  <TouchableOpacity
    onPress={() => props.onPress()}
    activeOpacity={0.8}
    selected={props.selected}
  >
    <View
      style={[
        styles.tabButton1,
        props.buttonStyle,
        props.selected && styles.tabActive,
        props.lineColor
          ? { borderBottomColor: props.lineColor }
          : { borderBottomColor: GlobalStyle.primaryColorDark.color }
      ]}
    >
      <Text
        style={[
          styles.tabButtonText,
          props.textStyle,
          props.selected && styles.tabActiveText && props.selectedStyle
        ]}
      >
        {props.text}
      </Text>
    </View>
  </TouchableOpacity>
);

const TabImageButton = props => (
  <TouchableOpacity
    onPress={() => props.onPress()}
    activeOpacity={0.8}
    selected={props.selected}
  >
    {/* THIS IS WHERE YOU SET THE LINE COLOR */}
    <View
      style={[
        styles.tabButton,
        props.buttonStyle,
        props.selected && styles.tabActive,
        props.lineColor
          ? { borderBottomColor: props.lineColor }
          : { borderBottomColor: GlobalStyle.primaryColorDark.color }
      ]}
    >
      <View
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Image
          style={{
            maxHeight: 45,
            height: 45,
            width: 45,
            maxWidth: 45
          }}
          defaultSource={props.defaultSource}
          source={props.icon}
          resizeMode='contain'
        />
        <Text style={{ fontSize: 10, textAlign: "center", color: "silver" }}>
          {props.text}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);
const ReskinTabImageButton = props => (
  <TouchableOpacity
    onPress={() => props.onPress()}
    activeOpacity={0.8}
    selected={props.selected}
    style={{
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    {/* THIS IS WHERE YOU SET THE LINE COLOR */}
    <View
      style={[
        styles.tabButton,
        {
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center"
        },
        props.buttonStyle,
        props.selected && {
          marginTop: 1,
          borderBottomWidth: 2
        },
        props.lineColor
          ? { borderBottomColor: props.lineColor }
          : { borderBottomColor: GlobalStyle.primaryColorDark.color }
      ]}
    >
      <View
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {props.selected && (
          <Image
            style={[
              {
                maxHeight: 45,
                height: 45,
                width: 45,
                maxWidth: 45,
                position: "absolute",
                tintColor: "black",
                top: 0
              },
              props.imageStyle
            ]}
            defaultSource={props.defaultSource}
            source={props.icon}
            resizeMode='contain'
          />
        )}
        <Image
          style={[
            {
              maxHeight: 45,
              height: 45,
              width: 45,
              maxWidth: 45,
              opacity: props.selected ? 1 : 0.3
            },
            props.imageStyle
          ]}
          defaultSource={props.defaultSource}
          source={props.icon}
          resizeMode='contain'
        />
        <Text
          style={[
            {
              fontSize: 12,
              textAlign: "center",
              fontFamily: Constants.fontFamilyBold
            },
            props.textStyle
          ]}
        >
          {props.text}
        </Text>
      </View>
    </View>
    {props.selected && (
      <View
        style={{
          marginTop: 2,
          borderBottomColor: GlobalStyle.primaryColorDark.color,
          borderBottomWidth: 2,
          width: "60%",
          zIndex: 999999
        }}
      ></View>
    )}
  </TouchableOpacity>
);
const StandardTabButton = props => (
  <TouchableOpacity
    onPress={() => props.onPress()}
    activeOpacity={0.8}
    selected={props.selected}
    style={{
      flexDirection: "column",
      alignItems: "center"
    }}
  >
    <View
      style={[
        styles.tabButton,
        props.buttonStyle,
        props.selected && {
          marginTop: 1,
          borderBottomWidth: 2
        },
        props.lineColor
          ? { borderBottomColor: props.lineColor }
          : { borderBottomColor: GlobalStyle.primaryColorDark.color }
      ]}
    >
      <Text
        style={[
          {
            fontSize: 12,
            textAlign: "center",
            fontFamily: Constants.fontFamilyBold
          },
          props.textStyle
        ]}
      >
        {props.text}
      </Text>
    </View>
    {props.selected && (
      <View
        style={{
          marginTop: 2,
          borderBottomColor: GlobalStyle.primaryColorDark.color,
          borderBottomWidth: 2,
          width: "60%",
          zIndex: 999999
        }}
      ></View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tabActiveText: {
    color: Color.product.TabActiveText
  },
  tabActive: {
    marginTop: 1,
    borderBottomWidth: 2
  },
  button: {
    backgroundColor: "#0B4A7D",
    justifyContent: "center",
    alignItems: "center"
  },
  buttonView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  imageIcon: {
    resizeMode: "contain",
    width: 20,
    marginRight: 8
  },
  text: {
    color: "white",
    fontSize: 17,
    marginTop: 3,
    fontFamily: Constants.fontFamily
  },
  borderButton: {
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "white"
  },
  tabButton: {
    height: 65,
    justifyContent: "center"
  },
  tabButton1: {
    height: undefined
    // justifyContent: "center"
  },
  tabButtonText: {
    marginLeft: 10,
    fontFamily: Constants.fontFamily,
    marginRight: 10,
    textAlign: "center",
    fontSize: 12
  },
  loading: {
    marginLeft: 5
  }
});

export default Button;
