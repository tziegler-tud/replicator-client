import fetch from 'node-fetch';
import db from '../schemes/mongo.js';
const DbServer = db.Server;
import net from "net";
import { io } from "socket.io-client";
import tcpResponse from "../helpers/tcpResponseGenerator.js";
import ApiResponse from "../helpers/apiResponse.js";
import Service from "./Service.js";

import SettingsService from "./SettingsService.js";
import {networkInterfaces} from "os";

/**
 * @typedef CommandObject
 * @property {VoiceCommandObject} command
 * @property {String} clientId
 */

/**
 * @typedef DbServerObject
 * @property {string} identifier
 * @property {string} url
 * @property {string} clientId
 * @property {Object} versionData
 * @property {Object} settings
 * @property {Date} lastConnection
 * @property {Date} createdDate
 *
 */


/**
 * @class
 * @constructor
 * Singleton
 */
class CommunicationService extends Service {
    constructor() {
        super();
        let self = this;
        this.knownServers = [];
        this.currentServer = undefined;
        this.isConnected = false;
        this.url = undefined;
        this.status = this.enums.state.DISABLED;

    }

    initFunc(args) {
        let self = this;
        return new Promise(function (resolve, reject) {
            console.log("Initializing CommunicationService...");
            let errMsg = "Failed to initialize CommunicationService:";

            //wait for settings service to init
            SettingsService.init.then(() => {
                //find available network interfaces
                self.networkAddresses = self.findNetworkInterfaces();
                //if an external address is available, use it. Otherwise, use internal
                if(self.networkAddresses.external.length > 0) {
                    self.selectNetworkInterface(self.networkAddresses.external[0]);
                    console.log("Using network interface: " + self.url)
                }
                else self.selectNetworkInterface(self.networkAddresses.internal[0]);

                //check known servers in db
                DbServer.find()
                    .then(/** @param servers {DbServerObject[]} */ function(servers) {

                        if(!servers || servers.length === 0){
                            //no recent servers found
                            self.state = self.enums.state.READYTOCONNECT;
                        }
                        else {
                            //server entries found.
                            //sort by last Connection and try the most recent one
                            servers.sort(function(a,b){
                                return b.lastConnection - a.lastConnection;
                            })
                            //create rt objects
                            let rtServers = [];
                            servers.forEach(dbServer => {
                                rtServers.push(new Server(dbServer, self.url));
                            })
                            self.knownServers = rtServers;
                            //try to connect to most recent one
                            self.currentServer = new Server(servers[0], self.url);
                            self.currentServer.tcpConnect()
                                .then(result => {
                                    //connection successful
                                    self.state = self.enums.state.CONNECTED;
                                })
                                .catch(err => {
                                    //connection error.
                                    console.log("Failed to connect to last known server. Reason: " + err)
                                    console.log("State is now: " + self.enums.state.READYTOCONNECT);
                                    self.state = self.enums.state.READYTOCONNECT;
                                })

                        }


                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        })
    }

    tcpTest(url,port){
        const serverData = {
            endpoints: {
                tcp: {
                    address: url,
                    port: port
                }
            }
        }
        const server = new Server(serverData);
        server.tcpConnect();
    }

    handleTCPConnectionRequest(serverInformation){
        let self = this;
        const serverId = serverInformation.serverId;
        const url = serverInformation.url;
        const endpoints = serverInformation.endpoints;

        return new Promise(function(resolve, reject){
            if(self.state === self.enums.state.READYTOCONNECT) {
                //decide whether we want to register or connect
                //lookup server in known hosts
                let knownHost = self.knownServers.find(server => server.serverId.toString() === serverInformation.serverId.toString())
                if (knownHost){
                    //update server endpoints
                    knownHost.endpoints = endpoints;
                    self.currentServer = knownHost;
                    self.currentServer.tcpConnect()
                        .then(result => {
                            self.state = self.enums.state.CONNECTED;
                            const response = {
                                server: self.currentServer,
                                state: self.state,
                                result: new ApiResponse(ApiResponse.apiResponse.REGISTRATION.ALREADYREGISTERED)
                            }
                            resolve(response)
                        })
                        .catch(tcpError => {
                            //failed to connect. Let's look at the error
                            const errData = tcpError.data;
                            let response = {
                                server: self.currentServer,
                                state: self.state,
                                result: new ApiResponse(ApiResponse.apiResponse.REGISTRATION.FAILED),
                                error: tcpError,
                            }
                            switch(errData.code){
                                case 1:
                                    //connection error
                                    response = {
                                        server: self.currentServer,
                                        state: self.state,
                                        result: new ApiResponse(ApiResponse.apiResponse.CONNECTION.FAIL),
                                        error: tcpError,
                                    }

                                    break;
                                case 23:
                                    response = {
                                        server: self.currentServer,
                                        state: self.state,
                                        result: new ApiResponse(ApiResponse.apiResponse.REGISTRATION.EXPIRED)
                                    }
                                    //registration not present on server. Let's update our registration
                                    self.currentServer.tcpRegister()
                                        .then(result=> {
                                            //registration updated.
                                            //update server data
                                            self.currentServer.serverId = result.serverId;
                                            self.currentServer.clientId = result.clientId;
                                            self.currentServer.saveToDb()
                                                .then(result => {
                                                    self.currentServer.tcpConnect()
                                                        .then(result => {
                                                            self.state = self.enums.state.CONNECTED;
                                                            const response = {
                                                                server: self.currentServer,
                                                                state: self.state,
                                                                result: new ApiResponse(ApiResponse.apiResponse.REGISTRATION.RENEWED)
                                                            }
                                                            resolve(response)
                                                        })
                                                        .catch(tcpError => {
                                                            response.error = tcpError;
                                                            reject(response);
                                                        })
                                                })
                                                .catch(err => {
                                                    response.error = err;
                                                    reject(response);
                                                })
                                        })
                                        .catch(err => {
                                            response.error = err;
                                            //failed
                                            reject(response);
                                        })
                                    break;
                                default:
                                    reject(tcpError);
                            }
                        })
                }
                else {
                    //register
                    self.currentServer = new Server(serverInformation, self.url);
                    self.currentServer.tcpRegister()
                        .then(result => {
                            self.currentServer.serverId = result.serverId;
                            self.currentServer.clientId = result.clientId;
                            self.currentServer.saveToDb()
                                .then(result => {
                                    self.currentServer.tcpConnect()
                                        .then(result => {
                                            self.state = self.enums.state.CONNECTED;
                                            const response = {
                                                server: self.currentServer,
                                                state: self.state,
                                                result: new ApiResponse(ApiResponse.apiResponse.REGISTRATION.SUCCESSFULL)
                                            }
                                            resolve(response)
                                        })
                                        .catch(err => {
                                            reject(err);
                                        })
                                })
                                .catch(err => {
                                    reject(err);
                                })
                        })
                        .catch(err => {
                            reject(err);
                        })
                }
            }
            else {
                //check if we are connected to this server
                if(self.currentServer.serverId === serverId){
                    //already connected.
                    const response = {
                        server: self.currentServer,
                        state: self.state,
                        result: apiResponse.REGISTRATION.ALREADYREGISTERED,
                    }
                    resolve(response);
                }
                else {
                    //respond to server that we dont want to connect
                    reject("Connection refused.")
                }


            }
        })
    }

    handleConnectionRequest(serverInformation){
        let self = this;
        const serverId = serverInformation.serverId;
        const requestUrl = serverInformation.requestUrl;
        const url = serverInformation.url ? serverInformation.url : requestUrl;
        const endpoints = serverInformation.endpoints;
        //check if we are ready to connect to a new server
        return new Promise(function(resolve, reject){
            if(self.state === self.enums.state.READYTOCONNECT) {
                //decide whether we want to register or connect
                //lookup server in known hosts
                let knownHost = self.knownServers.find(server => server.serverId.toString() === serverInformation.serverId.toString())
                if (knownHost){
                    //check if url changed
                    if(knownHost.url !== url) {
                        console.warn("Updating server url...");
                        knownHost.url = url;
                    }
                    //connect
                    self.currentServer = new Server(knownHost, self.url);
                    self.currentServer.connect()
                        .then(result => {
                            //update db object
                            self.currentServer.saveToDb();
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        })
                }
                else {
                    //register
                    serverInformation.url = url;
                    self.currentServer = new Server(serverInformation, self.url);
                    self.currentServer.register()
                        .then(result => {
                            self.currentServer.saveToDb()
                                .then(dbServer => {
                                    //lets connect!
                                    self.currentServer.connect()
                                        .then(result => {
                                            //connection successful
                                            self.state = self.enums.state.CONNECTED;
                                            const response = {
                                                server: self.currentServer,
                                                state: self.state,
                                                result: result
                                            }
                                            resolve(response)
                                            resolve(result);
                                        })
                                        .catch(err => {
                                            //saving failed
                                            reject(err);
                                        })
                                })
                                .catch(err => {
                                    //saving failed
                                    reject(err);
                                })

                        })
                        .catch(err => {
                            reject(err);
                        })
                }
            }
            else {
                //respond to server that we dont want to connect
                reject("Connection refused.")
            }
        })


    }

    sendCommand(command){
        this.currentServer.tcpSendCommand(command)
            .then()
            .catch()
    }

    findNetworkInterfaces(){
        const nets = networkInterfaces();
        let results = {
            internal: [],
            external: []
        }
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value) {
                    if(net.internal) results.internal.push({name: name, address: net.address, internal: true});
                    else results.external.push({name: name, address: net.address, external: true});
                }
            }
        }
        //choose first entry
        return results;
    }

    selectNetworkInterface(entry, protocol="http://"){
        if(!entry.address){
            if(typeof entry === "string") entry = {address: entry}
        }
        this.url = protocol + entry.address;
        return this.url;
    }

    enums = {
        state: {
            CONNECTED: "connected",
            DISCONNECTED: "disconnected",
            READYTOCONNECT: "readyToConnect",
            DISABLED:   "disabled",
        },
    }
}

class Server {
    constructor(dbServerObject, clientUrl=""){
        this.dbId = dbServerObject._id;
        this.identifier = dbServerObject.identifier;
        this.serverId = dbServerObject.serverId;
        /**
         *
         * @type {{tcp: {address: string, port: Number}, http: {address: string, port: Number}}|*}
         */
        this.endpoints = dbServerObject.endpoints;
        this.url = dbServerObject.url;
        this.ownUrl = dbServerObject.ownUrl;
        this.clientId = dbServerObject.clientId;
        this.lastConnection = dbServerObject.lastConnection;
        this.createdDate = dbServerObject.createdDate;
        this.clientUrl = clientUrl;

        this.socket = undefined;
        this.connected = false;
    }

