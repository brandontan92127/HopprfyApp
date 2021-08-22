import ChatConversation from "../models/chat/ChatConversation";
import ChatMessage from "../models/chat/ChatMessage";
import ChatMessageGenerator from "../models/chat/ChatMessageGenerator";

const types = {
  FILTER_MESSAGES_TO_USER: "FILTER_MESSAGES_TO_USER",
  FILTER_MESSAGES_TO_USER_SUCCESS: "FILTER_MESSAGES_TO_USER_SUCCESS",
  FILTER_MESSAGES_TO_USER_FAILURE: "FILTER_MESSAGES_TO_USER_FAILURE",

  ADD_CHAT_MESSAGE: "ADD_CHAT_MESSAGE",
  ADD_CHAT_MESSAGE_SUCCESS: "ADD_CHAT_MESSAGE_SUCCESS",
  ADD_CHAT_MESSAGE_FAILURE: "ADD_CHAT_MESSAGE_FAILURE",
};

export const actions = {
  filterMessagesToUser: (dispatch, whichMessageCollectionUserGuid) => {
    return new Promise(async (resolve, reject) => {
      try {
        dispatch(
          actions.filterMessagesToUserSuccess(whichMessageCollectionUserGuid)
        );
        resolve();
      } catch (error) {
        dispatch(actions.filterMessagesToUserFailure());
        reject(error);
      }
    });
  },
  filterMessagesToUserSuccess: (whichMessageCollectionUserGuid) => {
    return {
      type: types.FILTER_MESSAGES_TO_USER_SUCCESS,
      whichMessageCollectionUserGuid,
    };
  },
  filterMessagesToUserFailure: () => {
    return { type: types.FILTER_MESSAGES_TO_USER_FAILURE };
  },
  addChatMessage: (
    dispatch,
    whichMessageCollectionUserGuid,
    sideOfConversationGuid,
    message,
    sendStatus = 1
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        dispatch(
          actions.addChatMessageSuccess(
            whichMessageCollectionUserGuid,
            sideOfConversationGuid,
            message,
            sendStatus
          )
        );
        resolve();
      } catch (error) {
        dispatch(actions.addChatMessageFailure());
        reject(error);
      }
    });
  },
  addChatMessageSuccess: (
    whichMessageCollectionUserGuid,
    sideOfConversationGuid,
    message,
    sendStatus
  ) => {
    return {
      type: types.ADD_CHAT_MESSAGE_SUCCESS,
      message,
      whichMessageCollectionUserGuid,
      sideOfConversationGuid,
      sendStatus,
    };
  },
  addChatMessageFailure: () => {
    return { type: types.ADD_CHAT_MESSAGE_FAILURE };
  },
};

const initialState = {
  allConversations: [],
  filteredMessageToUser: [],
};

export const reducer = (state = initialState, action) => {
  console.debug("in chat redux");
  const {
    type,
    whichMessageCollectionUserGuid,
    sideOfConversationGuid,
    message,
    sendStatus,
  } = action;
  switch (type) {
    case types.ADD_CHAT_MESSAGE_SUCCESS:
      console.debug("Updating chat messages");
      let allCOnvos = state.allConversations;
      let copiedArray = [...allCOnvos];

      //FIND CONVERSATION WITH 'THEIR' GUI
      let indexOfItem = copiedArray.findIndex(
        (el) => el.otherPartyUserGuid === whichMessageCollectionUserGuid
      );
      //BUT ADD NEW CHAT MESSAGE WITH 'YOUR' GUI (SO IT'S ON CORRECT SIDE)
      //now either add new conversation or add new message to existing conversation
      //if sideofconvo == the collection to add, it's not from you - add to THEIR side
      //if not equal, add to your side
      //4567 is your side, 88886666 is there side - these are only default values that work
      const yourSide = 4567;
      const theirSide = 88886666;

      let originType =
        whichMessageCollectionUserGuid === sideOfConversationGuid
          ? theirSide
          : yourSide;
      let msgToAdd =
        originType === yourSide
          ? ChatMessageGenerator.generateMySideChatMessage(message, sendStatus)
          : ChatMessageGenerator.generateTheirSideChatMessage(
              message,
              sendStatus
            );

      if (indexOfItem == -1) {
        //doesn't exist, add new convo and message
        let newConvo = new ChatConversation();
        newConvo.otherPartyUserGuid = whichMessageCollectionUserGuid;
        newConvo.messages.push(msgToAdd);
        copiedArray.push(newConvo);
      } else {
        //just add message
        copiedArray[indexOfItem].messages.push(msgToAdd);
      }
      return {
        ...state,
        allConversations: copiedArray,
      };
    case types.ADD_CHAT_MESSAGE_FAILURE:
      return { ...state };
    case types.FILTER_MESSAGES_TO_USER_SUCCESS:
      let thatConvo = state.allConversations.find(
        (x) => x.otherPartyUserGuid == whichMessageCollectionUserGuid
      );
      let thoseMesagesForUser =
        typeof thatConvo === "undefined" ? [] : thatConvo.messages;
      console.debug("Updating filtered messages");
      return {
        ...state,
        filteredMessageToUser: thoseMesagesForUser,
      };
    case types.FILTER_MESSAGES_TO_USER_FAILURE:
      return { ...state };
    default:
      return state;
  }
};
