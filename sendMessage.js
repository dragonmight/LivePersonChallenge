// This file exists to test in isolation, the sendMessage() function using the unit test framework defined in sendMessage.test.js

// fetch had to be defined as below for the test to go through (source: StackOverflow)
fetch = jest.fn(() => Promise.resolve());

// the conversationId variable will be used later to store the return value of the function for testing purposes, as an example
let conversationId = "";

function sendMessage(
    strAccountNumber = accountNumber.toString(),
    message = "My first message"
  ) {
    // Part 1
    // Step 1. Extract domain for idp
    fetch(
      `https://api.liveperson.net/api/account/${strAccountNumber}/service/idp/baseURI.json?version=1.0`
    )
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        /**
       * 
      Step 2. Extract the baseURI component from the data object returned
       which will then be used to obtain the JWT
       */
        let baseURI = data.baseURI;
        return baseURI;
      })
      .then((uri) => {
        // Step 2. Obtaining the JWT using the idp domain baseURI
        fetch(`https://${uri}/api/account/${strAccountNumber}/signup`, {
          method: "POST"
        })
          .then((response) => response.json())
          .then((data) => {
            // console.log(data.jwt);
            return data.jwt;
            /**
             * The JWT obtained looks similar to below
             * eyJraWQiOiIwMDAwMSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJhYzg0ZTFjZi1hOTI3LTRmNDMtOWI0Ny1hODk4YjQ3MzVmNWEiLCJhdWQiOiJhY2M6NjYwMDE3NzUiLCJpc3MiOiJodHRwczpcL1wvaWRwLmxpdmVwZXJzb24ubmV0IiwiZXhwIjoyMDUzOTEwMzE4LCJpYXQiOjE2NDM2NzAyNzgsImp0aSI6ImY3OGViMDE3LTFkZmItNDM3ZS1iNzExLTAwYWNiODFmZmM0NyJ9.SlJC3WKOfknmIYuZUfTovSEbn1jKU9OAeglT6GCnozCZsnyaB4mCYpIlsMh0uDRZAl4pHcGjpO4llJkPFQ-zGT8CdQuAujLY7uQUpn5F1XYtIIGRcMy_uWnPcm7YwgfilP6ZVCayPgekZUiqS_sj-T1u5Rbo4Ud4vBFdOkuiZQ2_pjo2l_0fXynJE8Iax-IJrssNYL3tQMvBmb-3-zv4s8sSA4XbBFHftaOHNvSN69guY9nHvbldBzajASYfl06NzxuMXgua2mw4AJQWvKIXZVaTptcz3PHNtpFBUgFYLr21qHGrNaost97V3M55rQkdMDy3S_gyNYCSepQ0Wu4LMw
             */
          })
          .then((jwt) => {
            // Step 1. Extract domain for asyncMessagingEnt and use it to open web socket connection
            fetch(
              `https://api.liveperson.net/api/account/${strAccountNumber}/service/asyncMessagingEnt/baseURI.json?version=1.0`
            )
              .then((response) => response.json())
              .then((data) => {
                // console.log(data.baseURI);
                return data.baseURI;
              })
              .then((asyncMessagingEntURI) => {
                // Step 3. Create a new web socket using the domain found under asyncMessagingEnt
                // console.log(asyncMessagingEntURI);
                var socket = new WebSocket(
                  `wss://${asyncMessagingEntURI}/ws_api/account/${strAccountNumber}/messaging/consumer?v=3`
                );
  
                // Step 4. Initiate the connection using the JWT provided in step 2
                var msg = {
                  kind: "req",
                  id: "0",
                  type: "InitConnection",
                  headers: [
                    {
                      type: ".ams.headers.ClientProperties",
                      deviceFamily: "DESKTOP",
                      os: "WINDOWS"
                    },
                    {
                      type: ".ams.headers.ConsumerAuthentication",
                      jwt: jwt
                    }
                  ]
                };
  
                // Creating a socket listener to receive response from the server
                // Step 5. From this response, we can get the conversationId
                socket.onmessage = function (event) {
                  // console.log(JSON.parse(event.data).body);
                  let temp1 = JSON.parse(event.data).body.conversationId;
                  // console.log(temp1);
  
                  // Step 6. Use conversationId to publish content to conversation
                  // Step 7. You can verify that the published message appears on the Agent Console
                  if (temp1) {
                    conversationId = temp1;
                    var msg3 = {
                      kind: "req",
                      id: "2",
                      type: "ms.PublishEvent",
                      body: {
                        dialogId: temp1, //the id here should be the id from last response
                        event: {
                          type: "ContentEvent",
                          contentType: "text/plain",
                          message: message
                        }
                      }
                    };
  
                    socket.send(JSON.stringify(msg3));
  
                    // Step 8. Close the conversation
                    var msg_close = {
                      kind: "req",
                      id: "3",
                      type: "cm.UpdateConversationField",
                      body: {
                        conversationId: temp1,
                        conversationField: [
                          {
                            field: "ConversationStateField",
                            conversationState: "CLOSE"
                          }
                        ]
                      }
                    };
                    socket.send(JSON.stringify(msg_close));
                  }
                  // console.log(message + " successfully sent");
                };
  
                socket.onopen = function (event) {
                  socket.send(JSON.stringify(msg));
                  var msg2 = {
                    kind: "req",
                    id: 1,
                    type: "cm.ConsumerRequestConversation"
                  };
                  socket.send(JSON.stringify(msg2));
                  // console.log(socket);
                };
              })
              // The lines of code below are meant to catch and display all errors
              .catch(function (error) {
                console.log(error);
              });
          })
          .catch(function (error) {
            console.log(error);
          });
      })
      .catch(function (error) {
        console.log(error);
      })
      .catch(function (error) {
        console.log(error);
      });
      // this return value is useful for testing purposes as an example
    return conversationId;
  }

  // The line below is according to the syntax for running tests according to jest - the unit testing tool
  module.exports = sendMessage;