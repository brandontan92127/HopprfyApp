//THIS IS SHOWN TO THE CUSTOMER WHEN THE STORE HAS CONFIRMED THE PICKUP

import Modal from "react-native-modalbox";
import React, { Component } from "react";
import {
  Image,
  View,
  Animated,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  WebView
} from "react-native";
import { Button } from "@components";
import { Color, Languages, Styles, Constants, withTheme } from "@common";
import {
  Button as ElButton,
  Header,
  Icon,
  Divider,
} from "react-native-elements";
import { Images } from "@common";
import { toast } from "../../../Omni";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
import { ECharts } from "react-native-echarts-wrapper";
import EChartsOptions from "./EChartsOptions"
import LayoutHelper from "../../../services/LayoutHelper"

const { width, height } = Dimensions.get("window");
const echartsoption = {
  xAxis: {
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  yAxis: {
    type: "value"
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: "line"
    }
  ]
};


const styles = StyleSheet.create({
  //TABS
  tabButton: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "rgba(255,255,255,1)",
  },
  textTab: {
    fontFamily: Constants.fontHeader,
    color: "rgba(183, 196, 203, 1)",
    fontSize: 16,
  },
  tabButtonHead: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    opacity: 0,
  },
  tabItem: {
    flex: 0.32,
    backgroundColor: "rgba(255,255,255,1)",
  },
  bottomView: {
    height: 50,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f3f7f9",
  },
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
  containerCentered: {
    backgroundColor: Color.background,
    justifyContent: "center",
  },
});

