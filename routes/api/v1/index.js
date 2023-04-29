import express from 'express';
var router = express.Router();

import CommunicationService from "../../../services/CommunicationService.js";


/**
 * hooked at /api/v1/
 */

router.get("/", getClientInformation);
router.post("/tcpTest", tcpTest);
router.post("/requestAuthentication", connectToServer);

function getClientInformation(req, res, next){

}

function tcpTest (req, res, next){
    CommunicationService.handleTCPConnectionRequest(req.body)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            next(err);
        })
}

function connectToServer(req, res, next) {
    //server is asking us to connect via TCP
    let data = req.body;
    CommunicationService.handleTCPConnectionRequest(req.body)
      .then(result => {
          //return our client information
          const response = {
              clientId: result.server.clientId,
              connected: result.state,
          }
          res.json(response);
      })
      .catch(err => {
        next(err);
      })

}


export default router;