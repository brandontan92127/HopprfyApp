/**
 * Created by InspireUI on 06/03/2017.
 *
 * @format
 */

import { flatten } from "lodash";
import { HorizonLayouts, Languages, Constants } from "@common";
// import { warn } from '@app/Omni'
// import { WooWorker } from "api-ecommerce";
import HopprWorker from "../services/HopprWorker";

const types = {
  LAYOUT_FETCH_SUCCESS: "LAYOUT_FETCH_SUCCESS",
  LAYOUT_FETCH_MORE: "LAYOUT_FETCH_MORE",
  LAYOUT_FETCHING: "LAYOUT_FETCHING",
  LAYOUT_ALL_FETCHING: "LAYOUT_ALL_FETCHING",
  LAYOUT_ALL_FETCH_SUCCESS: "LAYOUT_ALL_FETCH_SUCCESS",
};

export const actions = {
  //what does this actually do? wjere is it used? what SHOULD it be doing?
  fetchAllProductsLayout: async (dispatch, page = 1) => {
    dispatch({ type: types.LAYOUT_ALL_FETCHING });
    // console.debug(HorizonLayouts);

    console.debug("In layout redux what are these horzion array?");

    //make the call or request to get the category / laout mapping data from server
    // //WE DONT NEED THIS ANYMORE
    // let catNamesAndIds = await HopprWorker.getCategoryNamesAndIds();
    // console.debug("Got the cats and Ids, now map to layouts:" + catNamesAndIds);

    // const promises = [];
    // //this assigns the categories to the views
    // HorizonLayouts.map((layout, index) => {
    //   //assing each layout a category Id based on what the server says
    //   if (layout.hasOwnProperty("serverCatgoryEnumLink")) {
    //     let ourCatToAssign = catNamesAndIds[layout.serverCatgoryEnumLink];
    //     if (ourCatToAssign !== "undefined") {
    //       layout.category = ourCatToAssign;
    //     } else {
    //       throw new Error(
    //         "Couldn't assign a category correcty to the layouts - enum value:" +
    //           layout.serverCatgoryEnumLink
    //       );
    //     }
    //   }
    //   //end

    //   if (layout.layout != Constants.Layout.circle) {
    //     promises.push(
    //       dispatch(
    //         actions.fetchProductsLayout(
    //           dispatch,
    //           layout.category,
    //           layout.tag,
    //           page,
    //           index
    //         )
    //       )
    //     );
    //   } else {
    //     //if it's the circle layout, map through all those cats and assign like above
    //     layout.items.map((innerLayout, index) => {
    //       let ourCatToAssign =
    //         catNamesAndIds[innerLayout.serverCatgoryEnumLink];
    //       if (ourCatToAssign !== "undefined") {
    //         innerLayout.category = ourCatToAssign;
    //       } else {
    //         throw new Error(
    //           "Couldn't assign a category correcty to the inner layouts - enum value:" +
    //             innerLayout.serverCatgoryEnumLink
    //         );
    //       }
    //     });
    //   }
    // });
    // Promise.all(promises).then(data => {
    //   dispatch({ type: types.LAYOUT_ALL_FETCH_SUCCESS });
    // });
    dispatch({ type: types.LAYOUT_ALL_FETCH_SUCCESS });
  },
  fetchProductsLayout: (dispatch, category = "", tagId = "", page, index) => {
    console.debug(
      "About to dispatch request for products from server - classId: " +
        category
    );
    return (dispatch) => {
      dispatch({ type: types.LAYOUT_FETCHING, extra: { index } });

      //this is supposed to be get by tag - but let's just get the first 10 in the cat for now
      return HopprWorker.productsByCategoryTag(category, lat =null, lng = null).then(
        (response) => {
          if(response.status == 200)
          {
            let json = response.data;
            if (json === undefined) {
              dispatch(actions.fetchProductsFailure(Languages.getDataError));
            } else if (json.code) {
              dispatch(actions.fetchProductsFailure(json.message));
            } 
          }
          // let json = response.data.value;
          // if (json === undefined) {
          //   dispatch(actions.fetchProductsFailure(Languages.getDataError));
          // } else if (json.code) {
          //   dispatch(actions.fetchProductsFailure(json.message));
          // } else {
          //   dispatch({
          //     type:
          //       page > 1 ? types.LAYOUT_FETCH_MORE : types.LAYOUT_FETCH_SUCCESS,
          //     payload: json,
          //     extra: { index },
          //     finish: json.length === 0,
          //   });
          // }
        }
      );
    };
  },

  fetchProductsLayoutTagId: async (
    dispatch,
    categoryId = "",
    tagId = "",
    page,
    index
  ) => {
    dispatch({ type: types.LAYOUT_FETCHING, extra: { index } });
    const response = await HopprWorker.productsByCategoryTag(
      categoryId,
      lat = null,
      lng = null
    );

    if(response.status == 200)
    {
    let json = response.data;   
    if (json === undefined) {
      dispatch(actions.fetchProductsFailure(Languages.getDataError));
    } else if (json.code) {
      dispatch(actions.fetchProductsFailure(json.message));
    } else {
      dispatch({
        type: page > 1 ? types.LAYOUT_FETCH_MORE : types.LAYOUT_FETCH_SUCCESS,
        payload: json,
        extra: { index },
        finish: json.length === 0,
      });
    }
   }  
   else{
    dispatch(actions.fetchProductsFailure(Languages.getDataError));
   }
  },
  fetchProductsFailure: (error) => ({
    type: types.FETCH_PRODUCTS_FAILURE,
    error,
  }),
};

const initialState = {
  layout: HorizonLayouts,
  isFetching: false,
};

export const reducer = (state = initialState, action) => {
  const { extra, type, payload, finish } = action;

  switch (type) {
    case types.LAYOUT_ALL_FETCHING: {
      return {
        ...state,
        isFetching: true,
      };
    }

    case types.LAYOUT_ALL_FETCH_SUCCESS: {
      return {
        ...state,
        isFetching: false,
      };
    }

    case types.LAYOUT_FETCH_SUCCESS: {
      console.debug("We're in layout redux, fetch success with state:" + state);
      const layout = [];

      console.debug(
        "We're in layout redux, fetch success, about to cyle over the category array"
      );

      state.layout.map((item, index) => {
        if (index === extra.index) {
          layout.push({
            ...item,
            list: flatten(payload),
            isFetching: false,
          });
        } else {
          layout.push(item);
        }
      });
      return {
        ...state,
        layout,
      };
    }

    case types.LAYOUT_FETCH_MORE: {
      const layout = [];
      state.layout.map((item, index) => {
        if (index === extra.index) {
          layout.push({
            ...item,
            list: item.list.concat(payload),
            isFetching: false,
            finish,
          });
        } else {
          layout.push(item);
        }
      });
      return {
        ...state,
        layout,
      };
    }

    case types.LAYOUT_FETCHING: {
      const layout = [];
      state.layout.map((item, index) => {
        if (index === extra.index) {
          layout.push({
            ...item,
            isFetching: true,
          });
        } else {
          layout.push(item);
        }
      });
      return {
        ...state,
        layout,
      };
    }

    default:
      return state;
  }
};
