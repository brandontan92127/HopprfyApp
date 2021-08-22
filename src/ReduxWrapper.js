/**
 * Created by InspireUI on 18/02/2017.
 *
 * @format
 */

import React, {Component} from 'react';
import {I18nManager, Platform, Alert, View, Text} from 'react-native';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/es/integration/react';
import {Provider as PaperProvider} from 'react-native-paper';
import OneSignal from 'react-native-onesignal';
import {Languages, Config, Theme, Constants} from '@common';
import {EventEmitter, getNotification} from '@app/Omni';
import store from '@store/configureStore';
import Router from './Router';
import FlashMessage, {showMessage} from 'react-native-flash-message';
import {EventRegister} from 'react-native-event-listeners';
import ErrorBoundary from 'react-native-error-boundary';

export default class ReduxWrapper extends Component {
  constructor(properties) {
    super(properties);
    console.debug('in redux wrapper');
  }

  _unregisterOnesignal = () => {
    //   alert("ONESIGNAL WAS REMOVED");
  };

  _registerOnesignalIOS = async () => {
    try {
      /* O N E S I G N A L   S E T U P */
      OneSignal.setAppId('8954248b-16cd-4475-b688-94f1082336fb');
      OneSignal.setLogLevel(6, 0);
      OneSignal.setRequiresUserPrivacyConsent(false);
      OneSignal.promptForPushNotificationsWithUserResponse(response => {
        console.log('Prompt response:', response);
      });

      /* O N E S I G N A L  H A N D L E R S */
      OneSignal.setNotificationWillShowInForegroundHandler(
        notifReceivedEvent => {
          console.log(
            'OneSignal: notification will show in foreground:',
            notifReceivedEvent,
          );
          let notif = notifReceivedEvent.getNotification();

          const button1 = {
            text: 'Cancel',
            onPress: () => {
              notifReceivedEvent.complete();
            },
            style: 'cancel',
          };

          const button2 = {
            text: 'Complete',
            onPress: () => {
              notifReceivedEvent.complete(notif);
            },
          };
          //Alert.alert("Complete notification?", "Test", [ button1, button2], { cancelable: true });
        },
      );
      OneSignal.setNotificationOpenedHandler(notification => {
        console.log('OneSignal: notification opened:', notification);
      });
      OneSignal.setInAppMessageClickHandler(event => {
        console.log('OneSignal IAM clicked:', event);
      });
      OneSignal.addEmailSubscriptionObserver(event => {
        console.log('OneSignal: email subscription changed: ', event);
      });
      OneSignal.addSubscriptionObserver(event => {
        console.log('OneSignal: subscription changed:', event);
        this.setState({isSubscribed: event.to.isSubscribed});
      });
      OneSignal.addPermissionObserver(event => {
        console.log('OneSignal: permission changed:', event);
      });

      //move this / use redux
      const deviceState = await OneSignal.getDeviceState();
      this.setState({
        isSubscribed: deviceState.isSubscribed,
      });
    } catch (error) {
      console.log(error, 'had an issue');
      alert('Had issue registering onesignal IOS' + JSON.stringify(error));
    }
  };

  _registerOnesignalAndroid = () => {
    OneSignal.init('8954248b-16cd-4475-b688-94f1082336fb', {
      kOSSettingsKeyAutoPrompt: false,
      kOSSettingsKeyInAppLaunchURL: false,
      kOSSettingsKeyInFocusDisplayOption: 2,
    });
    OneSignal.configure();
    OneSignal.inFocusDisplaying(2);

    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('ids', this.onIds);
  };

  componentDidMount = async () => {
    //ONESIGNAL SETUP CODE
    //alert('yes');
    // this._unregisterOnesignal();

    if (Platform.OS == 'ios') {
      await this._registerOnesignalIOS();
    } else {
      this._registerOnesignalAndroid();
    }

    //const notification = await getNotification();

    // if (notification) {
    //   OneSignal.addEventListener("opened", this.onOpened);
    //   OneSignal.addEventListener("received", this.onReceived);
    //   OneSignal.addEventListener("ids", this.onIds);

    //   alert("BOOM ONESIGNAL REG COMPLETED");
    //   OneSignal.getPermissionSubscriptionState((status) => {
    //     let userID = status.userId;
    //   });
    // }
    console.disableYellowBox = true;
    console.ignoredYellowBox = [
      'Warning: View.propTypes',
      'Warning: BackAndroid',
    ];

    const language = store.getState().language;
    // set default Language for App
    Languages.setLanguage(language.lang);
    // EventEmitter.emit(Constants.EmitCode.MenuReload, language.lang);
    // Enable for mode RTL
    I18nManager.forceRTL(language.rtl);
  };

  async componentWillUnmount() {
    this._unregisterOnesignal();
  }

  //for android
  onReceived = notification => {
    console.debug('Notification received: ', notification);
  };

  onOpened = openResult => {
    console.debug('Message: ', openResult.notification.payload.body);
    console.debug('Data: ', openResult.notification.payload.additionalData);
    console.debug('isActive: ', openResult.notification.isAppInFocus);
    console.debug('openResult: ', openResult);

    if (typeof openResult.notification.payload.additionalData !== 'undefined') {
      //switch for deep links
      var additionalDataObj = openResult.notification.payload.additionalData;
      console.debug(additionalDataObj);
      if (typeof additionalDataObj.linkRouteAction !== 'undefined') {
        console.debug('we got an route link action');
        switch (additionalDataObj.linkRouteAction) {
          case 'GET_LAST_LOGISTICS_MODAL':
            EventRegister.emit('getLastLogisticsOrder');
            break;
          default:
            break;
        }
      }
    }
  };

  onIds = device => {
    console.debug('Device info: ', device);
    //now ids are available, we should we using this!!!!
  };

  errorHandler = (error, stackTrace) => {
    /* Log the error to an error reporting service */
    alert('This hit the JS ERROR boundary: ' + JSON.stringify(error));
  };

  render = () => {
    const persistor = persistStore(store);

    return (
      // <ErrorBoundary onError={this.errorHandler}>
        <Provider store={store}>
          {/* <PersistGate persistor={persistor}> */}
          <PaperProvider theme={Config.Theme.isDark ? Theme.dark : Theme.light}>
            <Router />

            {/* GLOBAL FLASH MESSAGE COMPONENT INSTANCE */}
            <FlashMessage style={{zIndex: 90000}} position="top" />
          </PaperProvider>
          {/* </PersistGate> */}
        </Provider>
      // </ErrorBoundary>
    );
  };
}
