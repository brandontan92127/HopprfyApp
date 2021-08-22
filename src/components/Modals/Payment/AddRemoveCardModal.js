import Modal from 'react-native-modalbox';
import React, {Component} from 'react';
import {
  Image,
  View,
  Animated,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import ListView from 'deprecated-react-native-listview';
import {
  Color,
  Languages,
  Styles,
  Constants,
  withTheme,
  GlobalStyle,
} from '@common';
import {
  Button as ElButton,
  List,
  ListItem,
  Header,
  Icon,
  Divider,
} from 'react-native-elements';
import {Images} from '@common';
import {toast} from '../../../Omni';
import FlashMessage, {
  showMessage,
  hideMessage,
} from 'react-native-flash-message';
import {CreditCardInput} from 'react-native-credit-card-input';
import {EventRegister} from 'react-native-event-listeners';
import Spinner from 'react-native-spinkit';

const {width, height} = Dimensions.get('window');
const spinnerConfig = {
  color: 'white',
  type: '9CubeGrid',
  size: 180,
};

const styles = StyleSheet.create({
  // DRIVER CONTROLS
  driverControlsButton: {
    padding: 10,
  },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  driverControlsModal: {
    // justifyContent: "center",
    // alignItems: "center",
    height: 300,
    backgroundColor: '#fff',
  },
  driverButtonViewContainer: {
    padding: 5,
  },
  containerCenteyellow: {
    backgroundColor: Color.background,
    justifyContent: 'center',
  },
});

export default class AddRemoveCardModal extends React.Component {
  constructor() {
    super();
    this.state = {
      spinnerVisible: false,
    };
  }

  componentDidMount = async () => {
    await this.load();
  };

  render() {
    const {
      headerText,
      openClosed,
      openMe,
      closeMe,
      cardList,
      addCard,
      setCardAsDefault,
      defaultCardSource,
      removeCard,
      refreshCards,
      ...props
    } = this.props;

    this.cardList = cardList;
    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;
    this.addCard = addCard;
    (this.refreshCards = refreshCards), //this refreshes the cards
      (this.removeCard = removeCard);
    this.setCardAsDefault = setCardAsDefault;
    this.defaultCardSource = defaultCardSource;

    this.addCardFromFormIfValid = async form => {
      // this.refs.localFlashMessage.showMessage({
      //   style:{
      //     zIndex:99999
      //   },
      //   zIndex:99999,
      //   message: form.values.number,
      //   duration: 3000,
      //   backgroundColor: "red", // background color
      //   position:"center",
      //   description:
      //   testCOunt,
      //   color: "white", // text color
      //   autoHide: true,
      // });

      if (form.status.number === 'invalid') {
        this.refs.localFlashMessage.showMessage({
          style: {
            zIndex: 99999,
          },
          zIndex: 99999,
          message: 'Your card number is invalid',
          duration: 3000,
          backgroundColor: 'red', // background color
          position: 'center',
          description: 'Please correct it',
          color: 'white', // text color
          autoHide: true,
        });
      }
      if (form.status.expiry === 'invalid') {
        this.refs.localFlashMessage.showMessage({
          style: {
            zIndex: 99999,
          },
          zIndex: 99999,
          message: 'Your card expiry is invalid',
          duration: 3000,
          backgroundColor: 'red', // background color
          position: 'center',
          description: 'Please correct it',
          color: 'white', // text color
          autoHide: true,
        });
      }
      if (form.status.cvc === 'invalid') {
        this.refs.localFlashMessage.showMessage({
          style: {
            zIndex: 99999,
          },
          zIndex: 99999,
          message: 'Your card cvc is invalid',
          duration: 3000,
          backgroundColor: 'red', // background color
          position: 'center',
          description: 'Please correct it',
          color: 'white', // text color
          autoHide: true,
        });
      }
      if (
        form.values.number.length > 18 &&
        form.status.number === 'incomplete'
      ) {
        this.refs.localFlashMessage.showMessage({
          style: {
            zIndex: 99999,
          },
          zIndex: 99999,
          message: `Your card number ${form.values.number} is invalid`,
          duration: 3000,
          backgroundColor: 'red', // background color
          position: 'center',
          description: 'Please correct it',
          color: 'white', // text color
          autoHide: true,
        });
      }
      if (
        form.values.expiry.length > 4 &&
        form.status.expiry === 'incomplete'
      ) {
        this.refs.localFlashMessage.showMessage({
          style: {
            zIndex: 99999,
          },
          zIndex: 99999,
          message: `Your expiry ${form.values.expiry} is invalid`,
          duration: 3000,
          backgroundColor: 'red', // background color
          position: 'center',
          description: 'Please correct it',
          color: 'white', // text color
          autoHide: true,
        });
      }
      if (form.values.cvc.length >= 4 && form.status.cvc === 'incomplete') {
        this.refs.localFlashMessage.showMessage({
          style: {
            zIndex: 99999,
          },
          zIndex: 99999,
          message: `Your expiry ${form.values.cvc} is invalid`,
          duration: 3000,
          backgroundColor: 'red', // background color
          position: 'center',
          description: 'Please correct it',
          color: 'white', // text color
          autoHide: true,
        });
      }

      // this.refs.localFlashMessage.showMessage({
      //   style:{
      //     zIndex:99999
      //   },
      //   zIndex:99999,
      //   message: "Trying to add a card now",
      //   duration: 2000,
      //   backgroundColor: "purple", // background color
      //   position:"center",
      //   description:
      //     JSON.stringify(form),
      //   color: "white", // text color
      //   autoHide: true,
      // });

      if (form.valid) {
        this.refs.localFlashMessage.showMessage({
          style: {
            zIndex: 99999,
          },
          zIndex: 99999,
          message: 'Trying to add a card now',
          duration: 2000,
          backgroundColor: 'purple', // background color
          position: 'center',
          description: 'We will let you know...',
          color: 'white', // text color
          autoHide: true,
        });

        try {
          this.setState({spinnerVisible: true});
          let expiryArray = form.values.expiry.split('/');
          //add card no, month, year, csv
          let addCardResult = await this.addCard(
            form.values.number,
            expiryArray[0],
            '20' + expiryArray[1],
            form.values.cvc,
          );

          console.log('We got a card response');
          if ((addCardResult.status == 200) | (addCardResult.status == 201)) {
            showMessage({
              message: 'Your new card was added!',
              duration: 4000,
              backgroundColor: GlobalStyle.primaryColorDark.color, // background color
              description: 'You can now make purchases',
              color: 'white', // text color
              position: 'center',
              autoHide: true,
            });

            this.closeMe();
            this.refs.CCInput.setValues({number: '', expiry: '', cvc: ''});
            //this.refs.CCInput.focus("number");
            //clear form
          } else {
            this.refs.localFlashMessage.showMessage({
              zIndex: 100,
              message: "That didn't work",
              duration: 4000,
              backgroundColor: 'red', // background color
              description:
                "We couldn't add your card. Please check the details!",
              color: 'white', // text color
              position: 'center',
              autoHide: true,
            });
          }
        } catch (error) {
          alert('That failed! Please check all your card data is valid!!');
        } finally {
          this.setState({spinnerVisible: false});
        }
      }
    };

    this.showCardAlertMenu = id => {
      Alert.alert(
        'Card options',
        'Edit your card options',
        [
          {
            text: 'Delete card',
            style: 'destructive',
            onPress: () => {
              try {
                this.refs.localFlashMessage.showMessage({
                  style: {
                    zIndex: 99999,
                  },
                  zIndex: 99999,
                  message: 'Trying to remove card..',
                  duration: 2000,
                  backgroundColor: 'purple', // background color
                  position: 'center',
                  description: 'We will let you know...',
                  color: 'white', // text color
                  autoHide: true,
                });

                this.removeCard(id);
                this.refs.localFlashMessage.showMessage({
                  style: {
                    zIndex: 99999,
                  },
                  zIndex: 99999,
                  message: 'Card was deleted!',
                  duration: 2000,
                  backgroundColor: 'lightblue', // background color
                  position: 'center',
                  description: 'Thanks',
                  color: 'white', // text color
                  autoHide: true,
                });
              } catch (error) {}
            },
          },
          {
            text: 'Set as default card',
            onPress: () => this.setCardAsDefault(id),
            style: 'cancel',
          },
          {text: 'Close', onPress: () => console.debug('OK Pressed')},
        ],
        {cancelable: true},
      );
    };

    this.showActiveCardLight = () => {
      return (
        <Image
          style={{
            maxHeight: 20,
            height: 20,
            width: 20,
            maxWidth: 20,
          }}
          source={Images.flashingPurpleBall}
          resizeMode="contain"
        />
      );
    };
    this.renderRow = ({item}) => {
      console.debug('Rendering card modal row');
      let rightTitle = undefined;
      let rightIcon = undefined;
      //check if default payment source and render icon and title
      if (this.defaultCardSource === item.id) {
        rightTitle = 'Active';
        rightIcon = this.showActiveCardLight();
      }

      return (
        <ListItem
          roundAvatar
          rightIcon={rightIcon}
          rightTitle={rightTitle}
          onPressRightIcon={() => this.removeCard(item.id)}
          title={item.brand + ' - Exp:' + item.exp_month + '/' + item.exp_year}
          subtitle={'**** **** **** ' + item.last4}
          avatar={{
            uri: 'https://cdn2.iconfinder.com/data/icons/credit-cards-6/156/visa-512.png',
          }}
          onPress={() => this.showCardAlertMenu(item.id)}
        />
      );
    };

    this.load = async () => {
      await this.refreshCards();
    };

    this.showCardList = () => {
      console.debug('Getting card lsit');
      if (this.props.cardList.length > 0) {
        return (
          <List>
            <FlatList
              data={this.props.cardList}
              renderItem={this.renderRow}
              keyExtractor={item => item.id} //this is cardId
            />
          </List>
        );
      } else {
        return (
          <View>
            <Image
              style={{
                flex: 1,
                maxHeight: 140,
                height: 140,
                width: undefined,
              }}
              source={Images.whereisIt}
              resizeMode="contain"
            />
            <Text
              style={{
                color: 'black',
                fontFamily: Constants.fontFamily,
                fontSize: 20,
                textAlign: 'center',
              }}>
              {'There were no cards to show!'}
            </Text>
          </View>
        );
      }
    };

    return (
      <Modal
        style={{
          zIndex: 0,
          backgroundColor: GlobalStyle.modalBGcolor.backgroundColor,
          height: null,
          paddingBottom: 10,
          borderRadius: 20,
          borderWidth: 0,
          borderColor: '#8C28BB',
          width: width - 16,
        }}
        zIndex={0}
        backdrop={true}
        backdropOpacity={0.25}
        backdropPressToClose={true}
        swipeToClose={true}
        coverScreen={true}
        position={'center'}
        ref={'addRemoveCardModal'}
        isOpen={this.props.openClosed}
        onOpened={async () => await this.load()}
        onClosed={() => this.closeMe()}>
        <Header
          backgroundColor={GlobalStyle.modalHeader.backgroundColor}
          outerContainerStyles={{
            height: 49,
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19,
          }}
          rightComponent={{
            icon: 'close',
            color: '#fff',
            onPress: () => this.props.closeMe(),
          }}
          centerComponent={{
            text: 'Adjust Payment Methods',
            style: {
              fontSize: 14,
              color: GlobalStyle.modalTextBlackish.color,
              fontFamily: Constants.fontHeader,
            },
          }}
        />
        <View style={{flexGrow: 1}}>
          <ScrollView>
            <Text
              style={{
                color: 'black',
                margin: 5,
                fontFamily: Constants.fontFamily,
                fontSize: 14,
                paddingBottom: 4,
                paddingTop: 4,
                textAlign: 'center',
              }}>
              {'Add or remove a payment method'}
            </Text>
            <View
              style={{
                overflow: 'hidden',
                borderRadius: 30,
              }}>
              <CreditCardInput
                cardFontFamily={Constants.fontFamilyMedium}
                cardImageFront={Images.CardVectorBg1}
                cardImageBack={Images.CardVectorBg1}
                ref={'CCInput'}
                validColor={GlobalStyle.primaryColorDark.color}
                onChange={form => this.addCardFromFormIfValid(form)}
              />
            </View>
            <View style={{margin: 10, borderRadius: 10, overflow: 'hidden'}}>
              {this.showCardList()}
            </View>
            <ElButton
              buttonStyle={{padding: 10, margin: 5, marginTop: 10}}
              raised
              backgroundColor={GlobalStyle.primaryColorDark.color}
              borderRadius={30}
              icon={{name: 'thumb-up'}}
              title="Complete"
              onPress={() => this.props.closeMe()}
            />
          </ScrollView>
        </View>
        <FlashMessage ref="localFlashMessage" />
        {/* SPINNER */}
        {this.state.spinnerVisible && (
          <View
            style={{
              // flex: 1,
              zIndex: 999999,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              //backgroundColor: '#d35400',
              backgroundColor: 'rgba(0.0,69.8,74.5, 0.2)',
              // backgroundColor: 'transparent'
            }}>
            <Spinner
              style={{
                spinner: {
                  marginBottom: 50,
                  alignSelf: 'center',
                },
              }}
              isVisible={this.state.spinnerVisible}
              size={spinnerConfig.size}
              //onLongPress={() => this._hideSpinner()}
              type={spinnerConfig.type}
              color={spinnerConfig.color}
            />
          </View>
        )}
      </Modal>
    );
  }
}
