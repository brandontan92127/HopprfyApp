import PlatformApiClient from "./PlatformApiClient";
import { QueryBuilder } from "odata-query-builder";
import { TimeBetweenPointsRequest } from "../apiModels/Order/TimeToDeliveryRequest";
import { Config } from "@common";
import { toast } from "@app/Omni";

export default class HtmlViewToNavigationComponentURLService {
  static Map(urlToMap) {
    console.debug("ABout to map HtmlViewToNavigation");
    if (urlToMap.includes("OrderInProgress/Index")) {
      return "TrackOrderScreen";
    } else if (urlToMap.includes("OrderInProgress/Index")) {
      return "TrackOrderScreen";
    } else {
      return urlToMap; //if we cant deceide just output the original
    }
  }
}
