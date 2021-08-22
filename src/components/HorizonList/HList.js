/** @format */

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  I18nManager,
} from 'react-native';
import {Constants, Images, Languages, withTheme, GlobalStyle} from '@common';
import Icon from 'react-native-vector-icons/Entypo';
import {HorizonLayout} from '@components';
import {find} from 'lodash';
import styles from './styles';
import Categories from './Categories';
import ProductURLHelper from '../../services/ProductURLHelper';

class HorizonList extends PureComponent {
  static propTypes = {
    config: PropTypes.object,
    index: PropTypes.number,
    fetchPost: PropTypes.func,
    onShowAll: PropTypes.func,
    list: PropTypes.array,
    fetchProductsByCollections: PropTypes.func,
    setSelectedCategory: PropTypes.func,
    onViewProductScreen: PropTypes.func,
    showCategoriesScreen: PropTypes.func,
    collection: PropTypes.object,
  };

  constructor(props) {
    super(props);

    console.debug('In HLIST - doing work!!');
    this.page = 1;
    this.limit = Constants.pagingLimit;

    //these are default images if noting else shows up
    this.defaultList = [
      {
        _id: 1,
        name: Languages.loading,
        //images: [Images.PlaceHolder],
        images: ['https://booza.store:44300/images/testitems/stella.jpg'],
      },
      {
        _id: 2,
        name: Languages.loading,
        //images: [Images.PlaceHolder],
        images: ['https://booza.store:44300/images/testitems/stella.jpg'],
      },
      {
        _id: 3,
        name: Languages.loading,
        // images: [Images.PlaceHolder],
        images: ['https://booza.store:44300/images/testitems/stella.jpg'],
      },
    ];

    //subscribe to
  }

  //this sets the horizon layout categories to their API counterparts
  handleUpdatedCategoriesEvent() {}
  /**
   * handle load more
   */
  _nextPosts = () => {
    const {config, index, fetchPost, collection} = this.props;
    this.page += 1;
    if (!collection.finish) {
      fetchPost({config, index, page: this.page});
    }
  };

  _viewAll = () => {
    console.log("We're trying to View all in HList.js");

    const {
      config,
      onShowAll,
      index,
      list,
      fetchProductsByCollections,
      setSelectedCategory,
    } = this.props;

    const categoryWeWant = list.find(x => x._id == config.productClassId);
    // const selectedCategory =
    //   (list, (category) => category._id === config.productClassId);

    setSelectedCategory(categoryWeWant);
    fetchProductsByCollections(
      categoryWeWant._id,
      config.tag,
      this.page,
      index,
    );
    onShowAll(config, index);
  };

  showProductsByCategory = config => {
    console.debug("We're trying to show products by category in HList.js");

    const {
      onShowAll,
      index,
      list,
      fetchProductsByCollections,
      setSelectedCategory,
    } = this.props;

    //updated to use IDs
    const selectedCategory = find(
      list,
      category => category._id === config.category,
    );

    setSelectedCategory(selectedCategory);
    fetchProductsByCollections(config.category, config.tag, this.page, index);
    onShowAll(config, index);
  };

  onViewProductScreen = (product, type) => {
    this.props.onViewProductScreen({product, type});
  };

  renderItem = ({item, index}) => {
    const {layout} = this.props.config;

    if (item === null) return <View key="post_" />;
    return (
      <HorizonLayout
        product={item}
        key={'post-$' + index}
        onViewPost={() => this.onViewProductScreen(item, index)}
        layout={layout}
      />
    );
  };

  render() {
    const {
      showCategoriesScreen,
      collection,
      config,
      theme: {
        colors: {text},
      },
    } = this.props;

    const list =
      typeof collection.list !== 'undefined' && collection.list.length !== 0
        ? collection.list
        : this.defaultList;
    const isPaging = !!config.paging;

    //set some defaults
    let headerCatName = 'None';

    //try get productClass
    let theClass = this.props.list.find(x => x._id == config.productClassId);
    if (typeof theClass !== 'undefined') {
      //assign class vars when available
      headerCatName = theClass.name;
    }

    const renderHeader = () => (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text
            style={[
              styles.tagHeader,
              {color: GlobalStyle.hardLinkColor.color},
            ]}>
            {headerCatName}
            {/* {Languages[config.name]} */}
          </Text>
        </View>
        <TouchableOpacity
          onPress={
            config.layout != Constants.Layout.circle
              ? this._viewAll
              : showCategoriesScreen
          }
          style={styles.headerRight}>
          <Text
            style={[
              styles.headerRightText,
              {color: GlobalStyle.softLinkColor.color, fontWeight: '800'},
            ]}>
            {'WHOLE MENU'}
          </Text>
          <Icon
            style={[styles.icon, {opacity: 1}]}
            color={GlobalStyle.softLinkColor.color}
            size={20}
            name={
              I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
            }
          />
        </TouchableOpacity>
      </View>
    );

    if (config.layout == Constants.Layout.circle) {
      console.debug('rendering circle');

      console.debug('Config');
      console.debug(config);

      //THIS NOW NEEDS TO TAKE EVERYTHING!!! ALL CONFIGS BAR ITSELF
      //OR IN SUBVIEW NEEDS TO SHOW EVERYTHING THAT 'ISN'T CIRCLE'
      return (
        <Categories
          categories={this.props.list}
          items={config.items}
          onPress={this.showProductsByCategory}
        />
      );
    }

    //assign default or 'the products'
    let listOfProdsForThisClass =
      typeof theClass.Products !== 'undefined' && theClass.Products.length !== 0
        ? theClass.Products
        : this.defaultList;

    return (
      <View style={[styles.flatWrap]}>
        {theClass.name && renderHeader()}
        {config.layout != Constants.Layout.circle && (
          <FlatList
            contentContainerStyle={styles.flatlist}
            data={listOfProdsForThisClass}
            keyExtractor={item => `post__${item._id}`}
            renderItem={this.renderItem}
            showsHorizontalScrollIndicator={false}
            horizontal
            pagingEnabled={isPaging}
            onEndReached={false && this._nextPosts}
          />
        )}
      </View>
    );
  }
}

export default withTheme(HorizonList);
