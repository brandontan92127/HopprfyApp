// import {AppRegistry} from 'react-native';
// import App from './App';
// import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

import React from 'react';
import ReduxWrapper from './src/ReduxWrapper';
import Home from './src/containers/Home';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => ReduxWrapper);
setJSExceptionHandler((error, isFatal) => {
  alert(
    'Sorry, there was an unhandled problem:' +
      error.name +
      ' ' +
      error.message +
      ' -- Stack trace:' +
      error.stack,
  );
});
