/** @format */
import React, {Component} from 'react';
import {
  Image,
  Platform,
  View,
  Dimensions,
  I18nManager,
  StyleSheet,
  ScrollView,
  Animated,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
  TouchableHighlight,
  Alert,
} from 'react-native';
import ListView from 'deprecated-react-native-listview';
import moment from 'moment';
import {connect} from 'react-redux';
import {
  UserProfileHeader,
  UserProfileItem,
  ModalBox,
  CurrencyPicker,
  CashOutModal,
} from '@components';
import {
  Languages,
  Color,
  Tools,
  Config,
  withTheme,
  Images,
  Constants,
  GlobalStyle,
} from '@common';
import {getNotification, toast} from '@app/Omni';
import _ from 'lodash';
import {
  List,
  ListItem,
  Button,
  Header,
  Icon,
  Divider,
} from 'react-native-elements';
import equal from 'fast-deep-equal';

const hopprMainBlue = GlobalStyle.primaryColorDark.color;
export default class PermissionList extends Component {
  constructor(props) {
    super(props);

    const {
      enablePermissions,
      disablePermissions,
      deletePermissions,
      pullToRefresh,
      data,
    } = this.props;

    this.state = {
      refreshing: false,
      data: [],
    };
    console.debug('In permissionslist');

    this.pullToRefresh = pullToRefresh;
    this.enablePermissions = enablePermissions;
    this.disablePermissions = disablePermissions;
    this.deletePermissions = deletePermissions;
  }

  showAlertMenu = async permission => {
    Alert.alert(
      'Permissions options',
      'Take actions here:',
      [
        {
          text: 'Delete permission',
          style: 'destructive',
          onPress: () => this.deletePermissions(permission),
        },
        {text: 'Close', onPress: () => console.debug('OK Pressed')},
      ],
      {cancelable: true},
    );
  };

  toggleSwitch = perm => {
    console.debug('toggling permission');
    if (perm.active) {
      //disable
      this.disablePermissions(perm);
    } else {
      this.enablePermissions(perm);
    }
  };

  renderRow = ({item, i}) => {
    let networkImageUrl =
      Config.NetworkImageBaseUrl + item.network.storeLogoUrl;

    return (
      <ListItem
        subtitleNumberOfLines={2}
        leftIconOnPress={() => toast('Pressed left icon')}
        title={
          item.network.storeName + ' ' + item.permission.networkPermissionType
        }
        subtitle={
          'Enabled: ' +
          item.permission.active +
          '\n' +
          'Modified: ' +
          moment
            .parseZone(item.permission.modificationDate)
            .format('MMMM DD, YYYY')
        }
        leftIcon={
          <Image
            style={{
              flex: 1,
              maxHeight: 120,
              height: 100,
              width: 100,
              maxWidth: 120,
              padding: 5,
              //   width: undefined
            }}
            source={{uri: networkImageUrl}}
            resizeMode="contain"
          />
        }
        switched={item.permission.active}
        onSwitch={() => {
          console.debug('About to toggle');
          this.toggleSwitch(item.permission);
        }}
        switchButton={true}
        hideChevron={true}
        switchTintColor={'grey'}
        switchOnTintColor={hopprMainBlue}
        // onPress={() => this.deletePermissions(item.permission.id)}
        // onLongPress={() => this.deletePermissions(item.permission.id)}
        onPress={() => this.showAlertMenu(item.permission)}
        onLongPress={() => this.showAlertMenu(item.permission)}
      />
    );
  };

  componentDidUpdate = (prevProps, prevState) => {
    const {data} = this.props;
    if (!equal(data, prevState.data)) {
      //set state if they're not the same
      this.setState({data: data});
    }
  };

  componentDidMount = () => {
    const {data} = this.props;
    this.setState({data: data});
  };
  //takes a list of networks and permissions
  render = () => {
    return (
      <View style={{flex: 1}}>
        <List style={{flexGrow: 1}}>
          <FlatList
            style={{flexGrow: 1}}
            data={this.state.data}
            renderItem={this.renderRow}
            keyExtractor={item => item.permission.id}
            onRefresh={() => this.pullToRefresh()}
            refreshing={this.state.refreshing}
          />
        </List>
      </View>
    );
  };
}
