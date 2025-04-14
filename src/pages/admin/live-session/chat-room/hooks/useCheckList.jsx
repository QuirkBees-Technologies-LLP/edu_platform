import { useEffect } from 'react';
import { StreamChat } from 'stream-chat';

const Task = {
  Reaction: 'react-to-message',
  Giphy: 'run-giphy',
  SendMessage: 'send-message',
};

export const useCheckList = ({ chatClient, targetOrigin }) => {
  useEffect(() => {
    const notifyParent = (message) => {
      if (targetOrigin) {
        window?.parent?.postMessage(message, targetOrigin);
      }
    };

    const handleNewEvent = ({ type, message }) => {
      switch (type) {
        case 'reaction.new':
          notifyParent(Task.Reaction);
          break;
        case 'message.new':
          if (message?.command === 'giphy') {
            notifyParent(Task.Giphy);
            break;
          }
          notifyParent(Task.SendMessage);
          break;
        default:
          break;
      }
    };

    if (chatClient) {
      chatClient.on(handleNewEvent);
    }

    return () => {
      chatClient?.off(handleNewEvent);
    };
  }, [chatClient, targetOrigin]);
};
