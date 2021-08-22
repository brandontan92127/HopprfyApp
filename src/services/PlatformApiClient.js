import axios from 'axios';
import ApiRoutes from '../routing/ApiRoutes';
import {Component} from 'react';
// const uuid = require("react-native-uuid");
import uuid from 'react-native-uuid';

const PlatformApiClient = class {
  //these should all be props wired up to redux state
  //every time they are mutated by any method need to dispatch to redux
  //need a reducer to handle every piece of data updated
  constructor(token = null) {
    this.baseUrlEndpoint = ApiRoutes.apiBaseUrlLive;
    this.login = '';
    this.password = '';
    this.userAccessToken = '';
    this.isLoggedIn = false;

    if (token == null) {
      this.setupNoTokenDefaultAxiosClient();
    } else {
      this.setupAxiosClient(token);
    }

    //check if token is not blank / expired, if it is get new token
  }

  loginToApi = async (username, password) => {
    that = this;
    console.debug('Logging in to api');

    let tokenResponse = await that.getUserTokenFromApi(username, password);

    that.setupAxiosClient(tokenResponse.data.access_token);
    this.userAccessToken = tokenResponse.data.access_token;
    this.isLoggedIn = true;
    return tokenResponse;
  };

  registerWithApi = async (
    username,
    password,
    first_name,
    lastname,
    networkguid,
  ) => {
    that = this;
    console.debug('Registering with api');

    let regJSon = {
      Email: username,
      first_name: first_name,
      LastName: lastname,
      Password: password,
      ConfirmPassword: password,
      NetworkGuid: networkguid,
    };

    let config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    let regiRoute = this.baseUrlEndpoint + 'accounts/register';

    await axios
      .post(regiRoute, regJSon, config)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        //tell user couldn't register
        console.debug(error);
      });
  };

  _generateIdempotencyHeader = () => {
    console.debug('generting idempotency header');
    const idHeader = this.idempotencyHeader;
    var randomGuid = uuid.v4;
    return {
      headers: {'X-Request-ID': randomGuid},
    };
  };

  setupAxiosClient = bearerToken => {
    let that = this;
    that.axiosClient = axios.create({
      baseURL: this.baseUrlEndpoint,
      timeout: 145000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + bearerToken,
      },
    });
    console.debug('Axios token client was setup with bearer:' + bearerToken);
    return;
  };

  setupNoTokenDefaultAxiosClient = () => {
    let that = this;
    that.axiosClient = axios.create({
      baseURL: this.baseUrlEndpoint,
      timeout: 145000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.debug('Axios no token client was setup');
    return;
  };

  // //todo: this is NOT a json call it's a x-www-form call
  getUserTokenFromApi = async (username, password) => {
    //makes grant request call
    let grantRequestString =
      'grant_type=password&username=' + username + '&password=' + password;

    //login one time config as this not JSON call
    let config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencode',
      },
    };

    let tokenRoute = this.baseUrlEndpoint + 'token';

    console.debug('About to make axios call');
    let userTokenResponse = await axios.post(
      tokenRoute,
      grantRequestString,
      config,
    );
    console.debug('Got the fucking token!!');
    return userTokenResponse;
  };

  // //todo: get this working
  // isSetupComplete() {
  //   return true;
  // },

  get = async url => {
    let that = this;

    try {
      //added for idemotent request
      let getHeader = this._generateIdempotencyHeader();
      //let testUrl = "https://booza.store:44300/test/test";
      return await this.axiosClient.get(url, getHeader);
    } catch (error) {
      console.debug('AXIOS get failed:' + error);
      return error.response;
    }
  };

  // //todo:test
  post = async (url, payloadJson = null) => {
    let that = this;
    let header = this._generateIdempotencyHeader();
    try {
      if (payloadJson == null) {
        return await that.axiosClient.post(url, null, header);
      }
      return await that.axiosClient.post(url, payloadJson, header);
    } catch (ourError) {
      console.debug(ourError);
      return ourError.response;
    }
  };

  patch = async (url, payloadJson = null) => {
    let that = this;
    let header = this._generateIdempotencyHeader();

    try {
      if (payloadJson == null) {
        return await that.axiosClient.patch(url, null, header);
      }
      return await that.axiosClient.patch(url, payloadJson, header);
    } catch (ourError) {
      console.debug(ourError);
      return ourError.response;
    }
  };

  // //todo:get this working
  // put = async (url, payloadJson) => {
  //   let that = this;
  //   return await axiosClient.post(url, payloadJson);
  // }
};

export default PlatformApiClient;
