import Modal from "react-native-modalbox";
import React, { Component } from "react";

import { isUndefined } from "lodash";

import {
  Platform,
  Image,
  View,
  Animated,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
  StatusBar,
  PermissionsAndroid,
  Picker,
  Dimensions,
  KeyboardAvoidingView
} from "react-native";
import {
  Color,
  Images,
  Languages,
  Styles,
  Constants,
  withTheme,
  GlobalStyle
} from "@common";
import {
  Button as ElButton,
  Header as ElHeader,
  Icon,
  Divider,
} from "react-native-elements";
import { toast } from "../../../Omni";
import { Header, NavigationActions } from "react-navigation";
//import { AudioRecorder, AudioUtils } from 'react-native-audio'
//import RNFS from 'react-native-fs'
//import Sound from 'react-native-sound'
// import { ChatScreen } from "react-native-easy-chat-ui";

import { GiftedChat, Bubble, Time } from "react-native-gifted-chat";

import HopprWorker from "../../../services/HopprWorker";
import { connect } from "react-redux";


import ModalSelector from "react-native-modal-selector";
import { NoFlickerImage } from 'react-native-no-flicker-image';
import { TextInput } from "@components";


const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  // DRIVER CONTROLS
  driverControlsButton: {
    padding: 10,
  },
  container: {
    flexGrow: 1,
    backgroundColor: Color.background,
  },
  driverControlsModal: {
    // justifyContent: "center",
    // alignItems: "center",
    height: 300,
    backgroundColor: "#fff",
  },
  driverButtonViewContainer: {
    padding: 5,
  },
  containerCenteyellow: {
    backgroundColor: Color.background,
    justifyContent: "center",
  },
});

const generateDefaultChatter = () => {
  return {
    userGuid: "-1",
    userName: "None",
    roleInTransaction: "None",
  };
};

const getDefaultState = () => {
  return {
    inverted: false, // require
    voiceHandle: true,
    currentTime: 0,
    recording: false,
    paused: false,
    stoppedRecording: false,
    finished: false,
    audioPath: "",
    voicePlaying: false,
    voiceLoading: false,
    //my vars for api
    iconImgSrc: Images.defaultAvatar,
    chatOrderId: undefined,
    chattersForThisOrderId: [generateDefaultChatter()],
    selectedChatUser: {
      userGuid: "-1",
      userName: "None",
      roleInTransaction: "None",
    },
    charRefreshTimerId: -1,
    // filteredMessageToUser: [] //this is only selected messages based on which user picked from dropdown
  };
};

class ChatModal extends Component {
  constructor(props) {
    super(props);
    this.state = getDefaultState();
  }

  componentWillUnmount=()=>{
    try {
      this.unsubscribeWillFocus();
      this.unsubscribeLoseFocus();  
    } catch (error) {
      console.debug("unmount failed chat modal")
    }
    
  }

  componentDidMount = async () => {
    //await this.load();
    console.debug("in chat home");
   this.unsubscribeWillFocus =  this.props.navigation.addListener("willFocus", this.load);
   this.unsubscribeLoseFocus =  this.props.navigation.addListener("willBlur", this.unload);
  };

  // _filterMessagesToSingleUser = (thatUserGuid) => {
  //   let thatConvo = this.props.allConversations.find(x => x.otherPartyUserGuid == thatUserGuid);
  //   let thoseMesagesForUser = typeof thatConvo === "undefined" ? [] : thatConvo.messages;

  //   this.setState({ filteredMessageToUser: [] }, () => {
  //     console.debug("SHould be blank now");
  //     this.setState({ filteredMessageToUser: thoseMesagesForUser }, () => {
  //       let whatIsState = this.props.filteredMessageToUser;
  //       this.forceUpdate();
  //     })
  //   });

  // }


