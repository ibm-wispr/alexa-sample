/**
 * This sample is adapted from the AWS Simple Trivia skill sample.  It handles 2 intents with no slots.
 *
 */

'use strict';

/**
 * To hide the url, username, and password to the WISPr server, we use environment variables.
 * To sign up for your username/password and get access to the API's, please sign up at http://www2.wispr.rocks/signup
 */
// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
var SERVER_URL = process.env.SERVER_URL;
var USERNAME = process.env.USERNAME;
var PASSWORD = process.env.PASSWORD;
var request = require('request');

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

//     if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.05aecccb3-1461-48fb-a008-822ddrt6b516") {
//         context.fail("Invalid Application ID");
//      }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    handleAnswerRequest(intent, session, callback);
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

// ------- Skill specific business logic -------

var CARD_TITLE = "WISPr"; // Be sure to change this for your skill.

function getWelcomeResponse(callback) {
    var sessionAttributes = {},
        speechOutput = "Hello",
        shouldEndSession = true;

    sessionAttributes = {
        "speechOutput": speechOutput,
    };
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, shouldEndSession));
}

//This function handles all requests to make it simple
function handleAnswerRequest(intent, session, callback) {
  var speechOutput = "";
  //login to the WISPr server
    request.post({url:SERVER_URL + 'api/authentication/login',body: {username:USERNAME,password:PASSWORD},json:true}, function optionalCallback(err, httpResponse, body) {
      if (err) {
        speechOutput = "Sorry, I cannot connect to Wispr.";
      }else{
        //get the JWT token to be used for subsequent requests.
        var jwt = body.data[0].jwt;
        //get all the emails in the inbox
        request.get({url:SERVER_URL + 'api/messages/search?start=0&tag=INBOX', headers: {"Authorization": jwt},json:true}, function optionalCallback(err, httpResponse, body) {
          //check the intent from alexa.  You can find the intents defined in intent.json.  Intent.json is not used, but is copied into the Alexa Skill
          //more details on intents can be found here - https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interaction-model-reference
        if (intent.name == 'GetEmailCount'){
          //if the intent is just asking for the number of emails the person has received, send back the email count.
          speechOutput = 'You have ' + body.data.length + ' emails in your inbox';
        }else{
          //if the intent is asking for who sent the most new emails to the person, count them up and send back the most annoying person
          var names = new Object();
          body.data.forEach(function(email){
            //console.log(email.from);
            if (names[email.from]){
              names[email.from] += 1;
            }else{
              names[email.from] = 1;
            }
          });
          var annoyingPerson;
          var annoyingCount = 0;
          for (var name in names){
            if (names[name] > annoyingCount){
              annoyingPerson = name;
              annoyingCount = names[name];
            }
          }
          speechOutput = 'The most annoying person is ' + annoyingPerson + ' with ' + annoyingCount + ' emails';
        }

          //build the response and send it back to Alexa!
          var sessionAttributes = {};
          sessionAttributes = {
              "speechOutput": speechOutput,
          };
                  callback(sessionAttributes,
                      buildSpeechletResponse(CARD_TITLE, speechOutput, "", true));
        });
      }
    });
}


function handleGetHelpRequest(intent, session, callback) {
    // Provide a help prompt for the user, explaining how the game is played. Then, continue the game
    // if there is one in progress, or provide the option to start another one.

    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }

    // Set a flag to track that we're in the Help state.
    session.attributes.userPromptedToContinue = true;

    // Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.

    var speechOutput = "You can ask how many emails or who is the most annoying person";
        var shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, "", shouldEndSession));
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}


// ------- Helper functions to build responses -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
