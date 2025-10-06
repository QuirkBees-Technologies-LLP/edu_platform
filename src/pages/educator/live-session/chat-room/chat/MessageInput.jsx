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

import { useEventContext } from "../context/EventContext";
import { useGiphyContext } from "../context/GiphyContext";
import EmojiPicker from "emoji-picker-react";

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
      preventDefault: () => {},
    };
    handleChange(newEvent);
  };

  const handleSend = () => {
    handleSubmit();
    setShowEmojiPicker(false);
  };

 return (
  <div
    style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      width: "100%",
    }}
  >
    {/* Input Row */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px", // optional spacing
      }}
    >
      {/* Buttons */}
      {chatType !== "qa" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* Emoji Button */}
          <div
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            style={{
              fontSize: "22px",
              cursor: "pointer",
              transition: "transform 0.2s",
              userSelect: "none",
            }}
            onMouseOver={(e) => (e.target.style.transform = "scale(1.2)")}
            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
          >
            😊
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div style={{ flex: 1 }}>
        <ChatAutoComplete
          style={{
            width: "100%",
          }}
          onChange={onChange}
          value={text}
          placeholder="Say something..."
        />
      </div>
    </div>

    {/* Emoji Picker Popup */}
    {showEmojiPicker && (
      <div
        style={{
          position: "absolute",
          bottom: "60px",
          left: "0",
          zIndex: 50,
          boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          borderRadius: "10px",
        }}
      >
        <EmojiPicker
          onEmojiClick={onEmojiClick}
          theme="light"
          height={350}
          width={300}
        />
      </div>
    )}

    {/* Send Button */}
    <button
      className={`btn btn-sm btn-primary mt-3 input-ui-send-button ${
        text ? "text" : ""
      } ${cooldownRemaining ? "cooldown" : ""}`}
      disabled={!text}
      onClick={handleSend}
      style={{
        alignSelf: "flex-end",
        marginTop: "10px",
        opacity: !text ? 0.6 : 1,
        cursor: !text ? "not-allowed" : "pointer",
        transition: "opacity 0.3s",
      }}
    >
      {giphyState ? (
        <></>
      ) : cooldownRemaining ? (
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <CooldownTimer
            cooldownInterval={cooldownInterval}
            setCooldownRemaining={setCooldownRemaining}
          />
        </div>
      ) : (
        <>
          <i className="ki-filled ki-arrow-right"></i>
          <div style={{ marginLeft: "5px" }}>{269 - text.length}</div>
        </>
      )}
    </button>
  </div>
);

};