    toJSON(){
        return {
            identifier: this.identifier,
            serverId: this.serverId,
            endpoints: this.endpoints,
            url: this.url,
            ownUrl: this.ownUrl,
            clientId: this.clientId,
            lastConnection: this.lastConnection,
            createdDate: this.createdDate,
            connected: this.connected,
        }
    }

    saveToDb(){
        let self = this;
        //check if already in db
        return new Promise((resolve, reject)=> {
            if(self.dbId){
                //update db entry
                DbServer.findById(self.dbId)
                    .then(dbServer => {
                        if(dbServer) {
                            const updatedObject = self;
                            updatedObject.dbId = undefined;
                            dbServer = Object.assign(dbServer,updatedObject);
                            save(dbServer, resolve, reject)
                        }
                        else {
                            //something went wrong. Lets create a new entry
                            let dbServer = new DbServer(this);
                            dbServer.localId = dbServer._id;
                            save(dbServer, resolve, reject)

                        }
                    })
            }
            else {
                let dbServer = new DbServer(this);
                dbServer.localId = dbServer._id;
                save(dbServer, resolve, reject)
            }

            function save(dbServer, resolve, reject){
                dbServer.save()
                    .then(dbServer => {
                        resolve(self);
                    })
                    .catch(err => {
                        reject(err)
                    })
            }
        });
    }

