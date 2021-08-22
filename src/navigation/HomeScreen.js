/** @format */

import React, {Component} from 'react';
import {Platform} from 'react-native';
import PropTypes from 'prop-types';
import {Color, Styles, Config, GlobalStyle} from '@common';
import {Home} from '@containers';
import {Menu, NavBarLogo, HeaderHomeRight} from './IconNav';
import store from '@store/configureStore';

const getCss = () => {
  return GlobalStyle.primaryColorDark.color;
  try {
    setTimeout(() => {
      let storeState = store.getState();
      let networkPickerData = storeState.categories.networkPickerData;
      let currentlySelectedNetworkGuid =
        storeState.categories.currentlySelectedNetworkGuid;
      let net = networkPickerData.find(
        x => x.id == currentlySelectedNetworkGuid,
      );
      console.debug('');
      return net.networkCssColor;
    }, 1000);
  } catch (error) {
    return GlobalStyle.primaryColorDark.color;
  }
};

export default class HomeScreen extends Component {
  constructor(props) {
    console.debug('In home screen');
    super(props);
    this.cssColor = 'black';
  }

  static navigationOptions = ({navigation}) => ({
    headerTitle: NavBarLogo({navigation}),
    headerLeft: Menu(),
    headerRight: HeaderHomeRight(navigation),

    //updated for color change
    headerTintColor: getCss(),
    headerStyle: {
      backgroundColor: getCss(),
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      zIndex: 1,
      borderBottomWidth: Config.Theme.isDark ? 0 : 1,
      borderBottomColor: 'transparent',
      // borderWidth: 1,
      // borderColor: 'red',
      ...Platform.select({
        ios: {
          height: 32,
        },
        android: {
          height: 46,
          paddingTop: 0,
          marginTop: 0,
        },
      }),
    },
    headerTitleStyle: Styles.Common.headerStyle,
    // headerTintColor: Color.headerTintColor,
    // headerStyle: Styles.Common.toolbar,
    // headerTitleStyle: Styles.Common.headerStyle,

    // use to fix the border bottom
    headerTransparent: true,
  });

  static propTypes = {
    navigation: PropTypes.object.isRequired,
  };

  componentDidMount = () => {
    this.store = store.getState();
  };

  render() {
    const {navigate} = this.props.navigation;
    console.debug('in homescreen');
    return (
      <Home
        navigate={navigate}
        onShowCategoryScreen={item => {
          try {
            this.props.navigation.tabBarVisible = false;
            navigate('CategoryScreen', item);
          } catch (error) {}
        }}
        //this shows the list all for a cat 'show all'
        onShowAll={(config, index) => {
          try {
            console.debug('we clicked ListAllScreen');
            //nees to pass in item / categhory
            navigate('ListAllScreen', {config, index});
          } catch (error) {}
        }}
        //this shows the cats (view 2)
        showCategoriesScreen={() => {
          try {
            console.log('we clicked showCategoriesScreen');
            navigate('CategoriesScreen');
          } catch (error) {}
        }}
        //this shows a proudct
        onViewProductScreen={item => {
          try {
            console.debug('We clicked DetailScreen');
            this.props.navigation.tabBarVisible = false;
            navigate('DetailScreen', item);
          } catch (error) {}
        }}
      />
    );
  }
}
