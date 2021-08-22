/**
 * Created by InspireUI on 27/02/2017.
 *
 * @format
 */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { View, ScrollView, Image, I18nManager } from "react-native";
import { connect } from "react-redux";
import { Accordion, Empty, Text } from "@components";
import { toast } from "@app/Omni";
import {
  Color,
  Icons,
  Config,
  Languages,
  Tools,
  withTheme,
  Theme,
} from "@common";
import { DrawerButton, DrawerButtonChild } from "../DrawerButton";
import styles from "./styles";
const isDark = Config.Theme.isDark;

class DrawerMultiChild extends PureComponent {
  static propTypes = {
    backgroundMenu: PropTypes.string,
    colorTextMenu: PropTypes.string,
    userProfile: PropTypes.object,
    fetchCategories: PropTypes.func.isRequired,
    goToScreen: PropTypes.func.isRequired,
    setSelectedCategory: PropTypes.func.isRequired,
    categories: PropTypes.any,
  };

  static defaultProps = {
    backgroundMenu: "#FFF",
    colorTextMenu: isDark ? Theme.dark.colors.text : Theme.light.colors.text,
  };

  constructor(props) {
    super(props);

    const { user } = props.userProfile;
    // Config Menu
    if (user) {
      this.buttonList = [
        ...Config.menu.listMenu,
        ...Config.menu.listMenuLogged,
      ];
    } else {
      this.buttonList = [
        ...Config.menu.listMenu,
        ...Config.menu.listMenuUnlogged,
      ];
    }

    this.state = {};
  }

  componentDidMount() {
    console.debug("In drawer multichild");
    const { fetchCategories } = this.props;
    //get last set cats if it's set, else use first id in picker

    if (this.props.networkPickerData.length > 0) {
      let whichNetIdToUse =
        typeof this.props.currentlySelectedNetworkGuid !== "undefined"
          ? this.props.currentlySelectedNetworkGuid
          : this.props.networkPickerData[0].id;

      console.debug("whichnet to use: " + whichNetIdToUse);
      fetchCategories(whichNetIdToUse);
    } else {
      toast(
        "Not getting categories cos there's no networks loaded!! Load some into the network picker"
      );
    }
  }

  /**
   * Update when logged in
   */
  componentWillReceiveProps(props) {
    const { userProfile } = props;
    const { error } = props.categories;
    if (error) toast(error);

    if (userProfile && userProfile.user) {
      this.buttonList = [
        ...Config.menu.listMenu,
        ...Config.menu.listMenuLogged,
      ];
    }
  }

  /**
   * Render header of accordion menu
   */
  _renderHeader = (section, index, isActive) => {
    const { colorTextMenu } = this.props;

    return (
      <DrawerButtonChild
        iconRight={isActive ? Icons.Ionicons.Remove : Icons.Ionicons.Add}
        text={section.name}
        uppercase
        key={index}
        colorText={colorTextMenu}
        {...section}
      />
    );
  };

  /**
   * Render content of accordion menu - this is down left hand side
   */
  _renderContent = (section) => {
    console.debug("Rendering accordion menu");
    const { categories, selectedCategory, colorTextMenu } = this.props;
    const subCategories = this._getCategories(categories, section);

    return (
      <View>
        <View key={-1} style={{ marginLeft: 20 }}>
          <DrawerButton
            {...section}
            onPress={() => this._handlePress(section, section)}
            text={Languages.seeAll}
            textStyle={styles.textItem}
            colorText={colorTextMenu}
          />
        </View>
        {subCategories.map((cate, index) => {
          return (
            <View key={index} style={{ marginLeft: 20 }}>
              <DrawerButton
                {...section}
                onPress={() => this._handlePress(cate, section)}
                text={cate.name}
                textStyle={styles.textItem}
                colorText={colorTextMenu}
                isActive={
                  selectedCategory ? selectedCategory.id === cate.id : false
                }
              />
            </View>
          );
        })}
      </View>
    );
  };

  _renderRowCategories = () => {
    const { categories, colorTextMenu } = this.props;
    const mainCategories = this._getCategories(categories);

    if (
      categories.error ||
      !categories ||
      (categories && categories.list === 0)
    ) {
      return <Empty />;
    }

    return (
      <View>
        {mainCategories && mainCategories.length ? (
          <View>
            <View style={styles.headerCategory}>
              <Text
                style={[
                  styles.textHeaderCategory,
                  {
                    color: colorTextMenu,
                  },
                ]}
              >
                {Languages.Category && Languages.Category.toUpperCase()}
              </Text>
            </View>
            <Accordion
              underlayColor={Color.DirtyBackground}
              sections={mainCategories}
              renderHeader={this._renderHeader}
              renderContent={this._renderContent}
            />
          </View>
        ) : null}
      </View>
    );
  };

  _getCategories = (categories, section) => {
    if (categories && categories.list.length) {
      return categories.list.filter((cate, index) => {
        if (section) {
          return cate.parent === section.id; // check is sub category
        }
        return cate.parent === 0;
      });
    }

    return [];
  };

  _handlePress = (item, section) => {
    const { goToScreen, setSelectedCategory, categories } = this.props;

    if (section) {
      const params = {
        ...item,
        mainCategory: section,
      };
      setSelectedCategory(params);
      goToScreen("CategoryDetail", params, false);
    } else {
      goToScreen(item.routeName, item.params, false);
    }
  };

  render() {
    const {
      userProfile,
      backgroundMenu,
      colorTextMenu,
      categories,
    } = this.props;
    const user = userProfile.user;
    const avatar = Tools.getAvatar(user);
    const name = user != null ? Tools.getName(user.customer) : "Guest";
    const {
      theme: {
        colors: { background, text },
      },
    } = this.props;

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: background,
          },
        ]}
      >
        <View
          style={[
            styles.avatarBackground,
            {
              backgroundColor: background,
            },
          ]}
        >
          <Image
            source={avatar}
            style={[styles.avatar, I18nManager.isRTL && { left: -20 }]}
          />

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.fullName,
                {
                  color: text,
                },
              ]}
            >
              {name}
            </Text>
            <Text
              style={[
                styles.email,
                {
                  color: text,
                },
              ]}
            >
              {user ? user.email : ""}
            </Text>
          </View>
        </View>
        <ScrollView>
          {this.buttonList.map((item, index) => (
            <DrawerButton
              {...item}
              key={index}
              onPress={() => this._handlePress(item)}
              icon={null}
              uppercase
              colorText={colorTextMenu}
              textStyle={styles.textItem}
            />
          ))}
          {this._renderRowCategories()}
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = ({ user, categories, netInfo, language }) => ({
  userProfile: user,
  netInfo,
  categories,
  selectedCategory: categories.selectedCategory,
  networkPickerData: categories.networkPickerData, //the available networks in the picker
  language: language.lang,
  currentlySelectedNetworkGuid: categories.currentlySelectedNetworkGuid,
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { netInfo } = stateProps;
  const { dispatch } = dispatchProps;
  const { actions } = require("@redux/CategoryRedux");

  return {
    ...ownProps,
    ...stateProps,
    setSelectedCategory: (category) =>
      dispatch(actions.setSelectedCategory(category)),
    fetchCategories: (lastSeletedNetworkGuid) => {
      if (!netInfo.isConnected) return toast(Languages.noConnection);
      actions.fetchCategories(dispatch, lastSeletedNetworkGuid);
    },
  };
}

export default connect(
  mapStateToProps,
  null,
  mergeProps
)(withTheme(DrawerMultiChild));
