/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import SignInSlide from "components/login/SignInSlide";
import LicenseeLayout from "./layouts/Licensee";
import PropTypes from "prop-types";
import Logout from "components/login/Logout";
// import Devices from "./views/Devices";

import { DrizzleContext } from "@drizzle/react-plugin";
import { Drizzle } from "@drizzle/store";
import Web3 from "web3";
import getContractObjects from "scripts/getContractObjects";
import SmartLicense1 from "./contracts/SmartLicense1.json";
import OracleDemo from "./contracts/OracleDemo.json";
import LoadingAnimation from "components/login/LoadingAnimation";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import getContractsAbi from "variables/GetContractsAbi";
import SmartLicense3 from "contracts/SmartLicense3.json";

let provider = new Web3.providers.HttpProvider("http://localhost:8545");
var web3 = new Web3(provider);

const URL = "ws://localhost:3030";
let ws = new WebSocket(URL);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.updateTransactionHistory = this.updateTransactionHistory.bind(this);
    this.setToken = this.setToken.bind(this);
    this.logout = this.logout.bind(this);
    this.setAppState = this.setAppState.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.submitMessage = this.submitMessage.bind(this);
    this.confirmSL = this.confirmSL.bind(this);
    this.rejectSL = this.rejectSL.bind(this);
    this.setSLState = this.setSLState.bind(this);
    this.state = {
      drizzle: null,
      token: null,
      appState: 0,
      transactionHistory: [],
      contracts: null,
      smartLicenses: null,
      deviceManagers: null,
      licensors: null,
      ips: null,
      deviceIds: null,
      slIpMap: null,
      ipDeviceMap: null,
      ipSlMap: null,
      needRefresh: false,
      messages: new Map(),
      isSLConfirmed: false,
      slCreationList: [],
      isSLRejected: false,
      step: 0,
    };
  }

  setSLState() {
    console.log("WENT IN CHANGE SL STATE IN APP");
    this.setState({ isSLRejected: false, isSLConfirmed: false });
  }

  updateTransactionHistory(newHistory) {
    this.setState((prevState) => ({
      transactionHistory: newHistory,
    }));
  }

  setToken(newToken, newState) {
    this.setState({
      token: newToken,
      needRefresh: true,
      appState: newState,
    });
  }

  logout() {
    localStorage.clear();
    this.setState({
      token: null,
    });
  }

  setAppState(state) {
    this.setState({
      appState: state,
    });
  }

  refresh() {
    this.setState({
      needRefresh: false,
    });
    window.location.reload();
  }

  updateMessagesLocalStorage(newMessagesMap) {
    let myMap = JSON.stringify(Array.from(newMessagesMap.entries()));
    localStorage.setItem("messageMap", myMap);
  }

  componentDidMount() {
    // Load tokens from localStorage if they exist
    const storedToken = localStorage.getItem("CurrentToken");
    const storedAppState = localStorage.getItem("AppState");
    
    if (storedToken && storedAppState) {
      this.setState({
        token: storedToken,
        appState: storedAppState,
        needRefresh: true,
      });
    }

    this._asyncRequest = getContractObjects(web3, SmartLicense1).then(
      (result) => {
        this._asyncRequest = null;
        let contracts = result[0];
        console.log("RESULT", result);
        
        // Only add OracleDemo if it has a deployed address
        // For now, we'll skip it since it's not deployed
        // contracts.push(OracleDemo);
        
        // Ensure we have valid contracts before creating Drizzle
        if (!contracts || contracts.length === 0) {
          console.warn("No contracts found, creating empty Drizzle instance");
          contracts = [];
        }
        
        const optionsDrizzle = {
          contracts: contracts,
          web3: {
            fallback: {
              type: "ws",
              url: "ws://127.0.0.1:8545",
            },
          },
          events: {
            SmartLicense1: ["PaymentAcknowledged", "RoyaltyComputed"],
          },
        };
        
        try {
          let drizzle = new Drizzle(optionsDrizzle);
          console.log(drizzle);
          
          // Get licensors
          let smartLicenses = result[1];
          let deviceManagers = result[2];
          let licensors = result[3];
          let ips = result[4];
          let deviceIds = result[5];
          let slIpMap = result[6];
          let ipDeviceMap = result[7];
          let ipSlMap = result[8];

          this.setState({
            contracts: contracts,
            drizzle: drizzle,
            smartLicenses: smartLicenses,
            deviceManagers: deviceManagers,
            licensors: licensors,
            ips: ips,
            deviceIds: deviceIds,
            slIpMap: slIpMap,
            ipDeviceMap: ipDeviceMap,
            ipSlMap: ipSlMap,
            needRefresh: false,
          });
        } catch (error) {
          console.error("Error creating Drizzle instance:", error);
          // Set a minimal state to prevent crashes
          this.setState({
            contracts: [],
            drizzle: null,
            smartLicenses: new Map(),
            deviceManagers: new Map(),
            licensors: new Map(),
            ips: new Map(),
            deviceIds: new Map(),
            slIpMap: new Map(),
            ipDeviceMap: new Map(),
            ipSlMap: new Map(),
            needRefresh: false,
          });
        }
      }
    ).catch((error) => {
      console.error("Error in getContractObjects:", error);
      // Set a minimal state to prevent crashes
      this.setState({
        contracts: [],
        drizzle: null,
        smartLicenses: new Map(),
        deviceManagers: new Map(),
        licensors: new Map(),
        ips: new Map(),
        deviceIds: new Map(),
        slIpMap: new Map(),
        ipDeviceMap: new Map(),
        ipSlMap: new Map(),
        needRefresh: false,
      });
    });

    ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log("connected");
    };

    ws.onmessage = (evt) => {
      // on receiving a message, add it to the list of messages
      const message = JSON.parse(evt.data);
      console.log("MESSAGE RECEIVED:", message);
      if (message.type === "ACCEPT") {
        this.confirmSL(message.message, message.sign);
      } else if (message.type === "REJECT") {
        this.rejectSL(message.message);
        this.setState({ step: 0 });
      } else if (this.state.appState === "1" && message.type === "CREATE") {
        const mess = {
          party: this.state.appState,
          licensee: message.licensee,
          type: message.type,
          message: message.message,
          licensor: this.state.token,
          sign: message.sign,
        };
        this.addMessage(mess);
        this.setState({ step: 1 });
      } else if (this.state.appState === "1" && message.type === "DEPLOYED") {
        let item = this.state.messages.get(message.message);
        item.type = "DEPLOYED";
        item["address"] = message.address;
        let newMap = new Map(this.state.messages.set(message.message, item));
        this.setState({
          messages: newMap,
        });
        this.updateMessagesLocalStorage(newMap);
      }
    };

    ws.onclose = () => {
      console.log("disconnected");
      // automatically try to reconnect on connection loss
      // this.setState({
      //   ws: new WebSocket(URL),
      // });
      ws = new WebSocket(URL);
    };
  }

  addMessage(message) {
    let newMap = new Map(this.state.messages.set(message.message, message));
    this.setState({ messages: newMap });
    this.updateMessagesLocalStorage(newMap);
  }

  submitMessage(messageString, type, licensor, sign) {
    if (type === "CREATE") {
      const message = {
        party: this.state.appState,
        licensee: this.state.token,
        type: type,
        message: messageString,
        licensor: licensor,
        sign: "",
      };
      // const message = { name: this.state.appState === "0" ? "LICENSEE" : "LICENSOR", message: messageString };
      ws.send(JSON.stringify(message));
      this.addMessage(message);
      return message;
    } else if (type === "ACCEPT") {
      try {
        let item = this.state.messages.get(messageString);
        item.type = "ACCEPT";
        item.sign = sign;
        let newMap = new Map(this.state.messages.set(messageString, item));
        this.setState({
          messages: newMap,
        });
        this.updateMessagesLocalStorage(newMap);
        return item;
      } catch (e) {
        console.log("Server was to slow to retreieve message, retry.");
      }
    } else if (type === "REJECT") {
      try {
        let item = this.state.messages.get(messageString);
        item.type = "REJECT";
        let newMap = new Map(this.state.messages.set(messageString, item));
        this.setState({
          messages: newMap,
        });

        this.updateMessagesLocalStorage(newMap);
        return item;
      } catch (e) {
        console.log("Server was to slow to retreieve message, retry.");
      }
    }
  }

  confirmSL(key, sign) {
    this.setState({
      isSLConfirmed: true,
    });
    let m = this.submitMessage(key, "ACCEPT", "", "");
    if (this.state.appState === "0") {
      this.deploySL(key, sign, m);
    }
  }

  rejectSL(key) {
    this.setState({
      isSLRejected: true,
    });
    this.submitMessage(key, "REJECT", "", "");
  }

  deploySL(key, sign, m) {
    let bytecode = SmartLicense3.bytecode;
    // account hardcorded for testing, for prod -> account = this.state.token (the account adr.)
    let account = "0x0b94431D616Ef6f1Db1FFAcbd6f9793cbAb1d3eC";
    let abi = new web3.eth.Contract(SmartLicense3.abi);

    let payload = {
      data: bytecode,
    };

    try {
      let tx = abi.deploy(payload);

      const options = {
        to: tx._parent._address,
        data: tx.encodeABI(),
        gas: web3.utils.toHex(1000000),
        gasPrice: web3.utils.toHex(web3.utils.toWei("50", "gwei")),
      };
      const signed = web3.eth.accounts
        .signTransaction(options, sign)
        .then((signedTx) =>
          web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        )
        .then((receipt) => {
          console.log("Transaction receipt: ", receipt);
          console.log("Deployed Contract Address : ", receipt.contractAddress);

          // let item = this.state.messages.get(key);
          // item.type = "DEPLOYED";
          // item["address"] = receipt.contractAddress;
          m.type = "DEPLOYED";
          m["address"] = receipt.contractAddress;
          ws.send(JSON.stringify(m));
          this.setState({
            step: 2,
            messages: new Map(this.state.messages.set(key, m)),
          });
        })
        .catch((err) => console.error(err));
    } catch (err) {
      m.type = "REJECT";
      ws.send(JSON.stringify(m));
      this.setState({
        step: 0,
        messages: new Map(this.state.messages.set(key, m)),
      });
      console.log("ERROR in smart license creation", err);
    }
  }

  render() {
    // // Not yet logged in
    if (this.state.token === null && !localStorage.getItem("CurrentToken")) {
      return (
        <SignInSlide setToken={this.setToken} setAppState={this.setAppState} />
      );
      // return <Redirect to={"/licensee/devices"}/>
    } else if (this.state.token === null) {
      // Don't call setState in render - this will be handled in componentDidMount
      return <LoadingAnimation details={"Loading User Data..."} />;
    } else {
      // Token has been set. Store token in local storage. Until log-out (or new token is input)
      localStorage.setItem("CurrentToken", this.state.token);
      localStorage.setItem("AppState", this.state.appState);
    }
    // drizzle not loaded yet
    if (
      this.state.drizzle === null ||
      typeof this.state.drizzle === "undefined"
    ) {
      return <LoadingAnimation details={"Loading Data from Blockchain"} />;
    }
    if (this.state.needRefresh) {
      this.refresh();
    }
    console.log("TOKEN", this.state.token);
    return (
      <DrizzleContext.Provider drizzle={this.state.drizzle}>
        <DrizzleContext.Consumer>
          {(drizzleContext) => {
            const { drizzle, drizzleState, initialized } = drizzleContext;

            if (!initialized) {
              console.log("Intialized check", drizzle, initialized);
              // return "Loading Drizzle State";
              return <LoadingAnimation details={"Rendering Data..."} />;
            }

            const {
              deviceManagers,
              smartLicenses,
              licensors,
              ips,
              deviceIds,
              slIpMap,
              ipDeviceMap,
              ipSlMap,
            } = this.state;
            return (
              <div className="App">
                {/* {console.log("APP DRIZZLESTATE: ", drizzleState, drizzleState.currentBlock)} */}
                <Switch>
                  <Route
                    path="/licensee/devices/:id"
                    render={(props) => (
                      <LicenseeLayout
                        {...props}
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        loading={initialized}
                        deviceManagers={deviceManagers}
                        smartLicenses={smartLicenses}
                        licensors={licensors}
                        ips={ips}
                        deviceIds={deviceIds}
                        slIpMap={slIpMap}
                        ipDeviceMap={ipDeviceMap}
                        ipSlMap={ipSlMap}
                        setToken={this.setToken}
                        logout={this.logout}
                        appState={this.state.appState}
                        onSubmitMessage={(messageString, type) =>
                          this.submitMessage(messageString, type)
                        }
                        isSLConfirmed={this.state.isSLConfirmed}
                        messages={this.state.messages}
                        ws={ws}
                      />
                    )}
                  ></Route>
                  <Route
                    path="/licensee"
                    render={(props) => (
                      <LicenseeLayout
                        {...props}
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        loading={initialized}
                        deviceManagers={deviceManagers}
                        smartLicenses={smartLicenses}
                        licensors={licensors}
                        ips={ips}
                        deviceIds={deviceIds}
                        updateTransactionHistory={this.updateTransactionHistory}
                        transactionHistory={this.state.transactionHistory}
                        slIpMap={slIpMap}
                        ipDeviceMap={ipDeviceMap}
                        ipSlMap={ipSlMap}
                        setToken={this.setToken}
                        logout={this.logout}
                        appState={this.state.appState}
                        onSubmitMessage={(
                          messageString,
                          type,
                          licensor,
                          sign
                        ) =>
                          this.submitMessage(
                            messageString,
                            type,
                            licensor,
                            sign
                          )
                        }
                        isSLConfirmed={this.state.isSLConfirmed}
                        isSLRejected={this.state.isSLRejected}
                        messages={this.state.messages}
                        ws={ws}
                        step={this.state.step}
                        setSLState={this.setSLState}
                      />
                    )}
                  />
                  <Route
                    path="/logout"
                    // render={() => <Logout setToken={setToken} />}
                    render={() => <Logout />}
                  />

                  <Redirect to="/licensee/dashboard" />
                </Switch>
              </div>
            );
          }}
        </DrizzleContext.Consumer>
      </DrizzleContext.Provider>
    );
  }
}

App.propTypes = {
  token: PropTypes.string,
  setToken: PropTypes.func,
};

export default App;
