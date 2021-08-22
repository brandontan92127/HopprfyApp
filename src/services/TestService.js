import axios from "axios";
import ApiRoutes from "../routing/ApiRoutes";
import { Component } from "react";

const TestService = class {
  constructor() {
    //this.baseUrlEndpoint = ApiRoutes.apiBaseUrl;
    //check if token is not blank / expired, if it is get new token
    this.login = "";
    this.password = "";
    this.userAccessToken = "";
    this.testvar = "test ";
  }

  serviceMethod = () => {
    console.debug("This does somethiing");
  };

  otherMethod = () => {
    console.debug("this does something else!!");
  };

  printTestVar = () => {
    console.debug(this.testvar);
  };
};

export default TestService;
