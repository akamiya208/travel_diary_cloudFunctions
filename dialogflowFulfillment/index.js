// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient, Image} = require('dialogflow-fulfillment');
const axios = require('axios');
const qs = require('qs');

exports.dialogflowFulfillment = functions.https.onRequest((request, response) => {
    const data = qs.stringify({
      'text': request.body.queryResult.parameters.text
    });
  	const agent = new WebhookClient({ request, response });

	axios({
            method: 'post',
            url: process.env['SEND_IMAGE_API_URL'],
            data : data
        })
        .then(function (response) {
      		function SendImage(agent){
              agent.add("画像作成したよ");
              agent.add(new Image({
                imageUrl: response.data.url,
                platform: "LINE"
              }));
            }

            let intentMap = new Map();
  			intentMap.set(process.env['SEND_IMAGE_INTENT'], SendImage);
  			agent.handleRequest(intentMap);
        })
        .catch(function (error) {
      		console.log(error);
      
            function NoSendImage(agent){
				agent.add(`うまく返せませんでした．`);
            }
      		
            let intentMap = new Map();
  			intentMap.set(process.env['SEND_IMAGE_INTENT'], NoSendImage);
  			agent.handleRequest(intentMap);            
        });
});
