/** @format */

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View, Text, TouchableOpacity, I18nManager, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import _ from 'lodash';
import {withTheme, Config} from '@common';
import TextTicker from 'react-native-text-ticker';

import styles from './styles';
// import ImageStylePropTypes from "react-native/Libraries/Image/ImageStylePropTypes";

@withTheme
export default class UserProfileItem extends PureComponent {
  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    icon: PropTypes.any,
  };

  static defaultProps = {
    icon: false,
  };

  render() {
    const {label, value, onPress, icon, type, image, imageStyle} = this.props;
    const {
      theme: {
        colors: {lineColor},
      },
    } = this.props;
    if (type == null || type == '') {
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          style={[styles.row, Config.Theme.isDark]}>
          <Text style={styles.title}>{label.toUpperCase()}</Text>
        </TouchableOpacity>
      );
    } else if (type == 'subtitle') {
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          style={[styles.row, Config.Theme.isDark]}>
          <Text style={styles.title}>{label.toUpperCase()}</Text>
          {value != null ? <Text style={styles.subtitle}>{value}</Text> : null}
          {icon && _.isBoolean(icon) && (
            <Icon
              style={[
                styles.icon,
                I18nManager.isRTL && {
                  transform: [{rotate: '180deg'}],
                },
              ]}
              color="#CCCCCC"
              size={22}
              name="chevron-small-right"
            />
          )}
          {icon && !_.isBoolean(icon) && icon()}
        </TouchableOpacity>
      );
    }
    if (type == 'image') {
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          style={[
            styles.row,
            Config.Theme.isDark,
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'center',
            },
          ]}>
          <View
            style={{
              width: '40%',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            {image != '' ? (
              <Image
                source={image}
                style={{
                  width: 25,
                  height: 25,
                  resizeMode: 'contain',
                  tintColor: '#A5B5C7',
                  ...imageStyle,
                }}
              />
            ) : null}
            <Text style={{...styles.title, marginLeft: '5%'}}>
              {label.toUpperCase()}
            </Text>
          </View>
          <View>
            {value != '' ? <Text style={styles.subtitle}>{value}</Text> : null}
          </View>
        </TouchableOpacity>
      );
    }
  }
}
