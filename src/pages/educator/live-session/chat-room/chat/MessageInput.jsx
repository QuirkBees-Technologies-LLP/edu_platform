// import { useCallback, useEffect, useState } from "react";
// import {
//   ChatAutoComplete,
//   CooldownTimer,
//   useMessageInputContext,
// } from "stream-chat-react";

// // import { CommandBolt, GiphyIcon, GiphySearch, SendArrow } from '../../assets';
// // import { EmojiPicker } from './EmojiPicker';
// import { useEventContext } from "../context/EventContext";
// import { useGiphyContext } from "../context/GiphyContext";

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

//   useEffect(() => {
//     const handleClick = () => {
//       closeCommandsList();
//       setCommandsOpen(false);
//     };

//     if (commandsOpen) document.addEventListener("click", handleClick);
//     return () => document.removeEventListener("click", handleClick);
//   }, [commandsOpen]);

//   const onChange = useCallback(
//     (event) => {
//       const { value } = event.target;

//       const deletePressed =
//         event.nativeEvent instanceof InputEvent &&
//         event.nativeEvent.inputType === "deleteContentBackward";

//       if (text.length === 1 && deletePressed) {
//         setGiphyState(false);
//       }

//       if (!giphyState && text.startsWith("/giphy") && !numberOfUploads) {
//         event.target.value = value.replace("/giphy", "");
//         setGiphyState(true);
//       }

//       handleChange(event);
//     },
//     [text, giphyState, numberOfUploads, handleChange]
//   );

//   const handleCommandsClick = () => {
//     openCommandsList();
//     setGiphyState(false);
//     setCommandsOpen(true);
//   };

//   return (
//     // <div className='input-ui-container '>
//     //   <div className={`input-ui-input ${giphyState ? 'giphy' : ''}`}>
//     //     {/* {giphyState && !numberOfUploads && <GiphyIcon />} */}
//     //     <ChatAutoComplete className="form-control input input-sm" onChange={onChange} placeholder='Say something' />
//     //     {chatType !== 'qa' && (
//     //       <>
//     //         <div
//     //           className={`input-ui-input-commands-button ${cooldownRemaining ? 'cooldown' : ''}`}
//     //           onClick={cooldownRemaining ? () => null : handleCommandsClick}
//     //           role='button'
//     //         >
//     //           {/* <CommandBolt /> */}
//     //         </div>
//     //         {/* {!giphyState && <EmojiPicker />} */}
//     //       </>
//     //     )}
//     //   </div>
//     //   <button
//     //     className={`btn btn-sm btn-primary mt-3 input-ui-send-button ${text ? 'text' : ''} ${cooldownRemaining ? 'cooldown' : ''}`}
//     //     disabled={!text}
//     //     onClick={handleSubmit}
//     //   >
//     //     {giphyState ? (
//     //       //   <GiphySearch />
//     //       <></>
//     //     ) : cooldownRemaining ? (
//     //       <div className='input-ui-send-cooldown'>
//     //         <CooldownTimer
//     //           cooldownInterval={cooldownInterval}
//     //           setCooldownRemaining={setCooldownRemaining}
//     //         />
//     //       </div>
//     //     ) : (
//     //       <>
//     //         {/* <SendArrow /> */}
//     //         <i className="ki-filled ki-arrow-right"></i>
//     //         <div>{269 - text.length}</div>
//     //       </>
//     //     )}
//     //   </button>
//     // </div>
//     <div className="input-ui-container relative">
//       <div className={`input-ui-input ${giphyState ? "giphy" : ""}`}>
//         <ChatAutoComplete
//           className="form-control input input-sm"
//           onChange={onChange}
//           value={text}
//           placeholder="Say something"
//         />

//         {chatType !== "qa" && (
//           <div className="flex items-center gap-2">
//             {/* Emoji Button */}
//             <div
//               className="input-ui-input-emoji-button cursor-pointer"
//               onClick={() => setShowEmojiPicker((prev) => !prev)}
//             >
//               😊
//             </div>

//             {/* Command Button */}
//             <div
//               className={`input-ui-input-commands-button ${
//                 cooldownRemaining ? "cooldown" : ""
//               }`}
//               onClick={cooldownRemaining ? () => null : handleCommandsClick}
//               role="button"
//             >
//               ⚡
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Emoji Picker */}
//       {showEmojiPicker && (
//         <div className="absolute bottom-14 left-0 z-50">
//           <EmojiPicker
//             onEmojiClick={onEmojiClick}
//             theme="light"
//             height={350}
//             width={300}
//           />
//         </div>
//       )}

