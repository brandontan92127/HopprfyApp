/** @format */

import React, { PureComponent } from "react";
import { View, Dimensions } from "react-native";
import css from "./styles";
import { Constants, Config } from "@common";
// import { AdMobBanner, AdMobInterstitial } from 'react-native-admob'

// if (Config.showAdmobAds) {
//   AdMobInterstitial.setAdUnitID(Config.AdMob.unitInterstitial)
// }

export default class Index extends PureComponent {
  //   componentWillUnmount() {
  //     if (Config.showAdmobAds) {
  //       AdMobInterstitial.removeAllListeners()
  //     }
  //   }

  //   componentDidMount() {
  //     Config.AdMob.isShowInterstital && setTimeout(this.showInterstital, 12000)
  //     Config.showAdmobAds &&
  //       AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd())
  //   }

  //   showInterstital = () => {
  //     Config.showAdmobAds &&
  //       AdMobInterstitial.showAd().catch((error) => console.warn(error))
  //   }

  render() {
    return (
      <View style={css.body}>
        {/* <AdMobBanner
          ref={(component) => (this._root = component)}
          bannerSize={'fullBanner'}
          adSize="banner"
          testDeviceIDs={__DEV__ ? ['EMULATOR'] : [Config.AdMob.deviceID]}
          adUnitID={Config.AdMob.unitID}
        /> */}
      </View>
    );
  }
}