  load = async () => {
    toast("Refreshing chatters!!");
    if (
      this.props.user.user != null &&
      typeof this.props.user.user !== "undefined"
    ) {
      try {
        HopprWorker.init({
          username: this.props.user.user.email,
          password: this.props.user.successPassword,
          token: this.props.user.token,
        });

        console.debug("");

        //test some kind of param here - e.g isSingleChatterMode
        let chatters = [];
        if (this.props.singleUserChatMode) {
          chatters = await HopprWorker.getSingleChatter(this.props.latestChatterId)
        } else {
          chatters = await HopprWorker.getChatUsersInMyOrders(
            this.props.user.user.id
          );
        }

        console.debug("");
        if (chatters.data.length > 0) {
          console.debug("got chatters");
          this.setState({ chattersForThisOrderId: chatters.data }, () => {
            //set first as default if nothing set
            if (this.state.selectedChatUser.userGuid === "-1") {
              //see if there is paased chatter, if not just load first
              if (this.props.latestChatterId != -1) {
                //redirect to the chatter IF there is a matching chatter!
                try {
                  let tryAndGetChatter = chatters.data.filter(x => x.userGuid == this.props.latestChatterId);
                  if (tryAndGetChatter.length > 0) {
                    //we got one!!! lets go!
                    this._changeSelectedChatter(tryAndGetChatter[0].userGuid)
                  }
                  else {
                    this._changeSelectedChatterByIndex(0);
                  }
                  //find chatter and swticht to them
                } catch (error) {
                  alert("You passed a chatter but they don't exist in our chatters!:" + error.message);
                  this._changeSelectedChatterByIndex(0);
                }

              } else {
                console.debug("ok wer're here");
                this._changeSelectedChatterByIndex(0);
              }
            }
          });
        } else {
          alert(
            "Couldn't identify who you wanted to chat to - closing"
          );
          this.closeMe();
        }
      } catch (error) {
        alert("We had a problem in chat modal:" + JSON.stringify(error));
      }

      //get active order
      // let orderId = "9a86208e-3cef-4bd7-9cfd-88a52061b159";
      // //get partiicpants for that order
      // let chatters = await HopprWorker.getChatParticipantsForMyOrder(orderId);

      try {
        // set timer to update chatters
        // let timerId = setInterval(async () => {
        //   toast("fired chat refresh");
        //   let chatters = await HopprWorker.getAllOnlineChatUsers();
        //   if (chatters.length > 0)
        //     console.debug("got chatters");
        //   this.setState({ chattersForThisOrderId: chatters.data });
        // }, 10000);
        // this.setState({ charRefreshTimerId: timerId })
      } catch (error) {
        toast(
          "We had a problem in chatters update timer:" + JSON.stringify(error)
        );
      }
    } else {
      alert("You need to be logged in to user chat");
      this.closeMe();
    }
  };

  unload = async () => {
    //reset state
    //   clearInterval(this.state.charRefreshTimerId);
    this.setState(getDefaultState());
  };

  _decideOnChatterImage = () => {
    let imgSrc = Images.defaultAvatar;
    // if (typeof this.state.selectedChatUser !== "undefined") {
    //   switch (this.state.selectedChatUser.roleInTransaction) {
    //     case "Driver":
    //       imgSrc = Images.DeliveryDriver2;
    //       break;
    //     case "Store":
    //       imgSrc = Images.MapIconStore7;
    //       break;
    //     case "Customer":
    //       imgSrc = Images.DeliveryDestination1;
    //       break;
    //     default:
    //       break;
    //   }
    // }

    this.setState({ iconImgSrc: imgSrc });
  };

  _renderChatterImage = () => {
    return (
      <NoFlickerImage
        style={{
          alignSelf: "center",
          margin: 0,
          maxHeight: 80,
          height: 80,
          width: 80,
        }}
        source={this.state.iconImgSrc}
        resizeMode="contain"
      />
    );
  };

  _changeSelectedChatterByIndex = (index) => {
    let newChatter = this.state.chattersForThisOrderId[index];

    if (
      !newChatter ||
      isUndefined(newChatter.userGuid) ||
      this.state.selectedChatUser.userGuid === newChatter.userGuid
    ) {
      return;
    }

    this.props.changeLatestSelectedChatter(newChatter.userGuid); //udpates for latest
    this.setState({ selectedChatUser: newChatter }, () => {
      this.props.filterMessagesToUser(newChatter.userGuid).then(() => {
        this._decideOnChatterImage();
        this.forceUpdate();
      });
    });
  };

