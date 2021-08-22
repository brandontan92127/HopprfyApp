import styles from './style';

import React from 'react';
import {View, Text} from 'react-native';
import MapView, {
  AnimatedRegion,
  PROVIDER_GOOGLE,
  Marker,
} from 'react-native-maps';
import {Images} from '@common';
import FastImage from 'react-native-fast-image';

const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = LATITUDE_DELTA;

const getDefaultState = () => {
  return {
    //GUI ELEMENTS
    warningModalOpen: false,
    driverActiveImage: Images.TrafficLightRed,
    colorOfHeaderBar: 'black',
    headerTextColor: 'silver',
    tabLineColor: 'black',
    flashingOrderMessage: 'None',

    //END
    tracksViewChanges: true,
    initalDriverLocation: {
      lat: 0,
      lng: 0,
      isSet: false,
    },
    orderIsActive: false,
    timeToDelivery: {
      distanceAway: '0',
      timeAway: '0',
      unit: 'K',
    },
    tabIndex: 0,
    orderItemsAsTextArray: [],
    storeAddressText: 'Nowhere',
    destinationAndAddressTextArray: [],
    driverName: 'None',
    storeName: 'None',
    userInfo: null,
    activeDriverOrder: [],
    activeOrderStores: [],
    drivers: [],
    networkImages: [],
    currentRegion: {
      latitude: 51.5407134,
      longitude: -0.1676347,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    },
    //IOS MAP
    coordinate: new AnimatedRegion({
      latitude: 51.5407134,
      longitude: -0.1676347,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }),
  };
};

let marker = 0;

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = getDefaultState();
    this.mapView = null;
  }

  render() {
    return (
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: '#DEE5EE',
            zIndex: 4,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            borderRadius: 50,
            paddingLeft: '2%',
            paddingRight: '2%',
          }}>
          <FastImage
            source={require('../../../../../assets/icons/Delivery.png')}
            style={{
              width: 25,
              height: 25,
            }}
            resizeMode={FastImage.resizeMode.contain}
            tintColor="#3559A2"
          />
          <Text
            style={{
              fontFamily: 'RedHatDisplay-Regular',
              color: '#3559A2',
              fontSize: 13,
            }}
            numberOfLines={2}>
            {this.props.currentPickupAddress == ''
              ? 'No address picked'
              : this.props.currentPickupAddress}
          </Text>
        </View>
        <MapView
          onMapReady={() => {}}
          ref={el => (this._mapView = el)}
          // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          initialRegion={this.state.currentRegion}>
          <Marker.Animated
            zIndex={102}
            tracksViewChanges={this.state.tracksViewChanges}
            ref={el => (this._driverMarker = el)}
            key={`${marker._id}${this.props.driverStatusState}`}
            identifier={marker._id}
            description={'Your current position'}
            title={'Driver: '}
            coordinate={this.state.coordinate}>
            <FastImage
              source={Images.sport_utility_vehicle}
              style={{
                width: 70,
                minHeight: 70,
                height: 70,
              }}
            />
          </Marker.Animated>
        </MapView>
      </View>
    );
  }
}

export default Map;
