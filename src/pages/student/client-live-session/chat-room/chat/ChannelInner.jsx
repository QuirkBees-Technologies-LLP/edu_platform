import React from 'react';
import { MessageInput, MessageList, Window } from 'stream-chat-react';
import { useOverrideSubmit } from '../hooks/useOverrideSubmit';



export const ChannelInner = () => {
  
  const overrideSubmitHandler = useOverrideSubmit();

  return (
    <>
      <Window>
        <MessageList
          hideDeletedMessages
          messageActions={["react"]}
        />
        <MessageInput maxRows={2} grow overrideSubmitHandler={overrideSubmitHandler} />
      </Window>
    </>
  );
};