export default class SalesBIModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0,
      headerBgColor: "#a719ff",
    };
  }

  changeHeaderBgColor = (newHexValue) => {
    this.setState({ headerBgColor: newHexValue });
  };

  changeTabAndHeaderBgColor = (tabIndex, newHexValue) => {
    this.changeHeaderBgColor(newHexValue);
    this.handleClickTab(tabIndex);
  };

  handleClickTab(tabIndex) {
    this.setState({ tabIndex });
  }


  /**
   * Render tabview detail
   */
  _renderTabView = () => {


    let background = "white";
    let text = "black";
    let lineColor = "red";

    const screenWidth = Dimensions.get("window").width;

    // TEST DATA
    const data1 = {
      labels: ["January", "February", "March", "April", "May", "June"],
      datasets: [
        {
          data: [20, 45, 28, 80, 99, 43],
          color: (opacity = 1) => `rgba(201, 2, 2, ${opacity})`, // optional
          strokeWidth: 2, // optional
        },
      ],
    };

    const piedata1 = [
      {
        name: "Diet Coke",
        population: 21500000,
        color: "rgba(131, 167, 234, 1)",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Ice",
        population: 2800000,
        color: "#F00",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Stella",
        population: 527612,
        color: "red",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Fosters",
        population: 8538000,
        color: "blue",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Colored Jelly 5.25G",
        population: 11920000,
        color: "rgb(0, 0, 255)",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
    ];
    const chartConfig1 = {
      backgroundColor: "#e26a00",
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 1) => "red",
      labelColor: (opacity = 1) => "black",
      style: {
        borderRadius: 16
      }
    };

    const chartConfig2 = {
      backgroundColor: "#e26a00",
      backgroundGradientFrom: "#fb8c00",
      backgroundGradientTo: "#ffa726",
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726"
      }
    };

    const graph6 = EChartsOptions.Graph1;
    const graph7 = EChartsOptions.Graph1;

    //2nd Tab charts
    const stackedData2 = {
      labels: ["Test1", "Test2"],
      legend: ["L1", "L2", "L3"],
      data: [
        [60, 60, 60],
        [30, 30, 60],
      ],
      barColors: ["#dfe4ea", "#ced6e0", "#a4b0be"],
    };

    const commitsData = [
      { date: "2019-01-02", count: 1 },
      { date: "2019-01-03", count: 2 },
      { date: "2019-01-04", count: 3 },
      { date: "2019-01-05", count: 4 },
      { date: "2019-01-06", count: 5 },
      { date: "2019-01-30", count: 2 },
      { date: "2019-01-31", count: 3 },
      { date: "2019-03-01", count: 2 },
      { date: "2019-04-02", count: 4 },
      { date: "2019-03-05", count: 2 },
      { date: "2019-02-30", count: 4 },
    ];



    return (
      <View
        style={[
          styles.tabView,
          { paddingBottom: 20, backgroundColor: "white" },
        ]}
      >
        <View
          style={[
            styles.tabButton,
            { backgroundColor: background },
            { borderTopColor: lineColor },
            { borderBottomColor: lineColor },
            Constants.RTL && { flexDirection: "row-reverse" },
          ]}
        >
          <View
            style={[
              styles.tabItem,
              { alignContent: "center", backgroundColor: "white" },
            ]}
          >
            <Button
              type="tabimage"
              lineColor={lineColor}
              icon={Images.TabBIIcon1}
              textStyle={[
                styles.textTab,
                { alignContent: "center", color: text },
              ]}
              selectedStyle={{ color: text }}
              text={"Store Sales:"}
              onPress={() => {
                this.changeTabAndHeaderBgColor(0, "#a719ff");
              }}
              selected={this.state.tabIndex == 0}
            />
          </View>
          <View style={[styles.tabItem, { backgroundColor: "white" }]}>
            <Button
              type="tabimage"
              icon={Images.Stats}
              lineColor={lineColor}
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={"Driver Sales:"}
              onPress={() => {
                this.changeTabAndHeaderBgColor(1, "#bf7e16");
              }}
              selected={this.state.tabIndex == 1}
            />
          </View>
          <View style={[styles.tabItem, { backgroundColor: "white" }]}>
            <Button
              type="tabimage"
              icon={Images.TabBIIcon3}
              lineColor={lineColor}
              textStyle={[styles.textTab, { color: text }]}
              selectedStyle={{ color: text }}
              text={"Purchases:"}
              onPress={() => {
                this.changeTabAndHeaderBgColor(2, "#a719ff");
              }}
              selected={this.state.tabIndex == 2}
            />
          </View>
        </View>
        {this.state.tabIndex === 0 && (
          // STORE NUMBERS
          <View
            style={{
              flex: 1,
              width: width,
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <View style={{
              flex: 1,
              width: width
            }}>
              <Text
                style={{
                  color: "black",
                  margin: 15,
                  fontSize: 22,
                  textAlign: "center",
                }}
              >
                {"Revenue (last 2 qtr):"}
              </Text>
              <View style={{ height: 320, width: width }}>
                <ECharts option={EChartsOptions.Graph1} height={300} />
              </View>
              <Text
                style={{
                  color: "black",
                  margin: 15,
                  fontSize: 22,
                  textAlign: "center",
                }}
              >
                {"Best Sellers (all networks):"}
              </Text>
              <View style={{ height: 320, width: width }}>
                <ECharts option={EChartsOptions.Pie1} height={300} />
              </View>
              <Text
                style={{
                  color: "black",
                  margin: 15,
                  fontSize: 18,
                  textAlign: "center",
                }}
              >
                {"Sales this week (all networks)"}
              </Text>
              <View style={{ height: 320, width: width }}>
                <ECharts option={EChartsOptions.Graph5} height={300} />
              </View>
            </View>
          </View>
        )}
        {this.state.tabIndex === 1 && (
          // DRIVER NUMBERS
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <View>
              <Text
                style={{
                  color: "black",
                  margin: 5,
                  fontSize: 22,
                  textAlign: "center",
                }}
              >
                {"All time sales:"}
              </Text>
              <View style={{ height: 320, width: width }}>
                <ECharts option={EChartsOptions.Pie2} height={300} />
              </View>

              <Text
                style={{
                  color: "black",
                  margin: 15,
                  fontSize: 22,
                  textAlign: "center",
                }}
              >
                     {"Sales past 6 months:"}
              </Text>

              <View style={{ height: 320, width: width }}>
                <ECharts option={graph6} height={300} />
              </View>

              <Text
                style={{
                  color: "black",
                  margin: 15,
                  fontSize: 22,
                  textAlign: "center",
                }}
              >
                {"Sales past 12 months:"}
              </Text>
              <View style={{ height: 320, width: width }}>
                <ECharts option={graph7} height={300} />
              </View>

              <Text
                style={{
                  color: "black",
                  margin: 15,
                  fontSize: 22,
                  textAlign: "left",
                }}
              >
                {"Sales this week:"}
              </Text>
              <View style={{ height: 320, width: width }}>
                <ECharts option={EChartsOptions.Pie1} height={300} />
              </View>
            </View>
          </View>
        )}
        {this.state.tabIndex === 2 && (
          // STORE NUMBERS
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <View>
              <Text
                style={{
                  color: "black",
                  margin: 15,
                  fontSize: 22,
                  textAlign: "center",
                }}
              >
                {"Most popular items:"}
              </Text>
              <View style={{ height: 320, width: width }}>
                <ECharts option={EChartsOptions.Graph3} height={300} />
              </View>

              <Text
                style={{
                  color: "black",
                  margin: 15,
                  fontSize: 22,
                  textAlign: "center",
                }}
              >
                {"Sales past 6 months:"}
              </Text>
              <View style={{ height: 320, width: width }}>
                <ECharts option={EChartsOptions.Pie2} height={300} />
              </View>

              <Text
                style={{
                  color: "black",
                  margin: 15,
                  fontSize: 22,
                  textAlign: "center",
                }}
              >
                {"Sales this week:"}
              </Text>
              <View style={{ height: 320, width: width }}>
                <ECharts option={EChartsOptions.Graph4} height={300} />
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  render() {
    const {
      headerText,
      openClosed,
      goToScreen,
      openMe,
      closeMe,
      ...props
    } = this.props;

    this.openClosed = openClosed;
    this.openMe = openMe;
    this.closeMe = closeMe;
    this.goToScreen = goToScreen;
    console.debug("THIS IS sales BI Modal!");

    return (
      <Modal
        style={{
          backgroundColor: "#fff",
          height: LayoutHelper.getDynamicModalHeight(),
          //paddingBottom: 10,
          borderRadius: 20,          
          width: width - 4,
          borderWidth: 1,
          borderColor: "red",   
          overflow:"hidden"      
        }}
        backdrop={true}
        position={"center"}
        ref={"salesBIModal"}
        isOpen={this.props.openClosed}
        onClosed={() => this.closeMe()} 
        swipeToClose={true}
        backdropPressToClose={true}
      >
        <Header
          backgroundColor={"red"}
          outerContainerStyles={{
            height: 49,
            paddingTop: 0,
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19
          }}
          rightComponent={{
            icon: "close",
            color: "#fff",
            onPress: () => this.props.closeMe(),
          }}
          centerComponent={{
            text: "Business Intelligence",
            style: { color: "#fff" },
          }}
        />
        <View style={{ flexGrow: 1, marginBottom: 40, 
        borderBottomLeftRadius:20, 
          orderBottomRightRadius:20, 
          overflow:"hidden" }}>
          <ScrollView>
            <TouchableOpacity>
            {/* TABS */}
            <View>{this._renderTabView()}</View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    );
  }
}