    test(){
        let self = this;
        //test the server url. A replicator-server should respond on the endpoint with status 200
        return new Promise(function(resolve, reject){
            self.send({path: "/hello"})
                .then(response => {
                    if(response.ok){
                        resolve(response);
                    }
                    reject(response);
                })
                .catch(err=> reject(err))
        })
    }

    tcpConnect(){
        let self = this;
        const errMsg = "Failed to connect to server: ";
        return new Promise(function(resolve, reject) {
            //check if socket exists
            if (self.socket) {
                //check if socket is connected
                if (self.socket.connected) {
                    //we are connected. good to go.
                    resolve(self.socket);
                }
                else {
                    self.tcpReconnect()
                        .then(socket => {
                            resolve(self.socket);
                        })
                        .catch(err => {
                            reject(err);
                        })
                }
            }
            else {
                self.tcpCreateSocket()
                    .then(socket => {
                        resolve(self.socket);
                    })
                    .catch(err => {
                        reject(err);
                    })
            }
        })
    }

    tcpCreateSocket(overwrite=true){
        let self = this;
        const errMsg = "Failed to create socket: ";
        return new Promise(function(resolve, reject){
            //check if socket exists
            if (self.socket) {
                //socket exists already. overwrite?
                if(!overwrite) {
                    const msg = errMsg + "Socket exists already."
                    reject(msg);
                }
            }
            //check if clientId is set
            if(!self.clientId){
                //no clientId is set. We need clientId to authenticate at the server
                const msg = errMsg + "No clientId found."
                reject(msg);
            }
            const options = {
                auth: {
                    clientId: self.clientId
                },
            }
            const socket = io("http://" + self.endpoints.tcp.address + ":" + self.endpoints.tcp.port, options);
            socket.on("connect", () => {
                console.log(socket.id); // x8WIv7-mJelg7on_ALbx
                socket.emit("message", "Hello there!");
                self.connected = socket.connected;
                self.socket = socket;
                resolve(socket);
            });
            socket.on("message", function(data){
                console.log(data);
            })
            socket.on("disconnect", () => {
                console.log(socket.id); // undefined
                self.socket = undefined;
                self.connected = false;
            });
            socket.on("connect_error", (err) => {
                //failed to connect
                // console.log(err.message);
                // console.log(err.status);
                // console.log(err.errName);
                reject(err)

            });
            socket.connect();
        })
    }

