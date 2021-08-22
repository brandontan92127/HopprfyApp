import HopprWorker from "../services/HopprWorker";
import { toast } from "@app/Omni";
import Geocoder from "react-native-geocoder";
import { getDistance } from "geolib";
import {
  Color,
  Config,
} from "@common";


export default class GeoWorker {
  static watchId = "";
  //check geo is working and location provider is enabled
  static getCurrentPosition = (callback) => {
    console.debug("about to get current location");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPosition = JSON.stringify(position);
        this.setState({ currentPosition });
      },
      (error) => alert(error.message),   
    );
  };


  static _calculateDistanceKM = (startlat, startlng, endlat, endlng) => {
    let geoResult = getDistance(
      { latitude: startlat, longitude: startlng },
      { latitude: endlat, longitude: endlng }
    );

    let resultInKm = geoResult / 1000;
    return resultInKm;
  };

  /**Should return same payload as API used to - use in driver and track order views */
  static calculateTimeAndDistanceToDelivery = (startlat, startlng, endlat, endlng) => {
    let distanceInKm = this._calculateDistanceKM(startlat, startlng, endlat, endlng);
    let roughTime = (distanceInKm / Config.TimeAndDistance.avgDriverSpeedKM_H) * 60.00;
    return {
      unit: "k",
      timeAway: roughTime,
      distanceAway: distanceInKm,
      currentAddressText: null
    };
  }

  //LOCATION PUSH TO API
  //GETS TURN ON GEOLOCAITON WATCH THEN PUSHES TO HOPPR
  //WHICH TYPE OF ENTITY IS DEFINED IN THE URL
  // static enableLocationPushToApi = urlToPostLocationTo => {
  //   this.watchId = geolocation.watchPosition(
  //     function(position) {
  //       toast("Got new position!");
  //       console.debug("got new position:" + JSON.stringify(position));
  //       //update redux

  //       //make the call to api
  //     },
  //     error => {
  //       toast("Geolcation failed!!");
  //     },

  //     [options]
  //   );
  // };

  // static disableLocationPushToApi = () => {
  //   console.debug("Clearing watch Id:" + this.watchId);
  //   geolocation.clearWatch(this.watchId);
  // };

  //does NOT use Google!!!
  static geocode = async (locationText) => {
    // Address Geocoding
    console.debug("Geocoding");

    try {
      let res = await Geocoder.geocodeAddress(locationText);
      console.debug("got geo result");
      return res[0];
    } catch (error) {
      console.debug(error);
    }
  };

  static geocodeAllResults = async (locationText) => {
    // Address Geocoding
    console.debug("Geocoding");

    try {
      let res = await Geocoder.geocodeAddress(locationText);
      console.debug("got geo result");
      return res;
    } catch (error) {
      console.debug(error);
    }
  };

  static reverseGeocode = async (lat, long) => {
    console.debug("Reverse Geocoding");

    let coords = {
      lat: lat,
      lng: long,
    };

    try {
      let res = await Geocoder.geocodePosition(coords);
      console.debug("got geo result");
      return res[0];
    } catch (error) {
      console.debug(error);
    }
  };
}
