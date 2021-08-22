import {Image, Dimensions} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';
import {StackActions, NavigationActions} from 'react-navigation';

const {width, height} = Dimensions.get('window');
export default class StackHelper {
  static cleanAndResetStack0 = navigation => {
    //reset home stack and go
    let currentIndex = navigation.state.nav.index;

    navigation._navigation.navigate('CategoriesScreen');
    this.cleanAndResetStack1(navigation);
    navigation._navigation.navigate('Home');
    const resetAction = StackActions.reset({
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({routeName: 'Home'})],
    });
    navigation.dispatch(resetAction);
  };

  static cleanAndResetStack1 = navigation => {
    //reset cat stack
    const resetCatAction = StackActions.reset({
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({routeName: 'CategoriesScreen'})],
    });
    navigation.dispatch(resetCatAction);
  };

  static resetBothCustomerStacks = navigation => {
    this.resetStacksAndGo();
    // this.cleanAndResetStack0(navigation);
    // this.cleanAndResetStack1(navigation);
  };

  /** THIS NEEDS A ROOT NAVIGATOR PASSED IN!!*/
  static resetStacksAndGo = (navigation, screenToJumpTo = null) => {
    //reset home stack and go
    let currentIndex = navigation.state.nav.index;

    navigation._navigation.navigate('CategoriesScreen');
    this.cleanAndResetStack1(navigation);
    navigation._navigation.navigate('Home');
    // const resetAction = StackActions.reset({
    //   index: 1,
    //   key: null,
    //   actions: [
    //     NavigationActions.navigate({
    //       routeName: 'Home',
    //       action: NavigationActions.navigate({
    //         routeName:'CategoriesScreen',
    //         params:{}
    //       })
    //     })
    //   ]
    // });
    const resetAction = StackActions.reset({
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({routeName: 'Home'})],
    });
    navigation.dispatch(resetAction);

    if (screenToJumpTo) {
      navigation._navigation.navigate(screenToJumpTo);
    }
  };

  static cleanAndResetStack1 = navigation => {
    //reset cat stack
    const resetCatAction = StackActions.reset({
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({routeName: 'CategoriesScreen'})],
    });
    navigation.dispatch(resetCatAction);
  };
}