    tcpReconnect(){
        let self = this;
        const errMsg = "Failed to reconnect to socket: ";
        return new Promise(function(resolve, reject){
            //check if socket exists
            if(self.socket) {
                //reconnect the current Socket
                self.socket.once("connect", function(){
                    self.connected = self.socket.connected;
                    resolve(self.socket);
                })
                self.socket.connect();
            }
            else {
                self.tcpCreateSocket()
                    .then(socket => {
                        resolve(socket);
                    })
                    .catch(err => {
                        reject(err);
                    })
            }
        })
    }

    tcpRegister(force){
        let self = this;
        const errMsg = "Failed to register at server: ";
        return new Promise(function(resolve, reject){
            if(self.clientId) {
                if(!force) {
                    //force renewal
                    console.log("Renewing server registration...")
                }
                else reject(errMsg + "A client id is already set. Maybe you want to connect?");
            }
            //create tcp socket at the register endpoint
            const options = {
                extraHeaders: {
                    originUrl: self.clientUrl,
                }
            }
            const registrationEndpoint = "http://" + self.endpoints.tcp.address + ":" + self.endpoints.tcp.port + "/register";
            const socket = io(registrationEndpoint, options);
            socket.on("connect", () => {
                console.log(socket.id); // x8WIv7-mJelg7on_ALbx
                //try to register
                const settings = SettingsService.getSettings();
                /** @type {any} */
                let authData = {
                    identifier: settings.identifier,
                    url: self.clientUrl,
                    version: settings.version,
                };
                socket.emit("registerClient", authData);

            });
            socket.on("disconnect", () => {

            });
            socket.on("connect_error", (err) => {
                console.log(err instanceof Error);
                console.log(err.message);
                console.log(err.status);
                console.log(err.errName);
                reject(err);
            });
            socket.on("registrationError", function(tcpResponse){
                const err = tcpResponse.error;
                const message = tcpResponse.message;
                const data = tcpResponse.data;

                console.log(errMsg + message);
                reject(tcpResponse);
            })
            socket.on("registrationComplete", function(tcpResponse){
                const err = tcpResponse.error;
                const message = tcpResponse.message;
                const data = tcpResponse.data;
                if(err) {
                    //we did not expect an error here. this is strange
                    reject(tcpResponse);
                }
                console.log("Received tcp message: " + message);
                //data contains a serverId to identify this host and a clientId to identify ourselves.
                self.serverId = data.serverId;
                self.clientId = data.clientId;
                self.client = data.client;
                socket.close();
                resolve(data);
            })
            socket.connect();
        })

    }


