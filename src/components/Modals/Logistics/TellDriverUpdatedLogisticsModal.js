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
    ScrollView,
    Dimensions
} from "react-native";
import { Color, Languages, Styles, Constants, withTheme, GlobalStyle } from "@common";
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

export default class TellDriverUpdatedLogisticsModal extends React.PureComponent {
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
                    borderColor: GlobalStyle.primaryColorDark.color,
                    width: width - 16
                }}
                backdrop={true}
                backdropPressToClose={true}
                swipeToClose={true}
                position={"center"}
                ref={"tellDriverUpdatedLogisticsModal"}
                isOpen={this.props.openClosed}
                onClosed={()=>this.closeMe()}
            >
                <Header
                    backgroundColor={GlobalStyle.primaryColorDark.color}
                    outerContainerStyles={{ height: 49, 
                         borderTopLeftRadius: 19,
                        borderTopRightRadius: 19 }}
                    rightComponent={{
                        icon: "close",
                        color: "#fff",
                        onPress: () => this.props.closeMe()
                    }}
                    centerComponent={{
                        text: "Updated Logistics",
                        style: { color: "#fff" }
                    }}
                />
                <View>
                    <ScrollView>
                        <Text
                            style={{
                                color: "black",
                                margin: 5,
                                fontSize: 30,
                                textAlign: "center"
                            }}
                        >
                            {"Your logistics itinerary was updated!"}
                        </Text>

                        <View>
                            <Image
                                style={{
                                    flex: 1,
                                    maxHeight: 165,
                                    height: 165,
                                    width: undefined
                                }}
                                source={Images.HopprLogoPlaceholder}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={{ color: "black", margin: 8, textAlign: "center" }}>
                            {
                                "Somebody added a new order or destination to your current (in play) order.. remember to pick up the extra items when you get to the store!"
                            }
                        </Text>
                        <Text style={{ color: "black", margin: 8, textAlign: "center" }}>
                            {"It was auto-assigned because it was near to your current destination"}
                        </Text>
                        <Divider style={{ backgroundColor: GlobalStyle.primaryColorDark.color }} />
                        <ElButton
                            buttonStyle={{ padding: 10, margin: 5, marginTop: 10 }}
                            raised
                            backgroundColor={GlobalStyle.primaryColorDark.color}
                            borderRadius={20}
                            icon={{ name: "sync" }}
                            title="Ok"
                            onPress={() => this.props.closeMe()}
                        />
                    </ScrollView>
                </View>
            </Modal>
        );
    }
}


