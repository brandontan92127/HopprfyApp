import Modal from "react-native-modalbox";
import React, { Component } from "react";
import {
    Image,
    View,
    Animated,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView
} from "react-native";
import { Color, Languages, Styles, Constants, withTheme,GlobalStyle } from "@common";
import {
    Button as ElButton,
    Header,
    Icon,
    Divider
} from "react-native-elements";
import { Images } from "@common";
import { toast } from "../../../Omni";


const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
    // DRIVER CONTROLS
    driverControlsButton: {
        padding: 10
    },
    container: {
        flexGrow: 1,
        backgroundColor: Color.background
    },
    driverControlsModal: {
        // justifyContent: "center",
        // alignItems: "center",
        height: 300,
        backgroundColor: "#fff"
    },
    driverButtonViewContainer: {
        padding: 5
    },
    containerCenteyellow: {
        backgroundColor: Color.background,
        justifyContent: "center"
    },
});

export default class LogisticsCreatorOrderAcceptedModal extends Component {

    render() {

        const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

        this.openClosed = openClosed;
        this.openMe = openMe;
        this.closeMe = closeMe;


        return (
            <Modal
                style={{
                    backgroundColor: "#fff",
                    height: null,
                    paddingBottom: 10,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#36647f",
                    width: width - 14
                }}
                backdrop={true}
                position={"center"}
                coverScreen={false}
                isOpen={this.props.openClosed}
                backdropPressToClose={true}
                swipeToClose={true}
                ref={"logisticsCreatorOrderAcceptedModal"}
                onClosed={() => this.closeMe()}
            >

                <Header
                    backgroundColor={GlobalStyle.modalHeader.backgroundColor}
                    outerContainerStyles={{
                        height: 49,                        
                        borderTopLeftRadius: 19,
                        borderTopRightRadius: 19
                    }}
                    rightComponent={{
                        icon: "close",
                        color: "#fff",
                        onPress: () => this.props.closeMe()
                    }}
                    centerComponent={{
                        text: "Logistics order was accepted",
                        style: { 
                            fontSize:14,
                            color: GlobalStyle.modalTextBlackish.color,
                            fontFamily:Constants.fontHeader,          
                          },
                    }}
                />
                <View>
                    <ScrollView>
                        <Text
                            style={{
                                fontFamily:Constants.fontFamily,
                                color: GlobalStyle.modalTextBlackish.color,
                                margin: 5,
                                fontSize: 30,
                                textAlign: "center"
                            }}
                        >
                            {"The logistics driver accepted your order!"}
                        </Text>

                        <View>
                            <Image
                                style={{
                                    flex: 1,
                                    maxHeight: 165,
                                    height: 165,
                                    width: undefined
                                }}
                                source={Images.NewAppReskinGraphics.PingerDriver}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={{ fontFamily:Constants.fontFamily,
                                    color: GlobalStyle.modalTextBlackish.color,
                                    margin: 8, textAlign: "center" }}>
                            {
                                "Sit back and relax! Your order is being processed now, the Hoppr has accepted the pickup."
                            }
                        </Text>
                        <ElButton
                            buttonStyle={{ fontFamily:Constants.fontFamily, padding: 10, margin: 5, marginTop: 10 }}
                            raised
                            backgroundColor={GlobalStyle.modalPrimaryButton.backgroundColor}
                            borderRadius={20}
                            icon={{ name: "sync" }}
                            title="Thanks"
                            onPress={() => this.props.closeMe()}
                        />
                    </ScrollView>
                </View>
            </Modal>
        );
    }
}
