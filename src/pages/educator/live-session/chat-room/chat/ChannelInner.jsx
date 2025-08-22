import React from 'react';
import { MessageInput, VirtualizedMessageList, Window } from 'stream-chat-react';
import { useOverrideSubmit } from '../hooks/useOverrideSubmit';
import { User } from 'lucide-react';
import UserList from './UserList';



export const ChannelInner = () => {
  const overrideSubmitHandler = useOverrideSubmit();

  return (
    <>
      <Window>
        <VirtualizedMessageList
          additionalVirtuosoProps={{ alignToBottom: true, followOutput: true, }}
          hideDeletedMessages
          separateGiphyPreview
        />
        {/* <UserList /> */}
        <MessageInput maxRows={2} grow overrideSubmitHandler={overrideSubmitHandler} />
      </Window>
    </>
  );
};
