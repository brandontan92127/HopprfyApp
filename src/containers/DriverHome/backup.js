<Modal
  style={{
    backgroundColor: "#fff",
    height: null,
    paddingBottom: 10,
    borderRadius: 20,
    width: width - 35,
  }}
  backdrop={true}
  position={"center"}
  ref={"driverControlsModal"}
>
  <Header
    backgroundColor={"#fbad4a"}
    outerContainerStyles={{
      height: 49,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    }}
    rightComponent={{
      icon: "close",
      color: "#fff",
      onLongPress: () =>
        this.props.updateModalState("quickControlsModal", true),
      onPress: () => this.refs.driverControlsModal.close(),
    }}
    centerComponent={{
      text: this.state.driverName,
      style: { color: "#fff" },
    }}
  />
  {/* START ROW COMPONENT*/}
  <View style={{ paddingTop: 5 }}>
    {/* THIS IS MAIN ROW */}
    <Text style={{ textAlign: "center", color: "black" }}>{"Active?"}</Text>
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      {/* START FIRST BUTTON */}
      <View style={{ margin: 15 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <TouchableHighlight onPress={() => this._findMe()}>
            <FastImage
              style={{
                margin: 2,
                marginLeft: 20,
                maxHeight: 90,
                height: 90,
                width: 90,
              }}
              source={Images.LaunchMap3}
              resizeMode='contain'
            />
          </TouchableHighlight>
        </View>
        <Text
          style={{
            textAlign: "center",
            color: "black",
            fontSize: 11,
            marginLeft: 20,
          }}
        >
          {"Find Me"}
        </Text>
      </View>
      {/* END FIRST BUTTON */}

      {/* START SECOND BUTTON */}
      <View
        style={{
          margin: 15,
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              marginLeft: 30,
              height: 98,
              width: 98,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <SwitchToggle
              backgroundColorOff={"grey"}
              backgroundColorOn={"#fbad4a"}
              containerStyle={{
                width: 95,
                height: 44,
                borderRadius: 25,
                backgroundColor: "#fbad4a",
                backgroundColorOn: "#fbad4a",
                backgroundColorOff: "#fbad4a",
                padding: 5,
              }}
              circleStyle={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "white", // rgb(102,134,205)
              }}
              switchOn={this.props.driverActive}
              onPress={() => this.toggleDriverState()}
              circleColorOff='white'
              circleColorOn='white'
              duration={300}
            />
          </View>
        </View>
        {/* END SECOND BUTTON */}
      </View>
    </View>
  </View>
  {/* END TOGGLE ROW */}
  {/* START ROW COMPONENT*/}
  <View style={{ paddingTop: 5 }}>
    {/* THIS IS MAIN ROW */}
    <Text style={{ textAlign: "center", color: "black" }}>{"Technical"}</Text>
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      {/* START FIRST BUTTON */}
      <View style={{ margin: 15 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <TouchableHighlight onPress={() => this.normaliseDriverState()}>
            <FastImage
              style={{
                margin: 2,
                marginLeft: 20,
                height: 90,
                width: 90,
              }}
              source={Images.CloudSync2}
              resizeMode='contain'
            />
          </TouchableHighlight>
        </View>
        <Text
          style={{
            textAlign: "center",
            color: "black",
            fontSize: 11,
            marginLeft: 20,
          }}
        >
          {"Normalise State"}
        </Text>
      </View>
      {/* END FIRST BUTTON */}

      {/* START SECOND BUTTON */}
      <View style={{ margin: 15 }}>
        <View
          style={{
            justifyContent: "center",
          }}
        >
          <TouchableHighlight onPress={() => this._rerenderHUD()}>
            <FastImage
              style={{
                margin: 2,
                marginLeft: 40,
                paddingLeft: 40,
                height: 90,
                width: 90,
              }}
              source={Images.GenerateHud2}
              resizeMode='contain'
            />
          </TouchableHighlight>
        </View>
        <Text
          style={{
            marginLeft: 40,
            textAlign: "center",
            color: "black",
            fontSize: 11,
          }}
        >
          {"Generate HUD"}
        </Text>
      </View>
      {/* END SECOND BUTTON */}
    </View>
  </View>
</Modal>;
