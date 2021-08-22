/** @format */

import React from 'react';
import {Color, Images, Config, GlobalStyle} from '@common';
import {TabBar, TabBarIcon} from '@components';
import {
  View,
  Dimensions,
  I18nManager,
  Platform,
  StyleSheet,
  Animated,
} from 'react-native';
import {
  createStackNavigator,
  createBottomTabNavigator,
  NavigationActions,
  createAppContainer,
} from 'react-navigation';
import {TabViewPagerPan} from 'react-native-tab-view';
import HomeScreen from './HomeScreen';
import NewsScreen from './NewsScreen';
import NewsDetailScreen from './NewsDetailScreen';
import CategoriesScreen from './CategoriesScreen';
import CategoryScreen from './CategoryScreen';
import DetailScreen from './DetailScreen';
import CartScreen from './CartScreen';
import MyOrdersScreen from './MyOrdersScreen';
import WishListScreen from './WishListScreen';
import SearchScreen from './SearchScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import CustomPageScreen from './CustomPageScreen';
import ListAllScreen from './ListAllScreen';
import SettingScreen from './SettingScreen';
import UserProfileScreen from './UserProfileScreen';
import FiltersScreen from './FiltersScreen';
import AddressScreen from './AddressScreen';
import AddAddressScreen from './AddAddressScreen';

import TransitionConfig from './TransitionConfig';
import TradingScreen from './TradingScreen';

import TrackOrderScreen from './TrackOrderScreen';
import StoreHomeScreen from './StoreHomeScreen';
import DriverHomeScreen from './DriverHomeScreen';
import ProductStockScreen from './ProductStockScreen';
import ProductStockProductDrillDownScreen from './ProductStockProductDrillDownScreen';
import BarcodeScannerScreen from './BarcodeScannerScreen';
import PaymentsHomeScreen from './PaymentsHomeScreen';
import PermissionsHomeScreen from './PermissionsHomeScreen';

import RegisterAsDriverScreen from './RegisterAsDriverScreen';
import RegisterAsStoreScreen from './RegisterAsStoreScreen';
import RegisterAsCustomerScreen from './RegisterAsCustomerScreen';

import NetworkSplitsHomeScreen from './NetworkSplitsHomeScreen';
import RegisterNetworkScreen from './RegisterNetworkScreen';
import BIMapScreen from './BIMapScreen';
import NetworksHomeScreen from './NetworksHomeScreen';
import ProductClassMutexScreen from './ProductClassMutexScreen';
import ProductClassCreateAndEditScreen from './ProductClassCreateAndEditScreen';
import ProductCreateAndEditScreen from './ProductCreateAndEditScreen';
import ProductMutexScreen from './ProductMutexScreen';
import ProductClassListingOrderSortScreen from './ProductClassListingOrderSortScreen';
import OrderLogisticsHomeScreen from './OrderLogisticsHomeScreen';
import OrderLogisticsCreateScreen from './OrderLogisticsCreateScreen';
import FinishOrderScreen from './FinishOrderScreen';
import ShopifyCreateIntegrationScreen from './ShopifyCreateIntegrationScreen';
import {
  reduxifyNavigator,
  createReactNavigationReduxMiddleware,
  createNavigationReducer,
} from 'react-navigation-redux-helpers';
import StoreHelper from '../helper/StoreHelper';

const {width} = Dimensions.get('window');

