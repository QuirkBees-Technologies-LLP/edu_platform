import { useCallback, useEffect, useState } from 'react';
import { ChatAutoComplete, CooldownTimer, useMessageInputContext } from 'stream-chat-react';

// import { CommandBolt, GiphyIcon, GiphySearch, SendArrow } from '../../assets';
// import { EmojiPicker } from './EmojiPicker';
import { useEventContext } from '../context/EventContext';
import { useGiphyContext } from '../context/GiphyContext';

export const MessageInputUI = () => {
  const {
    closeCommandsList,
    cooldownInterval,
    cooldownRemaining,
    handleChange,
    handleSubmit,
    numberOfUploads,
    openCommandsList,
    setCooldownRemaining,
    text,
  } = useMessageInputContext();

  const { chatType } = useEventContext();
  const { giphyState, setGiphyState } = useGiphyContext();

  const [commandsOpen, setCommandsOpen] = useState(false);

  useEffect(() => {
    const handleClick = () => {
      closeCommandsList();
      setCommandsOpen(false);
    };

    if (commandsOpen) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [commandsOpen]);

  const onChange = useCallback((event) => {
    const { value } = event.target;

    const deletePressed =
      event.nativeEvent instanceof InputEvent &&
      event.nativeEvent.inputType === 'deleteContentBackward';

    if (text.length === 1 && deletePressed) {
      setGiphyState(false);
    }

    if (!giphyState && text.startsWith('/giphy') && !numberOfUploads) {
      event.target.value = value.replace('/giphy', '');
      setGiphyState(true);
    }

    handleChange(event);
  }, [text, giphyState, numberOfUploads, handleChange]);

  const handleCommandsClick = () => {
    openCommandsList();
    setGiphyState(false);
    setCommandsOpen(true);
  };

  return (
    <div className='input-ui-container '>
      <div className={`input-ui-input ${giphyState ? 'giphy' : ''}`}>
        {/* {giphyState && !numberOfUploads && <GiphyIcon />} */}
        <ChatAutoComplete className="form-control input input-sm" onChange={onChange} placeholder='Say something' />
        {chatType !== 'qa' && (
          <>
            <div
              className={`input-ui-input-commands-button ${cooldownRemaining ? 'cooldown' : ''}`}
              onClick={cooldownRemaining ? () => null : handleCommandsClick}
              role='button'
            >
              {/* <CommandBolt /> */}
            </div>
            {/* {!giphyState && <EmojiPicker />} */}
          </>
        )}
      </div>
      <button
        className={`btn btn-sm btn-primary mt-3 input-ui-send-button ${text ? 'text' : ''} ${cooldownRemaining ? 'cooldown' : ''}`}
        disabled={!text}
        onClick={handleSubmit}
      >
        {giphyState ? (
          //   <GiphySearch />
          <></>
        ) : cooldownRemaining ? (
          <div className='input-ui-send-cooldown'>
            <CooldownTimer
              cooldownInterval={cooldownInterval}
              setCooldownRemaining={setCooldownRemaining}
            />
          </div>
        ) : (
          <>
            {/* <SendArrow /> */}
            <i class="ki-filled ki-arrow-right"></i>
            <div>{269 - text.length}</div>
          </>
        )}
      </button>
    </div>
  );
};
