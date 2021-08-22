import styles from "./styles";
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing
} from "react-native";
import { Constants, GlobalStyle, Images } from "@common";

class RequestsCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      x: new Animated.Value(-(this.width / 100) * 95),
      opacity: new Animated.Value(0.4),
      notificationWidth: new Animated.Value(0),
      notificationHeight: new Animated.Value(0),
      cardState: "close",
      arrowDirection: -1,
      notificationOpacity: 1
    };
  }

  slideIn = () => {
    Animated.parallel([
      Animated.spring(this.state.x, {
        toValue: 0
      }),
      Animated.timing(this.state.notificationWidth, {
        toValue: 20,
        easing: Easing.elastic(2),
        delay: 200
      }),
      Animated.timing(this.state.notificationHeight, {
        toValue: 20,
        easing: Easing.elastic(2),
        delay: 200
      }),
      Animated.timing(this.state.opacity, {
        toValue: 1
      })
    ]).start();
    this.setState({
      cardState: "open",
      arrowDirection: 1
    });
  };

  slideOut = () => {
    Animated.parallel([
      Animated.spring(this.state.x, {
        toValue: -(this.width / 100) * 95
      }),
      Animated.timing(this.state.notificationWidth, {
        toValue: 0,
        duration: 500,
        easing: Easing.elastic(2)
      }),
      Animated.timing(this.state.notificationHeight, {
        toValue: 0,
        duration: 500,
        easing: Easing.elastic(2)
      }),
      Animated.timing(this.state.opacity, {
        toValue: 0.4
      })
    ]).start();
    this.setState({
      cardState: "close",
      arrowDirection: -1
      // notificationOpacity: 0
    });
    console.log(this.props.notifications);
  };

  handleCardState = () => {
    if (this.state.cardState == "open") {
      this.slideOut();
    }
    if (this.state.cardState == "close") {
      this.slideIn();
    }
  };

  componentDidMount() {
    this.slideIn();
  }

  width = Dimensions.get("window").width;

  render() {
    let bgColor = null;
    if (this.props.type == "store") bgColor = "#5e077d";
    else if (this.props.type == "driver") bgColor = "#00b2be";
    else if (this.props.type == "customer") bgColor = "#375BA0";

    return (
      <Animated.View
        style={{
          ...this.props.containerStyle,
          width: "100%",
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
          opacity: this.state.opacity,
          transform: [
            {
              translateX: this.state.x
            }
          ]
        }}
      >
        {this.props.notifications == 0 ? null : (
          <Animated.View
            style={{
              backgroundColor: "#ff6348",
              borderRadius: 50,
              width: this.state.notificationWidth,
              height: this.state.notificationHeight,
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              right: 5,
              top: -3,
              zIndex: 99999,
              opacity: this.state.notificationOpacity,
              ...this.props.notificationStyle
            }}
          >
            <Text style={{ fontFamily: Constants.fontFamily, color: "white" }}>
              {this.props.notifications}
            </Text>
          </Animated.View>
        )}
        <TouchableOpacity
          style={{
            ...styles.container,
            backgroundColor: bgColor
          }}
          onPress={this.props.onPress}
          activeOpacity={0.8}
        >
          <View style={styles.leftContainer}>
            <Image
              source={this.props.image}
              style={{ ...styles.image, ...this.props.imageStyle }}
            />
            <View style={{ marginLeft: 10 }}>
              <Text
                style={{
                  ...styles.textBold,
                  textAlign: "left"
                }}
              >
                {this.props.title}
              </Text>
              <Text
                style={{
                  ...styles.text,
                  textAlign: "left"
                }}
              >
                {this.props.subtitle}
              </Text>
            </View>
          </View>
          <View>
            <Text
              style={{
                ...styles.text,
                textAlign: "right"
              }}
            >
              {this.props.textTitle}
            </Text>
            <Text
              style={{
                ...styles.textBold,
                textAlign: "right"
              }}
            >
              {this.props.text}
            </Text>
          </View>
          <TouchableOpacity style={{minWidth:this.width *0.14 }} onPress={() => this.handleCardState()}>
            <Image
              source={Images.NewAppReskinIcon.Back}
              style={{
                width: 20,
                height: 20,
                tintColor: "white",
                alignSelf:"flex-end",
                transform: [{ scaleX: this.state.arrowDirection }]
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

export default RequestsCard;
