const types = {
  UPDATE_ALL_ACTIONMESSAGES: "UPDATE_ALL_ACTIONMESSAGES",
  UPDATE_ALL_ACTIONMESSAGES_SUCCESS: "UPDATE_ALL_ACTIONMESSAGES_SUCCESS",
  UPDATE_ALL_ACTIONMESSAGES_FAILURE: "UPDATE_ALL_ACTIONMESSAGES_FAILURE",
};

export const actions = {
  updateAllActionMessages: (dispatch, newActionMessageArray) => {
    return new Promise(async (resolve, reject) => {
      try {
        dispatch(actions.updateAllActionMessagesSuccess(newActionMessageArray));
        resolve();
      } catch (error) {
        dispatch(actions.updateAllActionMessagesFailure());
        reject(error);
      }
    });
  },
  updateAllActionMessagesSuccess: (newActionMessageArray) => {
    return {
      type: types.UPDATE_ALL_ACTIONMESSAGES_SUCCESS,
      allActionMessages: newActionMessageArray,
    };
  },
  updateAllActionMessagesFailure: () => {
    return { type: types.UPDATE_ALL_ACTIONMESSAGES_FAILURE };
  },
};

const initialState = {
  allActionMessages: [],
};

export const reducer = (state = initialState, action) => {
  console.debug("in action message redux");
  const { type, allActionMessages } = action;
  switch (type) {
    case types.UPDATE_ALL_ACTIONMESSAGES_SUCCESS:
      console.debug("Updating action messages");
      return {
        ...state,
        allActionMessages: allActionMessages,
      };
    case types.UPDATE_ALL_ACTIONMESSAGES_FAILURE:
      return { ...state };
    default:
      return state;
  }
};
