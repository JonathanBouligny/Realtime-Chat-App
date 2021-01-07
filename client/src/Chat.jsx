import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useSubscription,
  gql,
  useMutation,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { Container, Row, Col, FormInput, Button } from "shards-react";

const link = new WebSocketLink({
  uri: `ws://localhost:4000/`,
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link,
  uri: "http://localhost:4000/",
  cache: new InMemoryCache(),
});

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      content
      user
    }
  }
`;

const POST_MESSAGE = gql`
  mutation($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const Messages = ({ user }) => {
  const { data } = useSubscription(GET_MESSAGES);

  if (!data) {
    return null;
  }

  return (
    <div>
      {data.messages.map(({ id, user: messageUser, content }) => {
        return (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent:
                  user === messageUser ? "flex-end" : "flex-start",
                paddingBOttom: "1em",
              }}
            >
              {user !== messageUser && (
                <div
                  style={{
                    height: "50px",
                    width: "50px",
                    marginRight: "0.5em",
                    border: "2px solid #e5e6ea",
                    borderRadius: "25px",
                    textAlign: "center",
                    fontSize: "25px",
                  }}
                >
                  {messageUser.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div
                style={{
                  background: user === messageUser ? "#58bf56" : "#e5e6ea",
                  color: user === messageUser ? "white" : "black",
                  padding: "1em",
                  borderRadius: "1em",
                  maxWidth: "60%",
                }}
              >
                {content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Chat = () => {
  const [state, stateSet] = React.useState({
    user: "Jack",
    content: "",
  });
  const [postMessage] = useMutation(POST_MESSAGE);

  const onSend = () => {
    if (state.content.length > 0) {
      postMessage({
        variables: state,
      });
    }
    stateSet({
      ...state,
      content: "",
    });
  };
  return (
    <Container>
      <Messages user={state.user}></Messages>
      <Row>
        <Col xs={2} style={{ padding: 0 }}>
          <FormInput
            label="User"
            value={state.user}
            onChange={(evt) =>
              stateSet({
                ...state,
                user: evt.target.value,
              })
            }
          ></FormInput>
        </Col>
        <Col xs={8} style={{ padding: 0 }}>
          <FormInput
            label="Message"
            value={state.content}
            onChange={(evt) =>
              stateSet({
                ...state,
                content: evt.target.value,
              })
            }
            onKeyUp={(evt) => {
              if (evt.keyCode === 13) {
                onSend();
              }
            }}
          ></FormInput>
        </Col>
        <Col xs={2} style={{ padding: 0 }}>
          <Button onClick={() => onSend()}>Send</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default () => {
  return (
    <ApolloProvider client={client}>
      <Chat></Chat>
    </ApolloProvider>
  );
};