const NewsStack = createStackNavigator(
  {
    News: {screen: NewsScreen},
    NewsDetailScreen: {screen: NewsDetailScreen},
  },
  {
    navigationOptions: {
      header: null,
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const TestStack = createStackNavigator(
  {
    News: {screen: NewsScreen},
    NewsDetailScreen: {screen: NewsDetailScreen},
  },
  {
    navigationOptions: {
      header: null,
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const CategoryStack = createStackNavigator(
  {
    CategoriesScreen: {screen: CategoriesScreen},
    CategoryScreen: {screen: CategoryScreen},
    DetailScreen: {
      screen: DetailScreen,
      navigationOptions: {tabBarVisible: false},
    },
  },
  {
    navigationOptions: {
      header: null,
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const CategoryDetailStack = createStackNavigator(
  {
    CategoryScreen: {screen: CategoryScreen},
    DetailScreen: {
      screen: DetailScreen,
      navigationOptions: {tabBarVisible: false},
    },
  },
  {
    navigationOptions: {
      header: null,
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const WishListStack = createStackNavigator(
  {
    WishListScreen: {screen: WishListScreen},
    Detail: {screen: DetailScreen},
  },
  {
    navigationOptions: {
      header: null,
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const PermissionsHomeStack = createStackNavigator(
  {
    PermissionsHomeScreen: {screen: PermissionsHomeScreen},
  },
  {
    navigationOptions: {
      header: null,
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const NetworksHomeStack = createStackNavigator(
  {
    NetworksHomeScreen: {screen: NetworksHomeScreen},
    ProductClassMutexScreen: {screen: ProductClassMutexScreen},
    ProductClassCreateAndEditScreen: {
      screen: ProductClassCreateAndEditScreen,
    },
    ProductMutexScreen: {screen: ProductMutexScreen},
    ProductCreateAndEditScreen: {
      screen: ProductCreateAndEditScreen,
    },
    ProductClassListingOrderSortScreen: {
      screen: ProductClassListingOrderSortScreen,
    },
    NetworkSplitsHomeScreen: {screen: NetworkSplitsHomeScreen},
  },
  {
    navigationOptions: {
      header: null, //this will hide the header
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const RegisterNetworkStack = createStackNavigator(
  {
    RegisterNetworkScreen: {screen: RegisterNetworkScreen},
  },
  {
    navigationOptions: {
      header: null,
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const OrderLogisticsStack = createStackNavigator(
  {
    OrderLogisticsHomeScreen: {screen: OrderLogisticsHomeScreen},
  },
  {
    navigationOptions: {
      header: null,
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const TrackOrderStack = createStackNavigator(
  {
    TrackOrderScreen: {screen: TrackOrderScreen},
  },
  {
    navigationOptions: {
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const PaymentsHomeScreenStack = createStackNavigator(
  {
    PaymentsHomeScreen: {screen: PaymentsHomeScreen},
  },
  {
    navigationOptions: {
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const BIMapScreenStack = createStackNavigator(
  {
    BIMapScreen: {screen: BIMapScreen},
  },
  {
    navigationOptions: {
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const DriverHomeScreenStack = createStackNavigator(
  {
    DriverHomeScreen: {screen: DriverHomeScreen},
  },
  {
    navigationOptions: {
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const StoreHomeScreenStack = createStackNavigator(
  {
    StoreHomeScreen: {screen: StoreHomeScreen},
    ProductStockScreen: {screen: ProductStockScreen},
    ProductStockProductDrillDownScreen: {
      screen: ProductStockProductDrillDownScreen,
    },
    BarcodeScannerScreen: {screen: BarcodeScannerScreen},
  },
  {
    navigationOptions: {
      header: null,
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const SearchStack = createStackNavigator(
  {
    Search: {screen: SearchScreen},
    DetailScreen: {screen: DetailScreen},
    FiltersScreen: {screen: FiltersScreen},
  },
  {
    navigationOptions: {
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const HomeStack = createStackNavigator(
  {
    Home: {screen: HomeScreen},
    //Home: { screen: TradingScreen },
    ListAllScreen: {screen: ListAllScreen},
    DetailScreen: {screen: DetailScreen},
  },
  {
    navigationOptions: {
      gestureResponseDistance: {horizontal: width / 2},
      gesturesEnabled: true,
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const CartScreenStack = createStackNavigator(
  {
    Cart: {screen: CartScreen},
    Detail: {screen: DetailScreen},
    OrderLogisticsCreateScreen: {screen: OrderLogisticsCreateScreen},
    FinishOrderScreen: {screen: FinishOrderScreen},
  },
  {
    navigationOptions: {
      header: null,
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const UserProfileStack = createStackNavigator(
  {
    UserProfile: {screen: UserProfileScreen},
    ShopifyCreateIntegration: {screen: ShopifyCreateIntegrationScreen},
    Address: {screen: AddressScreen},
    AddAddress: {screen: AddAddressScreen},
    SettingScreen: {screen: SettingScreen},
    ProductStockScreen: {screen: ProductStockScreen},
    ProductStockProductDrillDownScreen: {
      screen: ProductStockProductDrillDownScreen,
    },
    MyOrders: {screen: MyOrdersScreen},
    RegisterAsDriverScreen: {screen: RegisterAsDriverScreen},
    RegisterAsStoreScreen: {screen: RegisterAsStoreScreen},
    PermissionsHomeScreen: {screen: PermissionsHomeStack},
    RegisterNetworkScreen: {screen: RegisterNetworkStack},
    NetworksHomeScreen: {screen: NetworksHomeStack},
    OrderLogisticsCreateUserProfileScreen: {
      screen: OrderLogisticsCreateScreen,
    },
    NetworkSplitsHomeScreen: {screen: NetworkSplitsHomeScreen},
    PaymentsHomeScreen: {screen: PaymentsHomeScreen},
    BIMapScreen: {screen: BIMapScreen},

    ProductClassMutexScreen: {screen: ProductClassMutexScreen},
    ProductClassCreateAndEditScreen: {
      screen: ProductClassCreateAndEditScreen,
    },
    ProductMutexScreen: {screen: ProductMutexScreen},
    ProductCreateAndEditScreen: {
      screen: ProductCreateAndEditScreen,
    },
    ProductClassListingOrderSortScreen: {
      screen: ProductClassListingOrderSortScreen,
    },
    DriverHomeScreen: {screen: DriverHomeScreen},
    StoreHomeScreen: { screen: StoreHomeScreen },
    //StoreHomeScreen: {screen: TradingScreen},
    ProductStockScreen: {screen: ProductStockScreen},
    ProductStockProductDrillDownScreen: {
      screen: ProductStockProductDrillDownScreen,
    },
    BarcodeScannerScreen: {screen: BarcodeScannerScreen},
    TradingScreen: {screen: TradingScreen},
  },
  {
    navigationOptions: {
      header: null,
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

const LoginStack = createStackNavigator(
  {
    LoginScreen: {screen: LoginScreen},
    SignUpScreen: {screen: SignUpScreen},
    RegisterAsCustomerScreen: {screen: RegisterAsCustomerScreen},
  },
  {
    mode: 'modal',
    header: null,
    transitionConfig: () => TransitionConfig,
  },
);

const AppNavigator = createBottomTabNavigator(
  {
    Default: {
      screen: HomeStack,
      navigationOptions: {
        tabBarIcon: ({tintColor}) => (
          <TabBarIcon
            css={{width: 30, height: 30}}
            textForTitle={'Shop'}
            icon={Images.NavBarShopIcon}
            tintColor={tintColor}
          />
        ),
      },
    },

    //this is temp commented out
    CategoriesScreen: {
      screen: CategoryStack,
      navigationOptions: {
        tabBarIcon: ({tintColor}) => (
          <TabBarIcon
            textForTitle={'Browse'}
            css={{width: 30, height: 30}}
            icon={Images.NavBarBrowseIcon2}
            tintColor={tintColor}
          />
        ),
      },
    },
    // Search: {
    //   screen: SearchStack,
    //   navigationOptions: {
    //     tabBarIcon: ({ tintColor }) => (
    //       <TabBarIcon
    //         css={{ width: 30, height:30 }}
    //         icon={Images.IconSearch}
    //         tintColor={tintColor}
    //       />
    //     )
    //   }
    // },
    ...(Config.HideCartAndCheckout
      ? // ...(StoreHelper.isUserDefined()
        {}
      : {
          CartScreen: {
            screen: CartScreenStack,
            navigationOptions: {
              tabBarIcon: ({tintColor}) => (
                <TabBarIcon
                  cartIcon
                  textForTitle={'Cart'}
                  css={{width: 30, height: 30}}
                  icon={Images.NavBarCartIcon}
                  tintColor={tintColor}
                />
              ),
            },
          },
        }),
    // ...(Config.HideCartAndCheckout
    //   ? {}
    //   : {
    //     OrderLogisticsHomeScreen: {
    //       screen: OrderLogisticsStack,
    //       navigationOptions: {
    //         tabBarIcon: ({ tintColor }) => (
    //           <TabBarIcon
    //             textForTitle={"Logistics"}
    //             css={{ width: 30, height: 30 }}
    //             icon={Images.Gps1}
    //             tintColor={tintColor}
    //           />
    //         )
    //       }
    //     },
    //   }),
    // WishListScreen: {
    //   screen: WishListStack,
    //   navigationOptions: {
    //     tabBarIcon: ({ tintColor }) => (
    //       <TabBarIcon
    //         wishlistIcon
    //         css={{ width: 30, height: 30 }}
    //         icon={Images.IconHeart}
    //         tintColor={tintColor}
    //       />
    //     )
    //   }
    // },
    TrackOrderScreen: {
      screen: TrackOrderStack,
      navigationOptions: {
        tabBarIcon: ({tintColor}) => (
          <TabBarIcon
            wishlistIcon
            textForTitle={'Track'}
            css={{
              width: 30,
              height: 30,
            }}
            icon={Images.NavBarTrackIcon}
            tintColor={tintColor}
          />
        ),
      },
    },

    // TradingScreen: {
    //   screen: TradingScreenStack
    //   navigationOptions: {
    //     tabBarIcon: ({ tintColor }) => (
    //       <TabBarIcon
    //         textForTitle={"Trading"}
    //         css={{ width: 30, height: 30 }}
    //         icon={Images.IconMoney}
    //         tintColor={tintColor}
    //       />
    //     )
    //   }
    // },
    // PaymentsHomeScreen: {
    //   screen: PaymentsHomeScreenStack,
    //   navigationOptions: {
    //     tabBarIcon: ({ tintColor }) => (
    //       <TabBarIcon
    //         css={{ width: 30, height: 30 }}
    //         icon={Images.IconPayNow}
    //         tintColor={tintColor}
    //       />
    //     )
    //   }
    // },
    // PermissionsHomeScreen: {
    //   screen: PermissionsHomeStack,
    // navigationOptions: {
    //   tabBarVisible: false,
    //   tabBarIcon: ({ tintColor }) => (
    //     <TabBarIcon
    //       css={{ width: 30, height: 30 }}
    //       icon={Images.Permissions6}
    //       tintColor={tintColor}
    //     />
    //   )
    // }
    // },
    // NetworksHomeScreen: {
    //   screen: NetworksHomeStack,
    // navigationOptions: {
    //   tabBarVisible: false,
    //   tabBarIcon: ({ tintColor }) => (
    //     <TabBarIcon
    //       textForTitle={"Roles"}
    //       css={{ width: 30, height: 30 }}
    //       icon={Images.Enterprise3}
    //       tintColor={tintColor}
    //     />
    //   )
    // }
    // },
    // RegisterNetworkScreen: {
    //   screen: RegisterNetworkStack,
    // navigationOptions: {
    //   tabBarVisible: false,
    //   tabBarIcon: ({ tintColor }) => (
    //     <TabBarIcon
    //       css={{ width: 30, height: 30 }}
    //       icon={Images.NetworkPicker}
    //       tintColor={tintColor}
    //     />
    //   )
    // }
    //},
    // BIMapScreen: {
    //   screen: BIMapScreenStack,
    //   navigationOptions: {
    //     tabBarIcon: ({ tintColor }) => (
    //       <TabBarIcon
    //         textForTitle={"Traffic"}
    //         css={{ width: 30, height: 30 }}
    //       //  icon={Images.Set2BiMap3}
    //         tintColor={tintColor}
    //       />
    //     ),
    //   },
    // },
    // DriverHomeScreen: {
    //   screen: DriverHomeScreenStack,
    //   navigationOptions: {
    //     tabBarVisible: false,
    // tabBarIcon: ({ tintColor }) => (
    //   <TabBarIcon
    //     textForTitle={"Deliver"}
    //     css={{ width: 30, height: 30 }}
    //     icon={Images.Set2Driver1}
    //     tintColor={tintColor}
    //   />
    // ),
    //   },
    // },
    // StoreHomeScreen: {
    //   screen: StoreHomeScreenStack,
    //   navigationOptions: {
    //     tabBarVisible: false,
    // tabBarIcon: ({ tintColor }) => (
    //   <TabBarIcon
    //     textForTitle={"Sell"}
    //     css={{ width: 30, height: 30 }}
    //     icon={Images.Set2Store1}
    //     tintColor={tintColor}
    //   />
    // ),
    //   },
    // },
    UserProfileScreen: {
      screen: UserProfileStack,
      navigationOptions: {
        tabBarIcon: ({tintColor}) => (
          <TabBarIcon
            wishlistIcon
            textForTitle={'Account'}
            css={{width: 30, height: 30}}
            icon={Images.NavBarAccountIcon}
            tintColor={tintColor}
          />
        ),
      },
    },
    // ...(Config.HideCartAndCheckout
    //   ? {}
    //   : {
    //     MyOrders: { screen: MyOrdersScreen }
    //   }),
    NewsScreen: {screen: NewsStack},
    LoginStack: {screen: LoginStack},
    CustomPage: {screen: CustomPageScreen},
    // TestHome:{screen: TestStack},
    Detail: {
      screen: DetailScreen,
      navigationOptions: {
        tabBarVisible: false,
        gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
      },
    },
    CategoryDetail: {screen: CategoryDetailStack},
  },
  {
    // initialRouteName: 'CategoriesScreen',
    tabBarComponent: TabBar,
    tabBarPosition: 'bottom',
    swipeEnabled: false,
    animationEnabled: false,
    tabBarOptions: {
      showIcon: true,
      showLabel: true,
      activeTintColor: GlobalStyle.primaryColorDark.color,
      inactiveTintColor: Color.tabbarColor,
      // style: { marginBottom: 20, paddingBottom: 20 },
    },
    lazy: true,
    navigationOptions: {
      gestureDirection: I18nManager.isRTL ? 'inverted' : 'default',
    },
  },
);

// const AppContainer = reduxifyNavigator(AppNavigator, "root");

const mapStateToProps = state => ({
  ...state,
});

// const AppWithNavigationState = connect(mapStateToProps)(AppContainer);

const App = createAppContainer(AppNavigator);

export default App;

// export default AppWithNavigationState;

/**
 * prevent duplicate screen
 */
const navigateOnce = getStateForAction => (action, state) => {
  const {type, routeName} = action;
  return state &&
    type === NavigationActions.NAVIGATE &&
    routeName === state.routes[state.routes.length - 1].routeName
    ? null
    : getStateForAction(action, state);
};

/**
 * Add AppNavigator to navigateOnce bug naivgate drawer category
 */
// AppNavigator.router.getStateForAction = navigateOnce(
//     AppNavigator.router.getStateForAction
// );
NewsStack.router.getStateForAction = navigateOnce(
  NewsStack.router.getStateForAction,
);
CategoryStack.router.getStateForAction = navigateOnce(
  CategoryStack.router.getStateForAction,
);
CategoryDetailStack.router.getStateForAction = navigateOnce(
  CategoryDetailStack.router.getStateForAction,
);
WishListStack.router.getStateForAction = navigateOnce(
  WishListStack.router.getStateForAction,
);
HomeStack.router.getStateForAction = navigateOnce(
  HomeStack.router.getStateForAction,
);
SearchStack.router.getStateForAction = navigateOnce(
  SearchStack.router.getStateForAction,
);
CartScreenStack.router.getStateForAction = navigateOnce(
  CartScreenStack.router.getStateForAction,
);

/**
 * FIX RTL react-navigation tab do not show
 */
// TabViewPagerPan.prototype.render = function render() {
//   const { panX, offsetX, navigationState, layout, children } = this.props;
//   const { width } = layout;
//   const { routes } = navigationState;
//   const maxTranslate = width * (routes.length - 1);
//   let translateX;
//   if (I18nManager.isRTL) {
//     // <------- HACK ---------
//     translateX = Animated.multiply(Animated.add(panX, offsetX), -1).interpolate(
//       {
//         inputRange: [0, maxTranslate],
//         outputRange: [0, maxTranslate],
//         extrapolate: "clamp"
//       }
//     );
//     // ---------------------->
//   } else {
//     translateX = Animated.add(panX, offsetX).interpolate({
//       inputRange: [-maxTranslate, 0],
//       outputRange: [-maxTranslate, 0],
//       extrapolate: "clamp"
//     });
//   }

//   return (
//     <Animated.View
//       style={[
//         styles.sheet,
//         width
//           ? {
//               width: routes.length * width,
//               transform: [{ translateX }]
//             }
//           : null
//       ]}
//       {...this._panResponder.panHandlers}
//     >
//       {React.Children.map(children, (child, i) => (
//         <View
//           key={navigationState.routes[i].key}
//           testID={navigationState.routes[i].testID}
//           style={
//             width
//               ? { width }
//               : i === navigationState.index
//               ? StyleSheet.absoluteFill
//               : null
//           }
//         >
//           {i === navigationState.index || width ? child : null}
//         </View>
//       ))}
//     </Animated.View>
//   );
// };

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
});
