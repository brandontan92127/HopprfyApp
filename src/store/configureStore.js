import { Platform } from "react-native";
import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";
import reducers from "@redux";
import { Constants } from "@common";
import { connectConsoleToReactotron } from "@app/Omni";
import "./../../ReactotronConfig";
import { composeWithDevTools } from "redux-devtools-extension";

const middleware = [
  thunk,
  // more middleware
];

// const store = createStore(reducers, {}, applyMiddleware(...middleware));

const configureStore = () => {
  let store = null;

  if (__DEV__) {
    // if (Constants.useReactotron) {
    //   store = Reactotron.createStore(
    //     reducers,
    //     {},
    //     applyMiddleware(...middleware)
    //   );
    //   connectConsoleToReactotron();
    // } else {
    {
      console.debug("Configure store: adding redux devtools extension");
      // const composeEnhancers =
      //   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
      // store = composeEnhancers(applyMiddleware(...middleware))(createStore)(
      //   reducers
      // );

      store = createStore(
        reducers,
        composeWithDevTools(
          applyMiddleware(...middleware)
          // other store enhancers if any
        )
      );

      // store = composeWithDevTools(applyMiddleware(...middleware))(createStore)(
      //   reducers
      // );

      if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept(reducers, () => {
          const nextRootReducer = reducers;
          store.replaceReducer(nextRootReducer);
        });
      }

      // show network react-native-debugger
      // only show on IOS, android bug
      // if (Platform.OS === "ios") {
      //   global.XMLHttpRequest = global.originalXMLHttpRequest
      //     ? global.originalXMLHttpRequest
      //     : global.XMLHttpRequest;
      //   global.FormData = global.originalFormData
      //     ? global.originalFormData
      //     : global.FormData;
      // }
    }
  } else {
    console.debug = () => {}; //remove all console.debugs
    store = compose(applyMiddleware(...middleware))(createStore)(reducers);
  }
  return store;
};

export default configureStore();
