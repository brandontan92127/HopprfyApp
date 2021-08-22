/**
 * Created by InspireUI on 19/02/2017.
 *
 * @format
 */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView
} from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import {
  Icons,
  Color,
  Languages,
  Styles,
  Config,
  withTheme,
  Theme,  
  GlobalStyle,
  Constants,
  Device
} from "@common";
import { Icon, toast, warn, FacebookAPI } from "@app/Omni";
import SoundPlayer from "react-native-sound-player";
import { Spinner, ButtonIndex } from "@components";
import { Images } from "@common";
// import { WooWorker } from "api-ecommerce";
import WPUserAPI from "@services/WPUserAPI";
import PlatformApiClient from "../../services/PlatformApiClient";
import DateTimePicker from "react-native-modal-datetime-picker";
import styles from "./styles";
import HopprWorker from "../../services/HopprWorker";
import OneSignal from "react-native-onesignal";
import { EventRegister } from "react-native-event-listeners";
import { showMessage, hideMessage } from "react-native-flash-message";
import Video from "react-native-video";
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get("window");
const isDark = Config.Theme.isDark;


class UserSignupScreen extends PureComponent {
  static propTypes = {
    user: PropTypes.object,
    isLogout: PropTypes.bool,
    onViewCartScreen: PropTypes.func,
    onViewHomeScreen: PropTypes.func,
    onViewSignUp: PropTypes.func,
    logout: PropTypes.func,
    navigation: PropTypes.object,
    onBack: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {     
      password: "",
      confirmPassword:"",
      email:"",
      registrationType:"Customer",
      firstName:"",
      lastName:"",
      telephone:"",
      signupReferralCode:"",
      dob:"",
      dobForApi: "",
      datePickerVisible:false,
      networkUserPermissionRequestsToAdd: [        
        { networkUserPermissionRequestsToAdd : "booza.store", type:"Customer"}
      ],
      isLoading: false,
      logInFB: false,
      videoPaused:false
    };

    this.focusPassword = () => this.password && this.password.focus();
  }

  _changePausedVideo=(newBool)=>{
    this.setState({videoPaused: newBool});
  }

  componentDidMount() {
    const { user } = this.props;


    
  }

  componentWillMount = () => {

  };
  componentWillUnmount = () => {

  };


  // handle the logout screen and navigate to cart page if the new user login object exist
  componentWillReceiveProps(nextProps) {
   
    const { user } = nextProps.user;
    const { params } = nextProps.navigation.state;
  }

