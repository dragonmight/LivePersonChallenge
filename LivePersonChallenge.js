// 1. Extract domain for idp
fetch(
    "https://api.liveperson.net/api/account/66001775/service/idp/baseURI.json?version=1.0"
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      // within the data object you can have below info
      let baseURI = data.baseURI;
      return baseURI;
  
      // you better not use these info outside this block. because here is an async function
      //create a function outside and use it here
      //pass these info as parameters
    })
    .then((uri) => {
      fetch("https://" + uri + "/api/account/66001775/signup", {
        method: "POST"
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log(data.jwt);
          return data.jwt;
          /**
           * eyJraWQiOiIwMDAwMSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJhYzg0ZTFjZi1hOTI3LTRmNDMtOWI0Ny1hODk4YjQ3MzVmNWEiLCJhdWQiOiJhY2M6NjYwMDE3NzUiLCJpc3MiOiJodHRwczpcL1wvaWRwLmxpdmVwZXJzb24ubmV0IiwiZXhwIjoyMDUzOTEwMzE4LCJpYXQiOjE2NDM2NzAyNzgsImp0aSI6ImY3OGViMDE3LTFkZmItNDM3ZS1iNzExLTAwYWNiODFmZmM0NyJ9.SlJC3WKOfknmIYuZUfTovSEbn1jKU9OAeglT6GCnozCZsnyaB4mCYpIlsMh0uDRZAl4pHcGjpO4llJkPFQ-zGT8CdQuAujLY7uQUpn5F1XYtIIGRcMy_uWnPcm7YwgfilP6ZVCayPgekZUiqS_sj-T1u5Rbo4Ud4vBFdOkuiZQ2_pjo2l_0fXynJE8Iax-IJrssNYL3tQMvBmb-3-zv4s8sSA4XbBFHftaOHNvSN69guY9nHvbldBzajASYfl06NzxuMXgua2mw4AJQWvKIXZVaTptcz3PHNtpFBUgFYLr21qHGrNaost97V3M55rQkdMDy3S_gyNYCSepQ0Wu4LMw
           */
        })
        .then((jwt) => {
          // 2. Extract domain for asyncMessagingEnt
          fetch(
            "https://api.liveperson.net/api/account/66001775/service/asyncMessagingEnt/baseURI.json?version=1.0"
          )
            .then((response) => response.json())
            .then((data) => {
              // console.log(data.baseURI);
              return data.baseURI;
            })
            .then((uri) => {
              // console.log(uri);
              var exampleSocket = new WebSocket(
                "wss://" + uri + "/ws_api/account/66001775/messaging/consumer?v=3"
              );
              // console.log(exampleSocket)  ;
              return exampleSocket;
            })
            .then((socket) => {
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
  
              socket.onmessage = function (event) {
                console.log(event.data);
                let temp1 = JSON.parse(event.data).body.conversationId;
                // console.log(temp1);
  
                if (temp1) {
                  // console.log('HELLO')
                  var msg3 = {
                    kind: "req",
                    id: "2",
                    type: "ms.PublishEvent",
                    body: {
                      dialogId: temp1, //the id here should be the id from last response
                      event: {
                        type: "ContentEvent",
                        contentType: "text/plain",
                        message: "My first message"
                      }
                    }
                  };
  
                  socket.send(JSON.stringify(msg3));
  
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
            });
        });
    });
  