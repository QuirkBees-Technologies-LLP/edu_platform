import { useCallback, useEffect, useState } from 'react';
import { ChatAutoComplete, CooldownTimer, useMessageInputContext } from 'stream-chat-react';

// import { CommandBolt, GiphyIcon, GiphySearch, SendArrow } from '../../assets';
// import { EmojiPicker } from './EmojiPicker';
import { useEventContext } from '../context/EventContext';
import { useGiphyContext } from '../context/GiphyContext';
import { Send } from 'lucide-react';

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
    <div className='live_chat input-ui-container relative'>
      <div className={`input-ui-input ${giphyState ? 'giphy' : ''}`}>
        {/* {giphyState && !numberOfUploads && <GiphyIcon />} */}
        <ChatAutoComplete className="form-control input input-sm" onChange={onChange} placeholder='Your Comment...' />
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
        className={`btn btn-sm input-ui-send-button ${text ? 'text' : ''} ${cooldownRemaining ? 'cooldown' : ''}`}
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
            <Send size={22} />
            {/* <i class="ki-filled ki-arrow-right"></i> */}
            {/* <div>{269 - text.length}</div> */}
          </>
        )}
      </button>
    </div>
  );
};



// import { useCallback, useEffect, useState } from 'react';
// import { ChatAutoComplete, CooldownTimer, useMessageInputContext } from 'stream-chat-react';
// import { useEventContext } from '../context/EventContext';
// import { useGiphyContext } from '../context/GiphyContext';
// import { Send } from 'lucide-react';
// import EmojiPicker from 'emoji-picker-react';

// export const MessageInputUI = () => {
//   const {
//     closeCommandsList,
//     cooldownInterval,
//     cooldownRemaining,
//     handleChange,
//     handleSubmit,
//     numberOfUploads,
//     openCommandsList,
//     setCooldownRemaining,
//     text,
//   } = useMessageInputContext();

//   const { chatType } = useEventContext();
//   const { giphyState, setGiphyState } = useGiphyContext();

//   const [commandsOpen, setCommandsOpen] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);

//   useEffect(() => {
//     const handleClickOutside = () => {
//       setShowEmojiPicker(false);
//       closeCommandsList();
//       setCommandsOpen(false);
//     };
//     document.addEventListener('click', handleClickOutside);
//     return () => document.removeEventListener('click', handleClickOutside);
//   }, [closeCommandsList]);

//   const onEmojiClick = (emojiData) => {
//     const input = document.querySelector('input.form-control, textarea.form-control');
//     if (!input) return;

//     const currentText = input.value || '';
//     const newText = currentText + emojiData.emoji;

//     input.value = newText;

//     const event = new Event('input', { bubbles: true });
//     input.dispatchEvent(event);

//     input.focus();
//   };

//   const onChange = useCallback(
//     (event) => {
//       const { value } = event.target;
//       const deletePressed =
//         event.nativeEvent instanceof InputEvent &&
//         event.nativeEvent.inputType === 'deleteContentBackward';

//       if (text && text.length === 1 && deletePressed) {
//         setGiphyState(false);
//       }

//       if (!giphyState && value.startsWith('/giphy') && !numberOfUploads) {
//         event.target.value = value.replace('/giphy', '');
//         setGiphyState(true);
//       }

//       handleChange(event);
//     },
//     [text, giphyState, numberOfUploads, handleChange, setGiphyState]
//   );

//   const handleCommandsClick = (e) => {
//     e.stopPropagation();
//     openCommandsList();
//     setGiphyState(false);
//     setCommandsOpen(true);
//   };

//   return (
//     <div className="live_chat input-ui-container relative" style={{ position: 'relative' }}>
//       <div className={`input-ui-input ${giphyState ? 'giphy' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
//         <button
//           type="button"
//           onClick={(e) => {
//             e.stopPropagation();
//             setShowEmojiPicker((v) => !v);
//           }}
//           aria-label="Toggle emoji picker"
//           style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', marginRight: 8 }}
//         >
//           😀
//         </button>

//         <ChatAutoComplete
//           className="form-control input input-sm"
//           onChange={onChange}
//           placeholder="Your Comment..."
//         />

//         {chatType !== 'qa' && (
//           <div
//             className={`input-ui-input-commands-button ${cooldownRemaining ? 'cooldown' : ''}`}
//             onClick={cooldownRemaining ? () => null : handleCommandsClick}
//             role="button"
//             style={{ marginLeft: 8 }}
//           />
//         )}
//       </div>

//       {showEmojiPicker && (
//         <div
//           style={{
//             position: 'absolute',
//             bottom: '56px',
//             left: '8px',
//             zIndex: 1200,
//             boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <EmojiPicker onEmojiClick={onEmojiClick} />
//         </div>
//       )}

//       <button
//         className={`btn btn-sm input-ui-send-button ${text ? 'text' : ''} ${cooldownRemaining ? 'cooldown' : ''}`}
//         disabled={!text}
//         onClick={handleSubmit}
//         style={{ marginTop: 10 }}
//       >
//         {giphyState ? (
//           <></>
//         ) : cooldownRemaining ? (
//           <div className="input-ui-send-cooldown">
//             <CooldownTimer cooldownInterval={cooldownInterval} setCooldownRemaining={setCooldownRemaining} />
//           </div>
//         ) : (
//           <Send size={22} />
//         )}
//       </button>
//     </div>
//   );
// };

