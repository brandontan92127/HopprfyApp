/** @format */

import Images from './Images';
import Constants from './Constants';
import Icons from './Icons';
import GlobalStyle from './GlobalStyle';

const InAppName = 'Hopprfy';

export default {
  //PER APP - each needs it's own sset
  InstanceDeploymentVariables: {
    Hopperfy: {
      TopAppLogo: require('@images/hopperfy/topLogo.png'),
      SecondaryTopAppLogo: require('@images/hopperfy/logo400_2.png'),
      MainAppLogo: require('@images/hopperfy/mainLogo1024.png'),
      LoginLogo: require('@images/hopperfy/Final-Logo.png'),
      AppNetworkPlaceHolder: require('@images/hopperfy/mainLogo1024.png'),
      //TrackOrderNoOrderNetwork:require("@images/hopperfy/blackBunny.png"),
      TrackOrderNoOrderNetwork: require('@images/hopperfy/Final-Logo-White.png'),
    }, 
    Booza: {
      TopAppLogo: Images.BoozaLogo400,
      MainAppLogo: Images.BoozaBig,
    },
  },
  InAppName: InAppName,
  ToastsEnabled: false,
  HopprExplainerVideo: 'https://booza.store:44300/video/order.mp4',
  _2yu: {
    networkIdOnHopprServer: '70680422-69a2-e911-8100-00155d5eb736',
  },
  IconImage1PlaceholderBaseUrl:
    'https://booza.store:44300/images/Icons/addPicture.png',
  IconImage2PlaceholderBaseUrl:
    'https://booza.store:44300/images/Icons/addPicture1.png',
  IconImage3PlaceholderBaseUrl:
    'https://booza.store:44300/images/Icons/addPicture2.png',
  NetworkImageBaseUrl: 'https://booza.store:44300/images/NetworkLogos/',
  PlatformBaseUrl: 'https://booza.store:44300/',
  CustomerWebPlatformBaseUrl: 'https://hopprfy.com/',
  ProductBaseUrl: 'https://booza.store:44300/',
  ProductClassIconBaseUrl: 'https://booza.store:44300/',
  ProductClassImageBaseUrl: 'https://booza.store:44300/',
  ProductClassIconDefault:
    'https://booza.store:44300/images/ClientCategoryIcons/Default/burger.png',

  YourBrandHere: 'https://booza.store:44300/Images/Misc/yourBrandHere.png',

  HopprStripe: {
    //emailnadz
    // PKTest: "pk_test_1wgiAM2CRDiT5Hemyfqkv127",
    // PKLive: "pk_live_2wdgQMqZzfYFvZQoWH6uYm1G",

    PKTest: '',
    PKLive:
      'pk_live_51HooelB7ZPHMbUp1weKJUohZXSYYFTXvW5Eowrq2vhLQiXeFvkBFhcZWlllqccDJ5LmDys6lLRtfrkI3z1tct2Vw003MzTJ3Ke',
  },
  /**
     Used for Google Directions API - same as in android manifest
     */
  GoogleMapsDirectionAPIKey: 'AIzaSyC9LgRyzJ-65a8eZNUdszrhTJ5ci90MmVA',

  NotificationWebsocketURLDev: 'wss://localhost:8381/',
  NotificationWebsocketURLLive: 'wss://booza.store:8381/',
  NotificationWebsocketURLLiveAlt: 'wss://130.193.90.122:8381/',

  /**TIMERS  */
  DriverModals: {
    requestModalWaitTime: 60000, //milliseconds
  },
  AccountBalance: {
    updateFromApiTime: 60000, //milliseconds
  },

  //END TIMERS

  WooCommerce: {
    url: 'http://mstore.io',
    consumerKey: 'ck_b7594bc4391db4b56c635fe6da1072a53ca4535a',
    consumerSecret: 'cs_980b9edb120e15bd2a8b668cacc734f7eca0ba40',
  },

  /**
     Step 2: Setting Product Images
     - ProductSize: Explode the guide from: update the product display size: https://mstore.gitbooks.io/mstore-manual/content/chapter5.html
     The default config for ProductSize is disable due to some problem config for most of users.
     If you have success config it from the Wordpress site, please enable to speed up the app performance
     - HorizonLayout: Change the HomePage horizontal layout - https://mstore.gitbooks.io/mstore-manual/content/chapter6.html
       Update Oct 06 2018: add new type of categories
       NOTE: name is define value --> change field in Language.js
     */
  ProductSize: {
    enable: false,
    CatalogImages: {width: 300, height: 360},
    SingleProductImage: {width: 600, height: 720},
    ProductThumbnails: {width: 180, height: 216},
  },
  TimeAndDistance: {
    avgDriverSpeedKM_H: 12.8,
  },
  //NB SERVER RETURNS CATEGORIES LOWER CASE!!!
  HorizonLayout: [
    // Update 07 Oct 2018: support more Banner layout, HTML, category
    {
      serverCatgoryEnumLink: 'whiskey_and_Bourbon',
      category: '5c1e805752be321da09681b5',
      layout: Constants.Layout.BannerHigh,
    },
    //these are the horizontal layout circle icons
    {
      layout: Constants.Layout.circle,
      items: [
        {
          serverCatgoryEnumLink: 'beer',
          category: '5c1bcfc752be331764aebcfc',
          image: require('@images/2yu_categories/beer.png'),
          colors: ['#6a11cb', '#2575fc'],
          name: 'Beers',
        },
        {
          serverCatgoryEnumLink: 'pre_mixed',
          category: '5c1bcfc752be331764aebcfc',
          image: require('@images/2yu_categories/premixed.png'),
          colors: ['#7F00FF', '#E100FF'],
          name: 'Premixed',
        },
        {
          serverCatgoryEnumLink: 'rum',
          category: '5c1bcfc752be331764aebcfa',
          image: require('@images/2yu_categories/rum.png'),
          colors: ['#43a97b', '#98fad7'],
          name: 'Rums',
        },
        {
          serverCatgoryEnumLink: 'tobacco',
          category: '5c1bcfc752be331764aebcfc',
          image: require('@images/2yu_categories/cigarette.png'),
          colors: ['#30cfd0', '#330867'],
          name: 'Tobacco',
        },
        {
          serverCatgoryEnumLink: 'vodka',
          category: '5c1bcfc752be331764aebcfc',
          image: require('@images/2yu_categories/vodka.png'),
          colors: ['#E13A1F', '#309efd'],
          name: 'Vodkas',
        },
        {
          serverCatgoryEnumLink: 'sparkling_Wine',
          category: '5c1bcfc752be331764aebcfc',
          image: require('@images/2yu_categories/champagne.png'),
          colors: ['#2af598', '#009efd'],
          name: 'Sparkling',
        },
        {
          serverCatgoryEnumLink: 'whiskey_and_Bourbon',
          category: '5c1bcfc752be331764aebcfa',
          image: require('@images/2yu_categories/whiskey.png'),
          colors: ['#45eb7b', '#58e9d2'],
          name: 'Whiskey',
        },

        {
          serverCatgoryEnumLink: 'tequila',
          category: '5c1bcfc752be331764aebcf9',
          image: require('@images/2yu_categories/tequila.png'),
          colors: ['#4fadfe', '#00b2fe'],
          name: 'Tequilas',
        },
        {
          serverCatgoryEnumLink: 'red_Wine',
          category: '5c1bcfc752be331764aebcfc',
          image: require('@images/2yu_categories/wine.png'),
          colors: ['#2af598', '#009efd'],
          name: 'Red Wine',
        },
        {
          serverCatgoryEnumLink: 'white_Wine',
          category: '5c1bcfc752be331764aebcfc',
          image: require('@images/2yu_categories/whiteWine.png'),
          colors: ['#2af598', '#009efd'],
          name: 'White Wine',
        },
        {
          serverCatgoryEnumLink: 'gin',
          category: '5c1bcfc752be331764aebcfc',
          image: require('@images/2yu_categories/gin.png'),
          colors: ['#2af598', '#009efd'],
          name: 'Gins',
        },
        {
          serverCatgoryEnumLink: 'soft_Drinks',
          category: '5c1bcfc752be331764aebcfb',
          image: require('@images/2yu_categories/cola.png'),
          colors: ['#fa709a', '#fee140'],
          name: 'Soft Drinks',
        },
        {
          serverCatgoryEnumLink: 'snacks',
          category: '5c1bcfc752be331764aebcfc',
          image: require('@images/2yu_categories/chips.png'),
          colors: ['#7F00FF', '#E100FF'],
          name: 'Snacks',
        },
      ],
    },
    {
      serverCatgoryEnumLink: 'tequila',
      name: 'Tequillas',
      image: Images.Banner.Feature,
      layout: Constants.Layout.twoColumnHigh,
    },
    {
      serverCatgoryEnumLink: 'rum',
      name: 'Rum',
      image: Images.Banner.Bag,
      layout: Constants.Layout.threeColumn,
    },
    {
      serverCatgoryEnumLink: 'beer',
      name: 'Beer',
      image: Images.Banner.Feature,
      layout: Constants.Layout.twoColumnHigh,
    },
    {
      serverCatgoryEnumLink: 'cider',
      name: 'Cider',
      image: Images.Banner.Feature,
      layout: Constants.Layout.threeColumn,
    },

    {
      serverCatgoryEnumLink: 'brandy_and_Cognac',
      name: 'Brandy and Cognac',
      category: '5c1e805752be321da09681b5',
      image: Images.Banner.Bag,
      layout: Constants.Layout.twoColumnHigh,
    },
    {
      serverCatgoryEnumLink: 'red_Wine',
      name: 'Red Wine',
      image: Images.Banner.Woman,
      layout: Constants.Layout.threeColumn,
    },
    {
      serverCatgoryEnumLink: 'whiskey_and_Bourbon',
      name: 'Whiskey And Bourbon',
      image: Images.Banner.Man,
      layout: Constants.Layout.horizon,
    },
    {
      serverCatgoryEnumLink: 'liqueur_and_Vermouth',
      name: 'Liqueur and Vermouth',
      image: Images.Banner.Man,
      layout: Constants.Layout.twoColumn,
    },
    {
      serverCatgoryEnumLink: 'vodka',
      name: 'Vodka',
      image: Images.Banner.Man,
      layout: Constants.Layout.threeColumn,
    },
    {
      serverCatgoryEnumLink: 'soft_Drinks',
      name: 'Soft Drinks',
      image: Images.Banner.Man,
      layout: Constants.Layout.horizon,
    },
    {
      serverCatgoryEnumLink: 'tobacco',
      name: 'Tobacco',
      category: '5c1e805752be321da09681b8',
      image: Images.Banner.Man,
      layout: Constants.Layout.threeColumn,
    },
    {
      serverCatgoryEnumLink: 'gin',
      name: 'Gins',
      category: '5c1e805752be321da09681b8',
      image: Images.Banner.Man,
      layout: Constants.Layout.twoColumnHigh,
    },
    {
      serverCatgoryEnumLink: 'sparkling_Wine',
      name: 'Sparkling Wine',
      image: Images.Banner.Man,
      layout: Constants.Layout.simple,
    },
    {
      serverCatgoryEnumLink: 'sweet_Wine',
      name: 'Sweet Wine',
      image: Images.Banner.Man,
      layout: Constants.Layout.twoColumnHigh,
    },
    {
      serverCatgoryEnumLink: 'white_Wine',
      name: 'White Wine',
      category: '5c1e805752be321da09681b8',
      image: Images.Banner.Man,
      layout: Constants.Layout.threeColumn,
    },
    {
      serverCatgoryEnumLink: 'alcohol_Free',
      name: 'Alcohol Free',
      image: Images.Banner.Man,
      layout: Constants.Layout.threeColumn,
    },
    {
      serverCatgoryEnumLink: 'pre_mixed',
      name: 'Pre Mixed',
      image: Images.Banner.Man,
      layout: Constants.Layout.twoColumnHigh,
    },
    {
      serverCatgoryEnumLink: 'rose_Wine',
      name: 'Rose Wine',
      image: Images.Banner.Man,
      layout: Constants.Layout.threeColumn,
    },
    {
      serverCatgoryEnumLink: 'snacks',
      name: 'Snacks',
      image: Images.Banner.Man,
      layout: Constants.Layout.threeColumn,
    },
    {
      serverCatgoryEnumLink: 'tea_Coffee_Hot_Drinks',
      name: 'Tea / Coffee / Hot Drinks',
      image: Images.Banner.Man,
      layout: Constants.Layout.twoColumnHigh,
    },
  ],

  /**
     step 3: Config image for the Payment Gateway
     Notes:
     - Only the image list here will be shown on the app but it should match with the key id from the WooCommerce Website config
     - It's flexible way to control list of your payment as well
     Ex. if you would like to show only cod then just put one cod image in the list
     * */
  Payments: {
    // bacs: require("@images/payment_logo/PayPal.png"),
    cod: require('@images/payment_logo/cash_on_delivery.png'),
    paypal: require('@images/payment_logo/PayPal.png'),
    stripe: require('@images/payment_logo/stripe.png'),
  },

  /**
     Step 4: Advance config:
     - showShipping: option to show the list of shipping method
     - showStatusBar: option to show the status bar, it always show iPhoneX
     - LogoImage: The header logo
     - LogoWithText: The Logo use for sign up form
     - LogoLoading: The loading icon logo
     - appFacebookId: The app facebook ID, use for Facebook login
     - CustomPages: Update the custom page which can be shown from the left side bar (Components/Drawer/index.js)
     - WebPages: This could be the id of your blog post or the full URL which point to any Webpage (responsive mobile is required on the web page)
     - CategoryListView: default layout for category (true/false)
     - intro: The on boarding intro slider for your app
     - menu: config for left menu side items (isMultiChild: This is new feature from 3.4.5 that show the sub products categories)
     * */
  shipping: {
    visible: true,
    time: {
      free_shipping: '4 - 7 Days',
      flat_rate: '1 - 4 Days',
      local_pickup: '1 - 4 Days',
    },
  },
  showStatusBar: false,

  LogoImage: require('@images/logo-main.png'),
  // LogoWithText: require("@images/logo_with_text.png"),
  LogoWithText: require('@images/hopprLogos/HopprLogoSmall4.png'),
  LogoLoading: require('@images/logo.png'),
  BoozaLogo: require('@images/hopprLogos/HopprLogoSmall4.png'),
  NewHopprCenteredLogo: require('@images/hopprLogos/HopprMiddleLogoStandard.png'),
  NewHopprCenteredLogoExtended: require('@images/hopprLogos/HopprMiddleLogoStandardExtended.png'),

  showAdmobAds: false,
  AdMob: {
    deviceID: 'pub-2101182411274198',
    unitID: 'ca-app-pub-2101182411274198/4100506392',
    unitInterstitial: 'ca-app-pub-2101182411274198/8930161243',
    isShowInterstital: true,
  },
  RegistrationEndpoints: {
    driver: 'SignUpToPlatform/SignUpDriver',
    customer: 'SignUpToPlatform/SignUpNormalUser',
    store: 'SignUpToPlatform/SignUpConnect',
  },
  appFacebookId: '422035778152242',
  CustomPages: {contact_id: 10941},
  WebPages: {marketing: 'https://booza.store'},

  intro: [
    {
      key: 'page1',
      title: 'Welcome to ' + InAppName,
      text: 'The one stop end-to-end super-local delivery service and e-commerce marketplace. Completely secure. Buy, sell, deliver.',
      icon: 'md-business',
      useImage: true,
      imageSource: Images.Intro.Page1,
      colors: [
        GlobalStyle.introColorBlue.color,
        GlobalStyle.introColorPink.color,
      ],
    },
    {
      key: 'page2',
      title: 'Super fast delivery',
      text: "Order now, get your item delivered within 30 mins! Doesn't matter what it is!! Need to send an item? Create your own delivery!",
      useImage: true,
      imageSource: Images.Intro.Page2,
      colors: [
        GlobalStyle.introColorBlue.color,
        GlobalStyle.introColorPink.color,
      ],
    },
    {
      key: 'page3',
      title: 'Open your own network of stores now!',
      text: 'Start earning money today.',
      useImage: true,
      imageSource: Images.Intro.Page3,
      colors: [
        GlobalStyle.introColorBlue.color,
        GlobalStyle.introColorPink.color,
      ],
    },
  ],

  /**
   * Config For Left Menu Side Drawer
   * @param goToScreen 3 Params (routeName, params, isReset = false)
   * BUG: Language can not change when set default value in Config.js ==> pass string to change Languages
   */
  menu: {
    // has child categories
    isMultiChild: true,
    // Unlogged
    listMenuUnlogged: [
      {
        text: 'Login',
        routeName: 'LoginScreen',
        params: {
          isLogout: false,
        },
        icon: Icons.MaterialCommunityIcons.SignIn,
      },
    ],
    // user logged in
    listMenuLogged: [
      {
        text: 'Logout',
        routeName: 'LoginScreen',
        params: {
          isLogout: true,
        },
        icon: Icons.MaterialCommunityIcons.SignOut,
      },
    ],
    // Default List
    listMenu: [
      {
        text: 'Shop',
        routeName: 'Default',
        icon: Icons.MaterialCommunityIcons.Home,
      },
      // {
      //   text: "News",
      //   routeName: "NewsScreen",
      //   icon: Icons.MaterialCommunityIcons.News,
      // },
      {
        text: 'About ' + InAppName,
        routeName: 'CustomPage',
        params: {
          url: 'https://hopprfy.com/',
        },
        icon: Icons.MaterialCommunityIcons.Email,
      },
      {
        text: 'Create New Account',
        routeName: 'RegisterAsCustomerScreen',
        icon: Icons.MaterialCommunityIcons.StarOutline,
      },
      // {
      //   text: "contactus",
      //   routeName: "CustomPage",
      //   params: {
      //     id: 10941,
      //     title: "contactus",
      //   },
      //   icon: Icons.MaterialCommunityIcons.Pin,
      // },
      {
        text: 'Terms and Conditions',
        routeName: 'CustomPage',
        params: {
          url: 'https://hopprfy.com/LegalStuff/TermsAndConditions',
        },
        icon: Icons.MaterialCommunityIcons.Email,
      },
    ],
  },

  // define menu for profile tab
  ProfileSettings: [
    // {
    //   label: "MyOrder",
    //   routeName: "MyOrders",
    // },
    // {
    //   label: "RegisterAsDriver",
    //   routeName: "RegisterAsDriverScreen",
    // },
    // {
    //   label: "RegisterAsStore",
    //   routeName: "RegisterAsStoreScreen",
    // },
    // {
    //   label: "Address",
    //   routeName: "Address",
    // },
    // {
    //   label: "Currency",
    //   isActionSheet: true,
    // },
    // // only support mstore pro
    // {
    //   label: "Languages",
    //   routeName: "SettingScreen",
    // },
    // {
    //   label: "PushNotification",
    // },
    // {
    //   label: "contactus",
    //   routeName: "CustomPage",
    //   params: {
    //     id: 10941,
    //     title: "contactus",
    //   },
    // },
    // {
    //   label: "Privacy",
    //   routeName: "CustomPage",
    //   params: {
    //     url: "https://inspireui.com/privacy",
    //   },
    // },
    // {
    //   label: "termCondition",
    //   routeName: "CustomPage",
    //   params: {
    //     url: "https://booza.store",
    //   },
    // },
    // {
    //   label: "About",
    //   routeName: "CustomPage",
    //   params: {
    //     url: "https://booza.store",
    //   },
    // },
  ],

  // Homepage Layout setting
  layouts: [
    {
      layout: Constants.Layout.card,
      image: Images.icons.iconCard,
      text: 'cardView',
    },
    {
      layout: Constants.Layout.simple,
      image: Images.icons.iconRight,
      text: 'simpleView',
    },
    {
      layout: Constants.Layout.twoColumn,
      image: Images.icons.iconColumn,
      text: 'twoColumnView',
    },
    {
      layout: Constants.Layout.threeColumn,
      image: Images.icons.iconThree,
      text: 'threeColumnView',
    },
    {
      layout: Constants.Layout.horizon,
      image: Images.icons.iconHorizal,
      text: 'horizontal',
    },
    {
      layout: Constants.Layout.advance,
      image: Images.icons.iconAdvance,
      text: 'advanceView',
    },
  ],

  // Default theme loading, this could able to change from the user profile (reserve feature)
  Theme: {
    isDark: false,
  },

  // new list category design
  CategoryListView: true,

  DefaultCurrency: {
    symbol: '£',
    name: 'Pound Sterling',
    code: 'GBP',
    name_plural: 'pounds',
    decimal: '.',
    thousand: ',',
    precision: 2,
    format: '%s%v', // %s is the symbol and %v is the value
  },

  DefaultCountry: {
    code: 'en',
    RTL: false, // em move config tu ben Constanst qua day de user ho de su dung
    language: 'English',
    countryCode: 'US',
    hideCountryList: false, // when this option is try we will hide the country list from the checkout page, default select by the above 'countryCode'
  },
  HideCartAndCheckout: false,

  MapThemes: {
    DefaultMapTheme: [
      {
        elementType: 'labels',
        stylers: [
          {
            visibility: 'off',
          },
          {
            color: '#f49f53',
          },
        ],
      },
      {
        featureType: 'landscape',
        stylers: [
          {
            color: '#f9ddc5',
          },
          {
            lightness: -7,
          },
        ],
      },
      {
        featureType: 'road',
        stylers: [
          {
            color: '#813033',
          },
          {
            lightness: 43,
          },
        ],
      },
      {
        featureType: 'poi.business',
        stylers: [
          {
            color: '#645c20',
          },
          {
            lightness: 38,
          },
        ],
      },
      {
        featureType: 'water',
        stylers: [
          {
            color: '#1994bf',
          },
          {
            saturation: -69,
          },
          {
            gamma: 0.99,
          },
          {
            lightness: 43,
          },
        ],
      },
      {
        featureType: 'road.local',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#f19f53',
          },
          {
            weight: 1.3,
          },
          {
            visibility: 'on',
          },
          {
            lightness: 16,
          },
        ],
      },
      {
        featureType: 'poi.business',
      },
      {
        featureType: 'poi.park',
        stylers: [
          {
            color: '#645c20',
          },
          {
            lightness: 39,
          },
        ],
      },
      {
        featureType: 'poi.school',
        stylers: [
          {
            color: '#a95521',
          },
          {
            lightness: 35,
          },
        ],
      },
      {},
      {
        featureType: 'poi.medical',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#813033',
          },
          {
            lightness: 38,
          },
          {
            visibility: 'off',
          },
        ],
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        elementType: 'labels',
      },
      {
        featureType: 'poi.sports_complex',
        stylers: [
          {
            color: '#9e5916',
          },
          {
            lightness: 32,
          },
        ],
      },
      {},
      {
        featureType: 'poi.government',
        stylers: [
          {
            color: '#9e5916',
          },
          {
            lightness: 46,
          },
        ],
      },
      {
        featureType: 'transit.station',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'transit.line',
        stylers: [
          {
            color: '#813033',
          },
          {
            lightness: 22,
          },
        ],
      },
      {
        featureType: 'transit',
        stylers: [
          {
            lightness: 38,
          },
        ],
      },
      {
        featureType: 'road.local',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#f19f53',
          },
          {
            lightness: -10,
          },
        ],
      },
      {},
      {},
      {},
    ],
    SecondaryMapTheme: [
      {
        featureType: 'all',
        elementType: 'geometry.fill',
        stylers: [
          {
            weight: '2.00',
          },
        ],
      },
      {
        featureType: 'all',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#9c9c9c',
          },
        ],
      },
      {
        featureType: 'all',
        elementType: 'labels.text',
        stylers: [
          {
            visibility: 'on',
          },
        ],
      },
      {
        featureType: 'landscape',
        elementType: 'all',
        stylers: [
          {
            color: '#f2f2f2',
          },
        ],
      },
      {
        featureType: 'landscape',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#ffffff',
          },
        ],
      },
      {
        featureType: 'landscape.man_made',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#ffffff',
          },
        ],
      },
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'all',
        stylers: [
          {
            saturation: -100,
          },
          {
            lightness: 45,
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#eeeeee',
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#7b7b7b',
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.stroke',
        stylers: [
          {
            color: '#ffffff',
          },
        ],
      },
      {
        featureType: 'road.highway',
        elementType: 'all',
        stylers: [
          {
            visibility: 'simplified',
          },
        ],
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.icon',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'all',
        stylers: [
          {
            color: '#46bcec',
          },
          {
            visibility: 'on',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#c8d7d4',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#070707',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [
          {
            color: '#ffffff',
          },
        ],
      },
    ],

    ThirdMapTheme: [
      {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#ffffff',
          },
        ],
      },
      {
        featureType: 'all',
        elementType: 'labels.text.stroke',
        stylers: [
          {
            color: '#000000',
          },
          {
            lightness: 13,
          },
        ],
      },
      {
        featureType: 'administrative',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#000000',
          },
        ],
      },
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#144b53',
          },
          {
            lightness: 14,
          },
          {
            weight: 1.4,
          },
        ],
      },
      {
        featureType: 'landscape',
        elementType: 'all',
        stylers: [
          {
            color: '#08304b',
          },
        ],
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
          {
            color: '#0c4152',
          },
          {
            lightness: 5,
          },
        ],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#000000',
          },
        ],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#0b434f',
          },
          {
            lightness: 25,
          },
        ],
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#000000',
          },
        ],
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#0b3d51',
          },
          {
            lightness: 16,
          },
        ],
      },
      {
        featureType: 'road.local',
        elementType: 'geometry',
        stylers: [
          {
            color: '#000000',
          },
        ],
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [
          {
            color: '#146474',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'all',
        stylers: [
          {
            color: '#021019',
          },
        ],
      },
    ],
    FourthMapTheme: [
      {
        featureType: 'water',
        stylers: [
          {
            saturation: 43,
          },
          {
            lightness: -11,
          },
          {
            hue: '#0088ff',
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: [
          {
            hue: '#ff0000',
          },
          {
            saturation: -100,
          },
          {
            lightness: 99,
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#808080',
          },
          {
            lightness: 54,
          },
        ],
      },
      {
        featureType: 'landscape.man_made',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#ece2d9',
          },
        ],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#ccdca1',
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#767676',
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.stroke',
        stylers: [
          {
            color: '#ffffff',
          },
        ],
      },
      {
        featureType: 'poi',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry.fill',
        stylers: [
          {
            visibility: 'on',
          },
          {
            color: '#b8cb93',
          },
        ],
      },
      {
        featureType: 'poi.park',
        stylers: [
          {
            visibility: 'on',
          },
        ],
      },
      {
        featureType: 'poi.sports_complex',
        stylers: [
          {
            visibility: 'on',
          },
        ],
      },
      {
        featureType: 'poi.medical',
        stylers: [
          {
            visibility: 'on',
          },
        ],
      },
      {
        featureType: 'poi.business',
        stylers: [
          {
            visibility: 'simplified',
          },
        ],
      },
    ],
  },
  FifthMapTheme: [
    {
      featureType: 'landscape.natural',
      elementType: 'geometry.fill',
      stylers: [
        {
          visibility: 'on',
        },
        {
          color: '#e0efef',
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'geometry.fill',
      stylers: [
        {
          visibility: 'on',
        },
        {
          hue: '#1900ff',
        },
        {
          color: '#c0e8e8',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        {
          lightness: 100,
        },
        {
          visibility: 'simplified',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'labels',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [
        {
          visibility: 'on',
        },
        {
          lightness: 700,
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'all',
      stylers: [
        {
          color: '#7dcdcd',
        },
      ],
    },
  ],
  SixthMapTheme: [
    {
      featureType: 'all',
      elementType: 'all',
      stylers: [
        {
          invert_lightness: true,
        },
        {
          saturation: 10,
        },
        {
          lightness: 30,
        },
        {
          gamma: 0.5,
        },
        {
          hue: '#435158',
        },
      ],
    },
  ],
};