  _changeSelectedChatter = async (chatterUserGuid) => {
    const filteredChatters = this.state.chattersForThisOrderId.filter(
      (x) => x.userGuid == chatterUserGuid
    );

    const newChatter = filteredChatters[0];

    this.props.changeLatestSelectedChatter(newChatter.userGuid); //udpates for latest
    this.setState({ selectedChatUser: newChatter }, async () => {
      this.props.filterMessagesToUser(newChatter.userGuid).then(() => {
        this._decideOnChatterImage();
        this.forceUpdate();
      });
    });
  };

  _renderChatterPickerRow = () => {
    if (
      this.state.chattersForThisOrderId.length > 0 &&
      typeof this.state.chattersForThisOrderId !== "undefined" &&
      typeof this.state.selectedChatUser !== "undefined"
    ) {
      const chatterItems = this.state.chattersForThisOrderId.map(
        (item, index) => ({
          label: item.roleInTransaction + ": " + item.userName,
          key: item.userGuid,
        })
      );

      return (
        <View
          style={{
            alignSelf: "center",
            flex: 1,
            backgroundColor:"transparent",
            borderWidth: 0,
            color:"white",
            borderColor: GlobalStyle.primaryColorDark.color,
            borderRadius: 20,
            minHeight: 50,
            maxHeight: 50,
            height: 50,
            marginHorizontal: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/*// <ScrollView
        //   style={{
        //     height: 100,
        //     minHeight: 100,
        //     maxHeight: 100,
        //     borderWidth: 2,
        //     borderColor: "red",
        //     borderRadius: 4,
        //   }}
        // >
        //   <Button
        //     title="test"
        //     style={{
        //       width: 100,
        //       height: 40,
        //       backgroundColor: "grey",
        //     }}
        //   />

        //   {chatterItems.map((item) => (
        //     <Button
        //       title={item.label}
        //       style={{
        //         width: 100,
        //         height: 40,
        //         backgroundColor: "grey",
        //       }}
        //       onPress={async () => {
        //         await this._changeSelectedChatter(item.value);
        //       }}
        //     />
        //   ))}
        // </ScrollView>*/}

          <ModalSelector
            data={chatterItems}
            initValue={this.state.selectedChatUser.userName}
            touchableStyle={{ borderWidth: 0 }}
            selectStyle={{ borderWidth: 0, color:"white" }}
            onChange={(option) => {
              this._changeSelectedChatter(option.key);
            }}
          >
            <TextInput 
            placeholder="Chat here"
            value={this.state.selectedChatUser.userName}
            style={{ 
            color:"#5e6870",
            fontSize:18,             
            fontFamily:Constants.fontFamily}}/>
            </ModalSelector>
        </View>
      );
    }
  };

  // _renderChatterPickerRowOld = () => {
  //   if (
  //     this.state.chattersForThisOrderId.length > 0 &&
  //     typeof this.state.chattersForThisOrderId !== "undefined" &&
  //     typeof this.state.selectedChatUser !== "undefined"
  //   ) {
  //     return (
  //       <View
  //         style={{
  //           alignSelf: "center",
  //           flex: 1,
  //           borderWidth: 3,
  //           borderRadius: 20,
  //           maxHeight: 50,
  //           height: 50,
  //         }}
  //       >
  //         <Picker
  //           style={{
  //             // alignSelf: "flex-end",
  //             // justifyContent: "center",
  //             flex: 1,
  //             margin: 6,
  //             paddingLeft: 18,
  //             borderWidth: 2,
  //             borderRadius: 15,
  //             borderColor: "orange",
  //             color: "black",
  //             maxHeight: 60,
  //             height: 60,
  //             // width: undefined,
  //             color: "black",
  //           }}
  //           mode="dialog"
  //           selectedValue={this.state.selectedChatUser.userGuid}
  //           onValueChange={async (itemValue, itemIndex) =>
  //             await this._changeSelectedChatterByIndex(itemIndex)
  //           }
  //         >
  //           {this.state.chattersForThisOrderId.map((item, index) => {
  //             return (
  //               <Picker.Item
  //                 style={{ fontSize: 28 }}
  //                 label={item.roleInTransaction + ": " + item.userName}
  //                 value={item.userGuid}
  //                 key={index}
  //               />
  //             );
  //           })}
  //         </Picker>
  //       </View>
  //     );
  //   }
  // };

  componentWillMount = () => {
    // this.setState({
    //   filteredMessageToUser: [
    //     {
    //       id: `1`,
    //       type: 'text',
    //       content: 'hello world',
    //       targetId: '12345678',
    //       chatInfo: {
    //         avatar: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f2017db4-b491-460a-afa1-1305060068ce/db0lkn3-f2e4a973-a05a-4096-9c38-948c9a80c5ff.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2YyMDE3ZGI0LWI0OTEtNDYwYS1hZmExLTEzMDUwNjAwNjhjZVwvZGIwbGtuMy1mMmU0YTk3My1hMDVhLTQwOTYtOWMzOC05NDhjOWE4MGM1ZmYuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.oeg5BWJ5xhK6_wq3qkeLxTld4s_y6AINlzrylVGllUw",
    //         id: '12345678',
    //         nickName: 'Test'
    //       },
    //       renderTime: true,
    //       sendStatus: 0,
    //       time: '1542006036549'
    //     },
    //     {
    //       id: `2`,
    //       type: 'text',
    //       content: 'hi/{se}',
    //       targetId: '12345678',
    //       chatInfo: {
    //         avatar: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f2017db4-b491-460a-afa1-1305060068ce/db0lkn3-f2e4a973-a05a-4096-9c38-948c9a80c5ff.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2YyMDE3ZGI0LWI0OTEtNDYwYS1hZmExLTEzMDUwNjAwNjhjZVwvZGIwbGtuMy1mMmU0YTk3My1hMDVhLTQwOTYtOWMzOC05NDhjOWE4MGM1ZmYuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.oeg5BWJ5xhK6_wq3qkeLxTld4s_y6AINlzrylVGllUw",
    //         id: '12345678',
    //         nickName: 'Test'
    //       },
    //       renderTime: true,
    //       sendStatus: 0,
    //       time: '1542106036549'
    //     },
    //     {
    //       id: `3`,
    //       type: 'image',
    //       content: {
    //         uri: 'https://upload-images.jianshu.io/upload_images/11942126-044bd33212dcbfb8.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/300/h/240',
    //         width: 100,
    //         height: 80,
    //       },
    //       targetId: '12345678',
    //       chatInfo: {
    //         avatar: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f2017db4-b491-460a-afa1-1305060068ce/db0lkn3-f2e4a973-a05a-4096-9c38-948c9a80c5ff.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2YyMDE3ZGI0LWI0OTEtNDYwYS1hZmExLTEzMDUwNjAwNjhjZVwvZGIwbGtuMy1mMmU0YTk3My1hMDVhLTQwOTYtOWMzOC05NDhjOWE4MGM1ZmYuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.oeg5BWJ5xhK6_wq3qkeLxTld4s_y6AINlzrylVGllUw",
    //         id: '12345678',
    //         nickName: 'Test'
    //       },
    //       renderTime: false,
    //       sendStatus: 0,
    //       time: '1542106037000'
    //     },
    //     {
    //       id: `4`,
    //       type: 'text',
    //       content: '你好/{weixiao}',
    //       targetId: '88886666',
    //       chatInfo: {
    //         avatar: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f2017db4-b491-460a-afa1-1305060068ce/db0lkn3-f2e4a973-a05a-4096-9c38-948c9a80c5ff.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2YyMDE3ZGI0LWI0OTEtNDYwYS1hZmExLTEzMDUwNjAwNjhjZVwvZGIwbGtuMy1mMmU0YTk3My1hMDVhLTQwOTYtOWMzOC05NDhjOWE4MGM1ZmYuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.oeg5BWJ5xhK6_wq3qkeLxTld4s_y6AINlzrylVGllUw",
    //         id: '12345678'
    //       },
    //       renderTime: true,
    //       sendStatus: -2,
    //       time: '1542177036549'
    //     },
    // {
    //   id: `5`,
    //   type: 'voice',
    //   content: {
    //     uri: 'http://m10.music.126.net/20190810141311/78bf2f6e1080052bc0259afa91cf030d/ymusic/d60e/d53a/a031/1578f4093912b3c1f41a0bfd6c10115d.mp3',
    //     length: 10
    //   },
    //   targetId: '12345678',
    //   chatInfo: {
    //     avatar: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f2017db4-b491-460a-afa1-1305060068ce/db0lkn3-f2e4a973-a05a-4096-9c38-948c9a80c5ff.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2YyMDE3ZGI0LWI0OTEtNDYwYS1hZmExLTEzMDUwNjAwNjhjZVwvZGIwbGtuMy1mMmU0YTk3My1hMDVhLTQwOTYtOWMzOC05NDhjOWE4MGM1ZmYuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.oeg5BWJ5xhK6_wq3qkeLxTld4s_y6AINlzrylVGllUw",
    //     id: '12345678',
    //     nickName: 'Test'
    //   },
    //   renderTime: true,
    //   sendStatus: 1,
    //   time: '1542260667161'
    // },
    // {
    //   id: `6`,
    //   type: 'voice',
    //   content: {
    //     uri: 'http://m10.music.126.net/20190810141311/78bf2f6e1080052bc0259afa91cf030d/ymusic/d60e/d53a/a031/1578f4093912b3c1f41a0bfd6c10115d.mp3',
    //     length: 30
    //   },
    //   targetId: '88886666',
    //   chatInfo: {
    //     avatar: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f2017db4-b491-460a-afa1-1305060068ce/db0lkn3-f2e4a973-a05a-4096-9c38-948c9a80c5ff.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2YyMDE3ZGI0LWI0OTEtNDYwYS1hZmExLTEzMDUwNjAwNjhjZVwvZGIwbGtuMy1mMmU0YTk3My1hMDVhLTQwOTYtOWMzOC05NDhjOWE4MGM1ZmYuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.oeg5BWJ5xhK6_wq3qkeLxTld4s_y6AINlzrylVGllUw",
    //     id: '12345678'
    //   },
    //   renderTime: true,
    //   sendStatus: 0,
    //   time: '1542264667161'
    // },
    //   ],
    // });
  };

  sendMessage = async (content) => {
    //send to server
    let sendResult = await HopprWorker.sendChatMessage(
      this.state.selectedChatUser.userGuid,
      content
    );

    let sendStatus = -2;
    if (sendResult.status == 200) {
      sendStatus = 1;
    } else {
      alert(
        "Nah, they couldn't receive your message - they're not currently connected. Send it later."
      );
    }

    //don't add it twice if it's to ourselves! Just send and get it that way
    if (this.props.user.user.id != this.state.selectedChatUser.userGuid) {
      //guid is other party it is going to
      this.props
        .addNewChatMessage(
          this.state.selectedChatUser.userGuid,
          this.props.user.user.id,
          content,
          sendStatus
        )
        .then(async () => {
          await this.props.filterMessagesToUser(
            this.state.selectedChatUser.userGuid
          );
          this.forceUpdate();
        });
    }
    //get local message array by userGuid

    //
    // let msgCopy = [...this.props.filteredMessageToUser];
    // msgCopy.push({
    //   id: `5`,
    //   type: 'text',
    //   content: content,
    //   targetId: this.state.selectedChatUser.userGuid || "None",
    //   chatInfo: {
    //     avatar: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f2017db4-b491-460a-afa1-1305060068ce/db0lkn3-f2e4a973-a05a-4096-9c38-948c9a80c5ff.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2YyMDE3ZGI0LWI0OTEtNDYwYS1hZmExLTEzMDUwNjAwNjhjZVwvZGIwbGtuMy1mMmU0YTk3My1hMDVhLTQwOTYtOWMzOC05NDhjOWE4MGM1ZmYuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.oeg5BWJ5xhK6_wq3qkeLxTld4s_y6AINlzrylVGllUw",
    //     id: '12345678'
    //   },
    //   renderTime: true,
    //   sendStatus: sendStatus,
    //   time: Date.now()
    // })

    // this.setState({ filteredMessageToUser: msgCopy });
  };

  _transformMessages = (rawMessages) =>
    rawMessages.map((msg) => ({
      _id: msg.id,
      user: {
        _id: msg.targetId,
        avatar: msg.chatInfo.avatar,
      },
      text: msg.content,
      createdAt: new Date(msg.time),
    }));

  _renderBubbleTime = ({ timeTextStyle, ...timeProps }) => (
    <Time
      {...timeProps}
      timeTextStyle={{
        color: "white",
      }}
    />
  );

  _renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        renderTime={this._renderBubbleTime}
        textStyle={{
          left: {
            color: "white",
          },
          right: {
            color: "white",
          },
        }}
        wrapperStyle={{
          right: {
            backgroundColor: "hotpink",
          },
          left: {
            backgroundColor: GlobalStyle.primaryColorDark.color,
          },
        }}
      />
    );
  };

  _renderChatViewAndGui = () => {
    const messages = this._transformMessages(
      this.props.filteredMessageToUser
    ).reverse();

    console.log("incoming");
    console.log(this.props.filteredMessageToUser);
    console.log(messages);

    if(Platform.OS == "ios")
    {  
    return (
      // <KeyboardAvoidingView
      //   behavior="height"        
      //   keyboardVerticalOffset={100}
      // >
        <View
          style={{
            borderColor: "green",
            paddingBottom: 18,
            marginBottom: 18,
            flexGrow: 1,
          }}
        >
          <View
            style={{
              borderColor: "green",
              flexGrow: 1,
              padding: 15,
              paddingBottom: 20
            }}
          >
            <GiftedChat
              messages={messages}
              textInputStyle={{ color: GlobalStyle.primaryColorDark.color }}
              onSend={(messages) => this.sendMessage(messages[0].text)}
              showUserAvatar
              renderBubble={this._renderBubble}
              user={{
                _id: "12345678",
                avatar:
                  Images.ChatCustomer2,
              }}
            />
          </View>
        </View>
      // </KeyboardAvoidingView>
    );
   }
   else{
     return (
      <KeyboardAvoidingView
        behavior="padding"
        style={{flex:1}}         
        keyboardVerticalOffset={Platform.select({ios: 0, android: 70})}>       
      
      <View
      style={{
        borderColor: "green",
        paddingBottom: 18,
        marginBottom: 18,
        flexGrow: 1,
      }}
    >
      <View
        style={{
          borderColor: "green",
          flexGrow: 1,
          padding: 15,
          paddingBottom: 20
        }}
      >
        <GiftedChat
          messages={messages}
          textInputStyle={{ color: GlobalStyle.primaryColorDark.color }}
          onSend={(messages) => this.sendMessage(messages[0].text)}
          showUserAvatar
          renderBubble={this._renderBubble}
          user={{
            _id: "12345678",
            avatar:
              Images.ChatCustomer2,
          }}
        />
      </View>
      </View>
  </KeyboardAvoidingView>)
   }
  };

  // _renderChatViewAndGuiOld = () => {
  //   if (Platform.OS === "android") {
  //     return (
  //       <View
  //         style={{
  //           flex: 1,
  //           backgroundColor: "#fff",
  //           paddingBottom: 10,
  //           borderRadius: 8,
  //           width: width - 8,
  //           overflow: "hidden",
  //         }}
  //       >
  //         <ChatScreen
  //           ref={(e) => (this.chat = e)}
  //           messageList={this.props.filteredMessageToUser}
  //           androidHeaderHeight={40}
  //           sendMessage={this.sendMessage}
  //           reSendMessage={this.sendMessage}
  //           placeholder={"Type something..."}
  //           inputStyle={{
  //             color: GlobalStyle.primaryColorDark.color,
  //           }}
  //           leftMessageBackground={GlobalStyle.primaryColorDark.color}
  //           rightMessageBackground={"hotpink"}
  //           leftMessageTextStyle={{ color: "white" }}
  //           rightMessageTextStyle={{ color: "white" }}
  //         />
  //       </View>
  //     );
  //   } else {
  //     return (
  //       <View
  //         style={
  //           {
  //             // flex: 1,
  //             // backgroundColor: "#fff",
  //             // paddingBottom: 70,
  //             // height: 400,
  //             // minHeight: 400,
  //             // maxHeight: 400,
  //             // borderWidth: 2,
  //             // borderColor: "blue",
  //             // borderRadius: 8,
  //             // width: width - 8,
  //             // overflow: "hidden",
  //             // height: 300,
  //             // minHeight: 300,
  //             // maxHeight: 300,
  //           }
  //         }
  //       >
  //         <ChatScreen
  //           ref={(e) => (this.chat = e)}
  //           messageList={this.props.filteredMessageToUser}
  //           androidHeaderHeight={40}
  //           sendMessage={this.sendMessage}
  //           reSendMessage={this.sendMessage}
  //           placeholder={"Type something..."}
  //           inputStyle={{
  //             color: GlobalStyle.primaryColorDark.color,
  //           }}
  //           iphoneXBottomPadding={100}
  //           iphoneXKeyboardPadding={60}
  //           leftMessageBackground={GlobalStyle.primaryColorDark.color}
  //           rightMessageBackground={"hotpink"}
  //           leftMessageTextStyle={{ color: "white" }}
  //           rightMessageTextStyle={{ color: "white" }}
  //         />
  //       </View>
  //     );
  //   }
  // };

  render = () => {
    const { headerText, openClosed, openMe, closeMe, ...props } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;

    return (
      <Modal
        style={{
          // flex: 1,
          // backgroundColor: "#fff",
          borderRadius: 20,
          width: width - 18,
          height: height - 110,
          borderWidth: 1,
          borderColor: GlobalStyle.primaryColorDark.color,
          // maxHeight: height - 110,
          // minHeight: height - 100,
          // marginTop: -200,
        }}
        // coverScreen={true}
        backdropPressToClose={true}
        swipeToClose={true}
        backdrop={true}
        position={"center"}
        ref={"chatModal"}
        isOpen={this.props.openClosed}
        onClosed={() => {
          this.closeMe();
          this.unload();
        }}
        onOpened={() => this.load()}
      >

        <ElHeader
          backgroundColor={GlobalStyle.modalHeader.backgroundColor}
          outerContainerStyles={{
            height: 80,
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19,
            // paddingTop: 50,
            // marginTop: 50,
          }}
          // rightComponent={{
          //   icon: "close",            
          //   color: "#fff",          
          //   onPress: () => this.props.closeMe(),
          // }}
          rightComponent={
            <View style={{ position:"absolute", top:-64, right:-14  }}>
              <TouchableOpacity
                onPress={() => {
                  this.props.closeMe()
                }}>              
                <Image
                   source={Images.NewAppReskinIcon.CloseButton}
                  style={{ height: 50, width: 50 }}
                />
              </TouchableOpacity>
            </View>
          }
          centerComponent={
            <View style={{flex:1, alignSelf:"center", justifyContent:"center"}}>
            <Text style={{              
              fontSize:14,
              textAlign:"center",
              color: GlobalStyle.modalTextBlackish.color,
              fontFamily:Constants.fontHeader,          
            }}>
            {"Chat - Talking to: "}
            </Text>
            {this._renderChatterPickerRow()}
          </View>                       
          }
        />




        {/* <View
          style={{
            flexDirection: "row",
            // borderWidth: 2,
            // borderColor: "green",
          }}
        >
          {this._renderChatterImage(this.state.selectedChatUser)}
          {this._renderChatterPickerRow()}
        </View> */}

        {this._renderChatViewAndGui()}
  
      </Modal>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    allConversations: state.chat.allConversations,
    filteredMessageToUser: state.chat.filteredMessageToUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  const chatActions = require("@redux/ChatRedux");
  return {
    addNewChatMessage: async (
      whichMessageCollectionUserGuid,
      sideOfConversationGuid,
      message,
      sendStatus
    ) => {
      console.debug("About to add message");
      return chatActions.actions.addChatMessage(
        dispatch,
        whichMessageCollectionUserGuid,
        sideOfConversationGuid,
        message,
        sendStatus
      );
    },
    filterMessagesToUser: async (recipientUserGuid) => {
      console.debug("About to filter message");
      return chatActions.actions.filterMessagesToUser(
        dispatch,
        recipientUserGuid
      );
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(ChatModal));
