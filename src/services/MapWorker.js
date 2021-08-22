import HopprWorker from "../services/HopprWorker";
import GeoWorker from "../services/GeoWorker";
import { PermissionsAndroid, Platform, Permis } from "react-native";
import { toast } from "@app/Omni";
import { AnimatedRegion } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import Config from "@common";

export default class MapWorker {
  //check geo is working and location provider is enabled


  /**retuns an image based on vehicle type - mapped to VehicleType in the api (in driver and network) */
  static getDriverMapIconImageBasedOnVehicleType = (vehicleType) => {
    try {
      switch (vehicleType) {
        case "":
          break;
        case "":
          break;
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  static getAnimatedRegionFromLatLong(lat, long) {
    return new AnimatedRegion({
      latitude: lat,
      longitude: long,
    });
  }

  static getRegionFromScreenAndLocation(screen, lat, long, longDelta) {
    const ASPECT_RATIO = screen.width / screen.height;
    const LATITUDE = lat;
    const LONGITUDE = long;
    const LATITUDE_DELTA = 0.0922;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

    return {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };
  }

  /**Permissions need to be enabled for this to work!! */
  static getLocationOnce = async () => {
    //TEST CODE
    console.debug("In getlocationOnce in Mapworker");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        //success
        let newPOs = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        console.debug(
          "In getlocationOnce in Mapworker - got location successfully!!"
        );
        return newPOs;
      },
      (error) => {
        console.debug("Error getting location:" + JSON.stringify(error));
      },     
    );
    //END TEST
  };

  static requestLocationPermission = async () => {
    if (Platform.OS === "ios") {
    Geolocation.requestAuthorization();
      return true;
    } else {
      try {
        console.debug("stop");
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Hopprfy",
            message: "Hopprfy" + " access to your location ",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.debug("You can use the location");
          return true;
          //toast("Locaiton permissions enabled");
        } else {
          console.debug("location permission denied");
          return false;
          //   toast("Location permission denied");
        }
      } catch (err) {
        alert("There was an error getting location permissions!");
      }
    }
  };

  //pass in a map, we will add a Marker to it
  static addMarkerToMarker = (mapToAddMarkerTo) => {
    console.debug("about to add marker to map");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPosition = JSON.stringify(position);
        this.setState({ currentPosition });
      },
      (error) => alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };
}