  _onBack = () => {
    const { onBack, goBack } = this.props;
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  _showErrorLoginAlert = () => {
    alert(
      "There was a problem logging in. Please check username and password."
    );
  };


  onSignUpHandle = () => {
    this.props.onViewSignUp();
  };

  checkConnection = () => {
    const { netInfo } = this.props;
    if (!netInfo.isConnected) toast(Languages.noConnection);
    return netInfo.isConnected;
  };

  stopAndToast = (msg) => {
    toast(msg);
    this.setState({ isLoading: false });
  };

  _validateForm=()=>{
    let errorString = "";
    let result = false;
    if(this.state.dob == "")
    {
      errorString = errorString + "You need to set a DOB!\n";      
    }
    
    if(this.state.firstName === "")
    {
      errorString = errorString + "First name can't be blank!\n";      
    }
    if(this.state.lastName === "")
    {
      errorString = errorString + "Last name can't be blank!\n";      
    }
    if(this.state.email === "")
    {
      errorString = errorString + "Email / username can't be blank!\n";      
    }
    if(this.state.telephone === "")
    {
      errorString = errorString + "Telephone can't be blank!\n";      
    }
      
    result = errorString !== '' ? false : true;
    return { result : result, errorString :errorString  }    
  }
userSignup=async()=>{
    //validate form
  let validateResult = this._validateForm();
  if(validateResult.result)
  {
    //get fields ||
    let payload = {
      password: this.state.password,
      confirmPassword:this.state.password,
      email:this.state.email,
      registrationType: "Customer",
      firstName:this.state.firstName,
      lastName:this.state.lastName,
      telephone: this.state.telephone,
      DOB: this.state.dobForApi,
      signupReferralCode:this.state.signupReferralCode,
      userRolesToAdd:[
        "Customer"
      ],
      networkUserPermissionRequestsToAdd: [        
        { networkStoreName : "booza.store", type:"Customer"}
      ],
    }   
    //call create
   await this._createNewCustomerUserInApi(payload);
  }   
  else{
    SoundPlayer.playSoundFile("negative1", "mp3");
    showMessage({
      style: {
        borderBottomLeftRadius:8,
        borderBottomRightRadius: 8
      },  
      position:"center",
      message: "Whatd'ya trying to pull, amigo?" ,
      description: '\n' + validateResult.errorString,
      backgroundColor: "grey", // background color
      color: "white", // text color,
      duration: 6000,
      autoHide: true,
    });        
  }
} 

  _createNewCustomerUserInApi=async (createNewUser)=>{
    showMessage({
      style: {
        borderBottomLeftRadius:8,
        borderBottomRightRadius: 8
      },  
      message: "Trying to create your account",
      description: "Give us a sec...",
      backgroundColor: "orange", // background color
      color: "white", // text color,
      duration: 3000,
      position:"center",
      autoHide: true,
    });    
    
    let result = await HopprWorker.createNewUser(createNewUser);
    if(result.status == 200 || result.status == 201)
    {
      SoundPlayer.playSoundFile("indeed", "mp3");
      showMessage({
        style: {
          borderBottomLeftRadius:8,
          borderBottomRightRadius: 8
        },  
        position:"center",
        message: "Amazing, you're all set",
        description: "Let's us begin your journey, traveller...\n\nSorry to be pain, but could you login with those creds?",
        backgroundColor: GlobalStyle.primaryColorDark.color, // background color
        color: "white", // text color,
        duration: 6000,
        autoHide: true,
      });
      
      //save in redux username / password

      //redirect to login screen and ask them to login.. or.. log them in?
      this.props.navigation.navigate("LoginScreen");
      
    }
    else if(result.status == 400)
    {
      let errorString = "";
      if(result.data.modelState)
      {
        for (const [key, value] of Object.entries(result.data.modelState)) {
          value.map(errorMsg=>{
            errorString = errorMsg + '\n'
          })
          //console.log(`${key}: ${value}`);
        }
      }
      SoundPlayer.playSoundFile("negative1", "mp3");
      showMessage({
        style: {
          borderBottomLeftRadius:8,
          borderBottomRightRadius: 8
        },  
        position:"center",
        message: "Sorry, that failed",
        description: '\n' + result.data.message + '\n\n' + errorString,
        backgroundColor: "red", // background color
        color: "white", // text color,
        duration: 6000,
        autoHide: true,
      });    
  } else if (result.status == 500) {          
    //show exception message
    SoundPlayer.playSoundFile("negative1", "mp3");
    showMessage({
      style: {
        borderBottomLeftRadius:8,
        borderBottomRightRadius: 8
      },  
      message: "Sorry, that didn't work: " + result.data.message,
      description: result.data.message,
      backgroundColor: "red", // background color
      color: "white", // text color,
      duration: 5000,
      autoHide: true,
    }); 
  }
  }

  render() {
    const { firstName,
      lastName,
      email,      
       password,
       confirmPassword,
       telephone,
       signupReferralCode,
       dobForApi,
       dob,
      isLoading } = this.state;
    const {
      theme: {
        colors: { background, text },
      },
    } = this.props;

    console.debug("ARE WE HERE");
    return (
      <View style={{flex: 1}}>
      <LinearGradient
          colors={['#29A4C0', '#572A91']}
          style={styles.container}>  
      <ScrollView style={{margin:0, padding:0, paddingTop:Device.getCorrectIphoneXViewBasePadding(68)}}>               
      <View>
        <Image
              source={Config.InstanceDeploymentVariables.Hopperfy.TopAppLogo}
              style={{ height: 80, width: 80, padding:10 }}
            />
        </View>
           <View style={{flex:1, paddingBottom:60, paddingLeft:20, paddingRight:20}}>
       {/* <Video
            style={{ minHeight: 200, width: width }}
            controls={true}        
            paused={this.state.videoPaused}
            source={{
              uri: Config.PlatformBaseUrl + "video/customeronboard.mp4",
            }} // Can be a URL or a local file.
          /> 

          <TouchableOpacity
            style={Styles.Common.ColumnCenter}
            onPress={()=>
              {                
                this._changePausedVideo(true);
                this.props.updateModalState("startingHelpModal", true)
              }              
              }
          >
             <Text style={[styles.signUp, { textAlign:"center", fontWeight:"bold", fontSize:18, color: "silver" }]}>
              {"New?"}{" "}
              <Text style={styles.highlight, { fontSize:18, color: GlobalStyle.primaryColorDark.color}}>{"Take the tour"}</Text>     
              {" or..."}
            </Text>
          </TouchableOpacity>
          <View style={[styles.subContain, {paddingTop:4}]}>         
            <ButtonIndex
              text={"CREATE ACCOUNT"}
              containerStyle={styles.loginButton, { backgroundColor:"#9844a0", borderRadius:8, marginTop:10}}
              onPress={()=>this.userSignup()}
            />   
             <TouchableOpacity
            style={Styles.Common.ColumnCenter}
            onPress={()=>alert('Show T and C')}
          >
            <Text style={[styles.signUp, { color: text }]}>
              {"By creaating an account, you thus agree to the platform"}{" "}
              <Text style={styles.highlight, { color: GlobalStyle.primaryColorDark.color}}>{"Terms and conditions"}</Text>
            </Text>
          </TouchableOpacity> 
            </View>

        {/* <Text style={[styles.signUp, { textAlign:"center", fontWeight:"bold", fontSize:14, color: "orange" }]}>
              {"Let's get boozin', mate:"}             
        </Text> */}
      
        {/* <View style={styles.logoWrap}>
          <Image
            source={Config.BoozaLogo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View> */}
               
        <View style={styles.inputContainer}>                         
            {/* FIRSTNAME */}           
              <TextInput
                {...commonInputProps}
                ref={(comp) => (this.firstName = comp)}
                placeholder={"First name"}
                style={styles.textinput}
                placeholderTextColor={'rgba(255,255,255,0.5)'}
                keyboardType="default"
                onChangeText={(val)=>this.setState({firstName: val})}              
                returnKeyType="next"
                value={firstName}
              />
            
            {/* LASTNAME */}           
              <TextInput
                {...commonInputProps}
                style={styles.textinput}
                placeholderTextColor={'rgba(255,255,255,0.5)'}
                ref={(comp) => (this.lastName = comp)}
                placeholder={"Last name"}
                keyboardType="name-phone-pad"
                onChangeText={this.onUsernameEditHandle}
                onChangeText={(val)=>this.setState({lastName: val})}
                onSubmitEditing={this.focusPassword}
                returnKeyType="next"
                value={lastName}
              />
       
            {/* EMAIL */}         
              <TextInput
                {...commonInputProps}
                style={styles.textinput}
                placeholderTextColor={'rgba(255,255,255,0.5)'}
                ref={(comp) => (this.email = comp)}
                autoCorrect={false}
                placeholder={"Email (this will be your username)"}
                keyboardType="email-address"
                onChangeText={(val)=>this.setState({email: val})}             
                returnKeyType="next"
                value={email}
              />
         
          
              <TextInput
                {...commonInputProps}
                style={styles.textinput}
                placeholderTextColor={'rgba(255,255,255,0.5)'}
                ref={(comp) => (this.dob = comp)}
                //onChangeText={(val)=>this.setState({signupReferralCode: val})}
                placeholder={"DOB"}
                keyboardType="default"
                onFocus={()=>
                  {
                    this.password.focus();
                    this.setState({datePickerVisible:true});
                  }
                  }
                // onChangeText={this.onUsernameEditHandle}
                // onSubmitEditing={this.focusPassword}
                returnKeyType="go"
                value={dob}
              />
          
              <TextInput
                {...commonInputProps}
                style={styles.textinput}
                placeholderTextColor={'rgba(255,255,255,0.5)'}
                ref={(comp) => (this.password = comp)}
                placeholder={Languages.password}
                onChangeText={(val)=>this.setState({password: val})}           
                secureTextEntry={true}
                autoCorrect={false}
                keyboardType={"default"}                
                returnKeyType="next"
                textContentType={"password"}
                value={password}
              />
           
              {/* <TextInput
           
                style={styles.textinput}
                placeholderTextColor={'rgba(255,255,255,0.5)'}
                ref={(comp) => (this.confirmPassword = comp)}
                onChangeText={(val)=>this.setState({confirmPassword: val})}
                placeholder={"Confirm password"}
                keyboardType={"default"}  
                secureTextEntry={true}
                autoCorrect={false}         
                textContentType={"password"}    
             
                returnKeyType="next"
                secureTextEntry                
                value={confirmPassword}
              />
             */}
            
              <TextInput
               // {...commonInputProps}
                style={styles.textinput}
                placeholderTextColor={'rgba(255,255,255,0.5)'}
                ref={(comp) => (this.telephone = comp)}
                onChangeText={(val)=>this.setState({telephone: val})}
                placeholder={"Telephone"}
                keyboardType="phone-pad"
                // onChangeText={this.onUsernameEditHandle}
                // onSubmitEditing={this.focusPassword}
                returnKeyType="go"
                value={telephone}
              />
            


           
              <TextInput
               // {...commonInputProps}
                style={styles.textinput}
                placeholderTextColor={'rgba(255,255,255,0.5)'}
                ref={(comp) => (this.signupReferralCode = comp)}
                onChangeText={(val)=>this.setState({signupReferralCode: val})}
                placeholder={"Referral Code"}
                keyboardType="name-phone-pad"
                // onChangeText={this.onUsernameEditHandle}
                // onSubmitEditing={this.focusPassword}
                returnKeyType="go"
                value={signupReferralCode}
              />
         <View style={{paddingTop:14, alignContent:"center"}}>
         <TouchableOpacity
            style={Styles.Common.ColumnCenter}
            onPress={()=>
              {                
                this._changePausedVideo(true);
                this.props.updateModalState("startingHelpModal", true)
              }              
              }
          >
            <Text style={styles.text}>
              New?
              <Text style={{...styles.text, color: '#26C1CB'}}>
                {' '}
                Take the tour{' '}
              </Text>
              or ...
            </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.subContain, {paddingTop:4}]}>         
            <ButtonIndex
            textColor={"#62057e"}
              text={"CREATE ACCOUNT"}
              containerStyle={styles.btn, {                
                 borderRadius:30, 
                 backgroundColor: '#D8EAFC',                
                 alignContent:"center",
                 justifyContent: 'center',
                 alignItems: 'center',
                 borderRadius: 100,
                 paddingBotton: 10,
                 padding: 25,}}
              onPress={()=>this.userSignup()}
            />   
            <TouchableOpacity
            style={Styles.Common.ColumnCenter}
            onPress={()=>{
              this.props.navigation.navigate("CustomPage", {url: "https://hopprfy.com/LegalStuff/TermsAndConditions"})
            }}
          >
            <Text style={[styles.signUp, {marginBottom:10,  fontSize:10, fontFamily:Constants.fontFamily, color: "white" }]}>
              {"By creating an account, you agree to the platform\n"}
              <Text style={styles.highlight, { color: "#00b2be"}}>{"Terms and conditions"}</Text>
            </Text>
          </TouchableOpacity> 
          <View style={{flex:1, height:20}}></View>
            </View>

           {/* <View style={{paddingTop:14, alignContent:"center"}}>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
          </View>  */}






            {/* <TouchableOpacity
            style={Styles.Common.ColumnCenter}
            onPress={()=>
              {                
                this._changePausedVideo(true);
                this.props.updateModalState("startingHelpModal", true)
              }              
              }
          >
             <Text style={[styles.signUp, { textAlign:"center", fontWeight:"bold", fontSize:18, color: "black" }]}>
              {"New?"}{" "}
              <Text style={styles.highlight, { fontSize:18, color: "#00b2be"}}>{"Take the tour"}</Text>     
              {" or..."}
            </Text> */}
          {/* </TouchableOpacity> */}
          





            {/* <View style={styles.inputWrap}>
              <Icon
                name={Icons.MaterialCommunityIcons.Settings}
                size={Styles.IconSize.TextInput}
                color={text}
              />
              <TextInput
                {...commonInputProps}
                ref={(comp) => (this.email = comp)}
                placeholder={"Sign up code"}
                keyboardType="name-phone-pad"
                // onChangeText={this.onUsernameEditHandle}
                // onSubmitEditing={this.focusPassword}
                returnKeyType="next"
                value={email}
              />
            </View> */}
          <TextInput
            value={dobForApi}
            style={{ display:"none"}}         
            >
            </TextInput>

            <DateTimePicker
            isVisible={this.state.datePickerVisible}
              // isVisible={this.state.isOpeningTimePickerVisible}
              // onConfirm={this._handlfueDatePicked}
              onConfirm={(date)=>                {                  
                  let day   = date.getDate();
                  let month = (date.getMonth() + 1);
                  let year  = date.getFullYear()

                  if(month < 10)
                  { month = "0" + month }

                  //NEEDS TO BE IN US FORMAT FOR API!! NEED ONE HIDDEN STRING, ONE VISIBLE ONE
                  let dateString = day + "/" + month + "/" + year;
                  let dateStringHidden = month + "/" + day + "/" + year;
                  this.setState({ dobForApi: dateStringHidden, dob:dateString, datePickerVisible:false});                  
                } 
              }              
              onCancel={()=>
                {                 
                  this.setState({datePickerVisible:false});                 
                }
                }               
              mode={"date"}
            />
          

          </View>
          {/* <View style={styles.separatorWrap}>
            <View style={styles.separator} />
            <Text style={styles.separatorText}>{Languages.Or}</Text>
            <View style={styles.separator} />
          </View>         */}    
          {/* <View style={[styles.subContain, {paddingTop:4}]}>                 
         <TouchableOpacity
            style={Styles.Common.ColumnCenter}
            onPress={()=>alert('Show T and C')}
          >
            <Text style={[styles.signUp, { color: text }]}>
              {"By creaating an account, you thus agree to the platform"}{" "}
              <Text style={styles.highlight, { color: GlobalStyle.primaryColorDark.color}}>{"Terms and conditions"}</Text>
            </Text>
          </TouchableOpacity>
          </View>                 */}     
 
        </View>  
        <View style={{flex:1, maxHeight:280, minHeight:280, zIndex:-2}}></View>
       
      </ScrollView>
      </LinearGradient>   
        </View>
    );
  }
}

const commonInputProps = {
  style: styles.input,
  underlineColorAndroid: "transparent",
  placeholderTextColor: isDark
    ? Theme.dark.colors.text
    : Theme.light.colors.text,
};

UserSignupScreen.propTypes = {
  netInfo: PropTypes.object,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = ({ netInfo, user }) => ({ netInfo, user });

const mapDispatchToProps = (dispatch) => {
  const { actions } = require("@redux/UserRedux");
  const AddressRedux = require("@redux/AddressRedux");
  const modalActions = require("@redux/ModalsRedux");
  const backAction = NavigationActions.back({
    key: null,
  });
  return {
    updateModalState: (modalName, modalState) => {
      console.debug("About to update modals");
      try {
        dispatch(
          modalActions.actions.updateModalActive(
            dispatch,
            modalName,
            modalState
          )
        );
      } catch (error) {
        console.debug(error);
      }
    },
    login: (user, token) => dispatch(actions.login(user, token)),
    logout: () => dispatch(actions.logout()),
    initAddresses: (customerInfo) => {
      AddressRedux.actions.initAddresses(dispatch, customerInfo);
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(UserSignupScreen));