    apiRegister(){
        let self = this;
        const errMsg = "Failed to register at server: ";
        return new Promise(function (resolve, reject){
            //check if a client id has been assigned
            if(self.clientId) reject(errMsg + "A client id is already set. Maybe you want to connect?");
            //authenticate at the server. We send our client information to the authenticate endpoint
            /** @type {any} */
            let authData = {
                identifier: SettingsService.getSettings().identifier,
            };
            self.send({path: "/api/v1/clients/register", method: "POST", data: authData})
                .then(response => {
                    if(response.ok){
                        response.json()
                            .then(result => {
                                //we expect to have received a server and client id
                                self.serverId = result.serverId;
                                self.clientId = result.clientId;
                                resolve(result);
                            })
                    }
                    else reject(response)
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    tcpSendCommand(command){
        let self = this;
        return new Promise(function(resolve, reject){
            self.tcpConnect()
                .then(socket => {
                    const commandData = {
                        command: command,
                        clientId: self.clientId,
                    }
                    socket.emit("processCommand", commandData);
                })
                .catch(err => {
                    reject(err)
                })
        })

    }

    apiConnect(){
        let self = this;
        const errMsg = "Failed to authenticate at server: ";
        return new Promise(function (resolve, reject){
            //check if a client id has been assigned
            if(!self.clientId) reject(errMsg + "No client Id set for current server.");
            //authenticate at the server. We send our client information to the authenticate endpoint
            /** @type {any} */
            let authData = {
                identifier: SettingsService.getSettings().identifier,
                clientId: self.clientId,
            };
            self.send({path: "/api/v1/clients/connect", method: "POST", data: authData})
                .then(result => {
                    if (result.ok) {
                        self.lastConnection = Date.now();
                        resolve(result);
                    }
                    reject(result);
                })
                .catch(err => {
                    reject(err);
                })

        })
    }

    send({path="/", method="GET", data={}, options={}}){
        let port = this.endpoints.http.port ? ":" + this.endpoints.http.port : "";
        const url = "http://" + this.endpoints.http.address + port + path;
        let fetchOptions = options;
        fetchOptions.method = method;
        fetchOptions.body = JSON.stringify(data);
        fetchOptions.headers= {"Content-Type": "application/json"}
        return fetch(url, fetchOptions)
    }
}

export default new CommunicationService();