//       <button
//         className={`btn btn-sm btn-primary mt-3 input-ui-send-button ${
//           text ? "text" : ""
//         } ${cooldownRemaining ? "cooldown" : ""}`}
//         disabled={!text}
//         onClick={() => {
//           handleSubmit(text);
//           setText("");
//           setShowEmojiPicker(false);
//         }}
//       >
//         {giphyState ? (
//           <></>
//         ) : cooldownRemaining ? (
//           <div className="input-ui-send-cooldown">
//             <CooldownTimer
//               cooldownInterval={cooldownInterval}
//               setCooldownRemaining={setCooldownRemaining}
//             />
//           </div>
//         ) : (
//           <>
//             <i className="ki-filled ki-arrow-right"></i>
//             <div>{269 - text.length}</div>
//           </>
//         )}
//       </button>
//     </div>
//   );
// };


import { useCallback, useEffect, useState } from "react";
import {
  ChatAutoComplete,
  CooldownTimer,
  useMessageInputContext,
} from "stream-chat-react";
import { useParams } from "react-router-dom";

import { useEventContext } from "../context/EventContext";
import { useGiphyContext } from "../context/GiphyContext";
import EmojiPicker from "emoji-picker-react";
import CreateLiveTradeIdea from "../../../educator-live-trade-ideas/CreateLiveTradeIdea";

export const MessageInputUI = () => {
  const [isCreateIdeaOpen, setIsCreateIdeaOpen] = useState(false);

  const { callId } = useParams();


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

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commandsOpen, setCommandsOpen] = useState(false);

  // close commands dropdown if clicked outside
  useEffect(() => {
    const handleClick = () => {
      closeCommandsList();
      setCommandsOpen(false);
    };
    if (commandsOpen) document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [commandsOpen]);

  const onChange = useCallback(
    (event) => {
      const { value } = event.target;

      const deletePressed =
        event.nativeEvent instanceof InputEvent &&
        event.nativeEvent.inputType === "deleteContentBackward";

      if (text.length === 1 && deletePressed) {
        setGiphyState(false);
      }

      if (!giphyState && text.startsWith("/giphy") && !numberOfUploads) {
        event.target.value = value.replace("/giphy", "");
        setGiphyState(true);
      }

      handleChange(event);
    },
    [text, giphyState, numberOfUploads, handleChange, setGiphyState]
  );

  const handleCommandsClick = () => {
    openCommandsList();
    setGiphyState(false);
    setCommandsOpen(true);
  };

  const onEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const newEvent = {
      target: { value: text + emoji },
      preventDefault: () => { },
    };
    handleChange(newEvent);
  };

  const handleSend = () => {
    handleSubmit();
    setShowEmojiPicker(false);
  };

  return (
    <>
      <div className="relative flex flex-col w-full gap-2">
        {/* Input Row */}
        <div className="flex items-center gap-2">
          {/* Emoji Button */}
          {chatType !== "qa" && (
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-lg leading-none select-none bg-transparent border-0 p-0 outline-none transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              😊
            </button>
          )}

          {/* Chat Input */}
          <div className="flex-1 min-w-0">
            <ChatAutoComplete
              onChange={onChange}
              value={text}
              placeholder="Say anything."
            />
          </div>
        </div>

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 z-50 mb-2 rounded-xl shadow-lg">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme="light"
              height={350}
              width={300}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setIsCreateIdeaOpen(true)}
          >
            Create Live Idea
          </button>
          {/* Send Button */}
          <button
            className={`btn btn-sm btn-primary input-ui-send-button disabled:opacity-60 disabled:cursor-not-allowed ${text ? "text" : ""
              } ${cooldownRemaining ? "cooldown" : ""}`}
            disabled={!text}
            onClick={handleSend}
          >
            {giphyState ? (
              <></>
            ) : cooldownRemaining ? (
              <div className="flex items-center gap-1.5">
                <CooldownTimer
                  cooldownInterval={cooldownInterval}
                  setCooldownRemaining={setCooldownRemaining}
                />
              </div>
            ) : (
              <>
                <i className="ki-filled ki-arrow-right"></i>
                <div className="ml-1">{269 - text.length}</div>
              </>
            )}
          </button>
        </div>
      </div>
      {
        isCreateIdeaOpen && (
          <CreateLiveTradeIdea
            onClose={() => setIsCreateIdeaOpen(false)}
            callId={callId}
            isCreateOpen={isCreateIdeaOpen}
            handleCloseCreate={() => setIsCreateIdeaOpen(false)}

          />
        )
      }
    </>



  );

};

