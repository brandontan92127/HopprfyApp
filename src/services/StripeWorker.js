import PlatformApiClient from "./PlatformApiClient";
import { QueryBuilder } from "odata-query-builder";
import { TimeBetweenPointsRequest } from "../apiModels/Order/TimeToDeliveryRequest";
import { Config } from "@common";
import { toast } from "@app/Omni";
import axios from "axios";

export default class StripeWorker {
  static publicKey = "";
  static stripeInstance = null;
  static axiosClient = null;

  static init = (stripePublicKey) => {
    StripeWorker.publicKey = stripePublicKey;
    stripeInstance = Stripe(stripePublicKey);
    setupAxiosClient();
  };

  static setupAxiosClient = () => {
    let that = this;
    that.axiosClient = axios.create({
      baseURL: "https://api.stripe.com",
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + bearerToken,
      },
    });
    console.debug("Axios token client was setup with bearer:" + bearerToken);
    return;
  };

  /**Pulls full customer details from stripe server, along with all the cards
   * get Stripe customerId from hoppr first, then use it to pull the cards from Stripe - this avoids PCI compliance issues */
  static getCustomerDetails = (stripeCustomerId) => {};
}
