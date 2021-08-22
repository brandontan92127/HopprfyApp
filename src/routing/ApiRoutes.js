const apiBaseUrlLive = "https://booza.store:44300/";
const apiBaseUrlDevelopment = "https://localhost:44300/api/";

const login = () => {
  const tokenEndpoint = "token";
};

const account = () => {
  const baseUrl = "accounts";

  const accountinfo = "accountinfo";
  const register = "register";
};

const orderrequest = () => {
  const baseUrl = "orderrequest";
  const getorderrequest = "getorderrequest";
};

const networks = () => {
  const baseUrl = "networks";
};

const networkuserpermissions = () => {
  const baseUrl = "networkuserpermissions";

  const getallnetworksandpermissions = "getallnetworksandpermissions";
  const add = "add";
  const remove = "remove";
  const addallpermissiontypes = "addallpermissiontypes";

  const enable = "enable";
  const disable = "disable";
};

const networkuserpermissionrequest = () => {
  const baseUrl = "networkuserpermissionrequest";

  const add = "add";
  const accept = "accept";
  const remove = "remove";
};

const misc = () => {
  const baseUrl = "misc";

  const getlogins = "getlogins";
};

const usersaccount = () => {
  const baseUrl = "useraccounts";
  const accountinfo = "accountinfo";
};

const usertransactions = () => {
  const baseUrl = "usertransactions";

  const credit = "credit";
  const debit = "debit";
  const getbalance = "getbalance";
  const getbalanceandlatesttran = "getbalanceandlatesttran";
  const transfertokens = "transfertokens";
};

const payments = () => {
  const baseUrl = "payments";

  const accounttopup = "accounttopup";
  const calculatefiattotokenexchange = "calculatefiattotokenexchange";

  //payments
  const customerpaysescrowondriveraccept = "customerpaysescrowondriveraccept";
  const escrowpaysstoreondriverpickup = "escrowpaysstoreondriverpickup";
  const escrowpaysdriverfullamountonordercomplete =
    "escrowpaysdriveronordercomplete";
  const escrowpaysdriverpartialamountoncustomercancel =
    "escrowpaysdriverpartialamountoncustomercancel";

  //refunds
  const escrowrefundscustomerfullamountonordercancelprestorepickup =
    "escrowrefundscustomerfullamountonordercancelprestorepickup";
};

const refunds = () => {
  const baseUrl = "refunds";

  const refundescrowtocustomerordercancelled =
    "refundescrowtocustomerordercancelled";
};

const chat = () => {
  const baseUrl = "chat";
  const all = "all";
  const unread = "unread";

  const getonlineusers = "getonlineusers"; //with a chat websock connection
};

const products = () => {
  const baseUrl = "products";
  const random = "getrandom";

  const searchallnetworksbyname = "searchallnetworksbyname";
  const searchallforautocomplete = "searchallforautocomplete";
};

const location = () => {
  const baseUrl = "location";

  const drivers = "drivers";
  const orders = "orders";
  const customers = "customers";
  const stores = "stores";
};

const menu = () => {
  const baseUrl = "menu";
  const full = "full";
};

const stores = () => {
  const baseUrl = "stores";
  const getactive = "getactive";

  const setasoffline = "setasoffline";
  const setasonline = "setasonline";
};

const usermode = () => {
  const baseUrl = "usermode";

  const intocustomermode = "intocustomermode";
  const intostoremode = "intostoremode";
  const intodrivermode = "intodrivermode";
};

const drivers = () => {
  //set as prefix
  const baseUrl = "drivers";
  const getrandom = "getrandom";
  const getactive = "getactive";
  const getstatus = "getstatus";
  const getviatoken = "getviatoken";

  const state = () => {
    const setasonline = "state/setasonline";
    const setasoffline = "state/setasoffline";
    const setasawaitingorderresponse = "state/setasawaitingorderresponse";
    const setasondeliveryorderpickup = "state/setasondeliveryorderpickup";
    const workoutandsetonlineifnoorderactive =
      "state/workoutandsetonlineifnoorderactive";
    const setasondeliveryoutfordelivery = "state/setasondeliveryoutfordelivery";
    const setbyusername = "state/setbyusername";
  };
};
const customers = () => {
  const baseUrl = "customers";
  const getrandom = "getrandom";
  const getactive = "getactive";
  const getviatoken = "getviatoken";
};

const orderprocess = () => {
  const baseUrl = "orderprocess";

  const placeorder = "placeorder";
};

const orders = () => {
  const baseUrl = "orders";

  const getactivecustomerorder = "getactivecustomerorder";
  const getactivedriverorder = "getactivedriverorder";
  const getorderinfo = "getorderinfo";

  const request = "request";
  const driveraccepts = "driveraccepts";
  const driverrejects = "driverrejects";

  const cancel = () => {
    const customer = "customers/cancel";
    const drivers = "drivers/cancel";
    const stores = "stores/cancel";
  };

  const delivered = () => {
    const tocustomer = "delivered/tocustomer";
    const toaddress = "delivered/toaddress";
    const nearby = "delivered/nearby";
    const other = "delivered/other";

    const customerconfirmdelivery = "delivered/customerconfirm";
  };

  const pickup = () => {
    const driverconfirm = "pickup/driverconfirm";
    const storeconfirm = "pickup/storeconfirm";
  };
};

const images = () => {
  const baseUrl = "Images";
  const logoimages = "NetworkLogos";
  const waitingimages = "Waiting";
};

const enduserwebsite = () => {
  const baseUrl = "enduserwebsite";
  const networkandproducts = "networkandproducts";
};

const keepalive = () => {
  const baseUrl = "keepalive";

  const stayalive = "stayalive";
};

const geocoding = () => {
  const baseUrl = "geocoding";
  const reversegeocode = "reversegeocode";
  const gettimebetweenlocations = "gettimebetweenlocations";

  const googlenearbysearch = "googlenearbysearch";
};

const websocketnotification = () => {
  const baseUrl = "notifications/realtime";

  const sendbyguid = "sendbyguid";
  const sendbyusername = "sendbyusername";

  const drivers = () => {
    const sendbyguid = "drivers/sendbyguid";

    const multisendbyusername = "drivers/multi/sendbyusername";
    const multisendbyguid = "drivers/multi/sendbyguid";
  };

  const customer = () => {
    const sendbyguid = "customers/sendbyguid";
  };

  const store = () => {
    const sendbyguid = "stores/sendbyguid";
  };
};

const networktransactionfeesplits = () => {
  {
    const baseUrl = "networktransactionfeesplits";

    const GetNetworkTransactionFeeSplitsForGraphs =
      "GetNetworkTransactionFeeSplitsForGraphs";
    const GetNetworkTransactionFeeSplits = "GetNetworkTransactionFeeSplits";
    const AddNetworkTransactionFeeSplit = "AddNetworkTransactionFeeSplit";
    const AdjustNetworkTransactionFeeSplit = "AdjustNetworkTransactionFeeSplit";

    const GetMyNetworkShare = "GetMyNetworkShare";
  }

  const bi = () => {
    {
      const baseUrl = "bi";
      const getstores = "getstores";
      const getorders = "getorders";
      const getdrivers = "getdrivers";

      const getactiveorderstable = "getactiveorderstable";
      const getcompletedorderstable = "getcompletedorderstable";
    }
  };
};

export default {
  apiBaseUrlLive,
  apiBaseUrlDevelopment,
  login,
  account,
  orderrequest,
  networks,
  networkuserpermissions,
  networkuserpermissionrequest,
  misc
};
