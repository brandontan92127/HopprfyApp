/** @format */

import React, { PureComponent } from "react";
import {
    View,
    Text,
    Platform,
    TouchableOpacity,
    StyleSheet,
    Image,
    FlatList,
    ImageBackground
} from "react-native";
import {
    List,
    ListItem,
    Divider,
} from "react-native-elements";
import { Color, Config, Styles, Images } from "@common";
import { EventRegister } from "react-native-event-listeners";


export default class NetworkImageList extends PureComponent {
    constructor(props) {
        super(props);

        console.debug("In network image list");
        //cons net ={} = this.props  
    }


    render = () => {

        const { listOfImages, baseImageUrl, ...props } = this.props;

        let netBaseImageUrl = baseImageUrl;
        return this._showNetworkList(listOfImages);
    }

    _renderNetworkImageResultsRow = ({ item }) => {
        //put the url together

        let baseNetImg = Config.NetworkImageBaseUrl;
        let fullImgeUrl = baseNetImg + item.storeLogoUrl
        //render a square row
        return (
            <TouchableOpacity
                style={{
                    backgroundColor: 'transparent',
                    flex: 1 / 3, //here you can use flex:1 also
                    aspectRatio: 1
                }}>
                <View style={{ backgroundColor: 'transparent', flex: 1 }}>
                    <ImageBackground style={{
                        backgroundColor: 'transparent',
                        minHeight: 50,
                        minWidth: 50
                    }}
                        resizeMode='contain'
                        source={{ uri: fullImgeUrl }}></ImageBackground>
                </View>
            </TouchableOpacity>
        )
    }
    

    _showNetworkList = (listOfImages) => {       
        if (typeof listOfImages !== "undefined" & listOfImages.length > 0) {
            return (
                <FlatList
                    style={{ backgroundColor: 'transparent', flexGrow: 1, borderRadius: 30 }}
                    data={listOfImages}
                    renderItem={this._renderNetworkImageResultsRow}
                    keyExtractor={(item) => item.networkId}
                />
            );
        } else {
            return null
        }
    };
}
