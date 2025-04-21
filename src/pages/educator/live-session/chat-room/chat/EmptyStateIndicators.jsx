import React from 'react';
import { useEventContext } from '../../contexts/EventContext';
import { EmptyChatIcon, EmptyDMIcon, EmptyQAIcon } from '../assets';

const EmptyStateWrapper = ({ children }) => (
  <div className='chat-components-empty'>{children}</div>
);

const emptyStateIndicatorContents = ({ chatType, isDmChannel }) => {
  let Icon;
  let title;
  let description;

  switch (chatType) {
    case 'qa':
      Icon = EmptyQAIcon;
      title = 'No questions yet';
      description = 'Send a question to the speakers.';
      break;

    case 'direct':
      Icon = isDmChannel ? EmptyChatIcon : EmptyDMIcon;
      title = isDmChannel ? 'No chat yet' : 'No direct messages yet';
      description = isDmChannel
        ? 'Send a message to start the conversation.'
        : 'You will see your first direct message here when it is received.';
      break;

    default:
      Icon = EmptyChatIcon;
      title = 'No chat yet';
      description = 'Send a message to start the conversation.';
      break;
  }

  return { Icon, description, title };
};

export const EmptyStateIndicatorChannel = (props) => {
  return <EmptyStateIndicators {...props} />;
};

export const EmptyStateIndicators = ({ isDmChannel }) => {
  const { chatType } = useEventContext();
  const { Icon, description, title } = emptyStateIndicatorContents({ chatType, isDmChannel });

  return (
    <EmptyStateWrapper>
      <Icon />
      <div>{title}</div>
      <div>{description}</div>
    </EmptyStateWrapper>
  );
};
