import styles from "./styles";
import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import Modal from "react-native-modalbox";
import { Button as ElButton, Header } from "react-native-elements";
import { Constants, GlobalStyle, Images } from "@common";

class OrdersList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false
    };
  }

  render() {
    let bgColor = null;
    if (this.props.type == "store") bgColor = "#5e077d";
    else if (this.props.type == "driver") bgColor = "#00b2be";
    else if (this.props.type == "customer") bgColor = "blue";
    return (
      <View>
        <TouchableOpacity
          style={{
            ...styles.container,
            backgroundColor: bgColor,
            ...this.props.containerStyle
          }}
          onPress={() =>
            this.setState({
              modalVisible: true
            })
          }
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
        </TouchableOpacity>
        {/* MODAL STARTS HERE */}
        <Modal
          style={{
            backgroundColor: "#fff",
            height: null,
            paddingBottom: 10,
            borderRadius: 20,
            width: "90%"
          }}
          backdrop={true}
          position={"center"}
          isOpen={this.state.modalVisible}
          coverScreen={true}
          onClosed={() => this.setState({ modalVisible: false })}
        >
          <Header
            backgroundColor={GlobalStyle.modalHeader.backgroundColor}
            outerContainerStyles={{
              height: 49,
              borderTopLeftRadius: 19,
              borderTopRightRadius: 19
            }}
            rightComponent={
              <TouchableOpacity
                onPress={() => this.setState({ modalVisible: false })}
                style={{ alignItems: "center", justifyContent: "center" }}
              >
                <Image
                  source={Images.NewAppReskinIcon.Close}
                  style={{
                    width: 25,
                    height: 25,
                    tintColor: "gray"
                  }}
                />
              </TouchableOpacity>
            }
            centerComponent={{
              text: "Payment Queued",
              style: {
                fontSize: 14,
                color: GlobalStyle.modalTextBlackish.color,
                fontFamily: Constants.fontFamilyBlack
              }
            }}
          />
          <View style={styles.content}>
            <ScrollView>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  marginBottom: 15,
                  fontFamily: Constants.fontFamilyBlack,
                  alignSelf: "center",
                  paddingTop: "5%"
                }}
              >
                {"You"}{" "}
                <Text
                  style={{
                    color: "#79879F",
                    fontFamily: Constants.fontFamilyBlack
                  }}
                >
                  {"almost"}
                </Text>{" "}
                {"got paid!"}
              </Text>
              <Text
                style={{
                  fontFamily: Constants.fontFamily,
                  color: GlobalStyle.modalTextBlackish.color,
                  margin: 5,
                  fontSize: 14,
                  textAlign: "center"
                }}
              >
                {
                  "As soon as the customer confirms the order receipt, you'll be paid!"
                }
              </Text>

              <View style={{ overflow: "hidden" }}>
                <Image
                  style={{
                    flex: 1,
                    maxHeight: 200,
                    height: 200,
                    width: undefined
                  }}
                  source={Images.NewAppReskinGraphics.Transaction}
                  resizeMode='contain'
                />
              </View>
              <Text
                style={{
                  fontFamily: Constants.fontFamily,
                  color: GlobalStyle.modalTextBlackish.color,
                  fontSize: 14,
                  marginTop: 8,
                  margin: 20,
                  textAlign: "center"
                }}
              >
                {
                  "Meanwhile we'll get you back up and running to take more orders."
                }
              </Text>
              <ElButton
                buttonStyle={{
                  fontFamily: Constants.fontFamily,
                  padding: 15,
                  margin: 5,
                  marginTop: 10
                }}
                raised
                backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
                borderRadius={50}
                title='OK'
                textStyle={{ fontFamily: Constants.fontFamilyBlack }}
                onPress={() => this.setState({ modalVisible: false })}
              />
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }
}

export default OrdersList;
