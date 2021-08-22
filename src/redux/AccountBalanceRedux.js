/**
 * Created by Nadz on 16/01/2019.
 *
 * @format
 */

import { Config } from "@common";
// import { warn } from '@app/Omni'
import PlatformApiClient from "../services/PlatformApiClient";
import HopprWorker from "../services/HopprWorker";

const types = {
  FETCH_ACCOUNT_BALANCE_PENDING: "FETCH_ACCOUNT_BALANCE_PENDING",
  FETCH_ACCOUNT_BALANCE_SUCCESS: "FETCH_ACCOUNT_BALANCE_SUCCESS",
  FETCH_ACCOUNT_BALANCE_FAILURE: "FETCH_ACCOUNT_BALANCE_FAILURE",
};

export const actions = {
  fetchAccountBalance: (dispatch, accountBalance) => {
    console.debug("WE HIT FETCH ACCOUNT BALANCE");
    dispatch({ type: types.FETCH_ACCOUNT_BALANCE_PENDING });

    console.debug(
      "Getting AccountBalanceInfo now from server in accountbalance redux"
    );

    if (accountBalance === undefined) {
      dispatch(
        actions.fetchAccountBalanceFailure(
          "Can't get FETCH_ACCOUNT_BALANCE data from server"
        )
      );
    } else {
      dispatch(actions.fetchAccountBalanceSuccess(accountBalance));
    }
  },
  fetchAccountBalanceSuccess: (accountBalance) => {
    return { type: types.FETCH_ACCOUNT_BALANCE_SUCCESS, accountBalance };
  },
  fetchAccountBalanceFailure: (error) => {
    return { type: types.FETCH_ACCOUNT_BALANCE_FAILURE, error };
  },
};

const initialState = {
  isFetching: false,
  accountBalance: {
    balance: "Unknown",
    latestTranAmount: "0.00",
    latestTranType: "None",
    latestTranDate: "None",
  },
};

//this actual reducer that saves state based on result
export const reducer = (state = initialState, action) => {
  const { type, accountBalance } = action;

  switch (type) {
    case types.FETCH_ACCOUNT_BALANCE_PENDING: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case types.FETCH_ACCOUNT_BALANCE_SUCCESS: {
      console.debug(
        "In category redux, we successfully fetched account balance"
      );
      return {
        ...state,
        isFetching: false,
        accountBalance: accountBalance,
      };
    }
    case types.FETCH_ACCOUNT_BALANCE_FAILURE: {
      return {
        ...state,
        isFetching: false,
        error: "Failed",
      };
    }
    default: {
      return state;
    }
  }
};
