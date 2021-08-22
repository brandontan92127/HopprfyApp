/** @format */

import React, { Component } from "react";
import { View, Dimensions } from "react-native";
import {  WebView } from "react-native-webview";
const { width, height, scale } = Dimensions.get("window");

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      webViewHeight: 600,
    };
  }

  updateHeight(event) {
    this.setState({ webViewHeight: parseInt(event.jsEvaluationValue) });
  }

  render() {
    const getHTML = () => {
      var html = this.props.html;

      return (
        `<html><head><style type="text/css">
				      body {
				        margin: 8;
				        padding: 0;
				        font: 14px arial, sans-serif;
				        background: white;
				        width: ` +
        (width - 16) * scale +
        `
				      }
				      p {
				        width: ` +
        (width - 16) * scale +
        `
				      }
				      a, h1, h2, h3, li {
				        font: 14px arial, sans-serif !important;
				      }
				      img {
				        height: auto;
				        width: ` +
        (width - 16) * scale +
        `
			          }
				</style></head><body>` +
        html +
        "</body>"
      );
    };

    return (
      <View style={{ backgroundColor: "#fff" }}>
        <WebView
          useWebKit={true}
          source={{ html: getHTML() }}
          injectedJavaScript="document.body.scrollHeight;"
          onNavigationStateChange={this.updateHeight.bind(this)}
          style={{
            flex: 0,
            width: (width - 50) * scale,
            height: 900,
          }}
        />
      </View>
    );
  }
}
