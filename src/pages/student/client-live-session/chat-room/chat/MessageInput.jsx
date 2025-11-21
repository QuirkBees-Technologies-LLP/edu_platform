import { useCallback, useEffect, useState } from "react";
import {
  ChatAutoComplete,
  CooldownTimer,
  useMessageInputContext,
} from "stream-chat-react";
import { useEventContext } from "../context/EventContext";
import { useGiphyContext } from "../context/GiphyContext";
import { Send } from "lucide-react";
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

  const [commandsOpen, setCommandsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => {
      // setShowEmojiPicker(false);
      closeCommandsList();
      setCommandsOpen(false);
    };

    if (commandsOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [commandsOpen]);

  const onEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const newEvent = {
      target: { value: text + emoji },
      preventDefault: () => { },
    };
    handleChange(newEvent);
  };

  const onChange = useCallback(
    (event) => {
      const { value } = event.target;
      const deletePressed =
        event.nativeEvent instanceof InputEvent &&
        event.nativeEvent.inputType === "deleteContentBackward";

      if (text && text.length === 1 && deletePressed) {
        setGiphyState(false);
      }

      if (!giphyState && value.startsWith("/giphy") && !numberOfUploads) {
        event.target.value = value.replace("/giphy", "");
        setGiphyState(true);
      }
      handleChange(event);
    },
    [text, giphyState, numberOfUploads, handleChange, setGiphyState]
  );

  const handleCommandsClick = (e) => {
    e.stopPropagation();
    openCommandsList();
    setGiphyState(false);
    setCommandsOpen(true);
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
        // flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* INPUT CONTAINER */}
      <div
        className={`input-ui-input  dark:bg-gray-900 bg-gray-200 ${giphyState ? "giphy" : ""}`}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          borderRadius: "8px",
          padding: "6px 10px",
          boxSizing: "border-box",
        }}
      >
        {/* EMOJI BUTTON */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowEmojiPicker((v) => !v);
          }}
          aria-label="Toggle emoji picker"
          style={{
            background: "transparent",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            marginRight: 6,
          }}
        >
          😀
        </button>

        {/* INPUT (full width) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <ChatAutoComplete
            className="form-control input input-sm"
            onChange={onChange}
            placeholder="Your Comment..."
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "14px",
              background: "transparent",
            }}
          />
        </div>

        {/* COMMANDS BUTTON (optional) */}
        {chatType !== "qa" && (
          <></>
          // <div
          //   className={`input-ui-input-commands-button ${
          //     cooldownRemaining ? "cooldown" : ""
          //   }`}
          //   onClick={cooldownRemaining ? () => null : handleCommandsClick}
          //   role="button"
          //   style={{
          //     marginLeft: 6,
          //     cursor: "pointer",
          //     color: "#666",
          //   }}
          // >
          //   ⚙️
          // </div>
        )}
      </div>

      {/* EMOJI PICKER */}
      {showEmojiPicker && (
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            left: "0",
            zIndex: 1200,
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      {/* SEND BUTTON */}
      <button
        className={`btn btn-sm input-ui-send-button ${text ? "text" : ""} ${cooldownRemaining ? "cooldown" : ""
          }`}
        disabled={!text}
        onClick={handleSend}
        style={{
          marginTop: 12,
          alignSelf: "flex-end",
          background: "#4f46e5",
          color: "#fff",
          borderRadius: "6px",
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: text ? "pointer" : "not-allowed",
          position: "absolute",
          right: "20px",
          zIndex: 1,
          top:"15px",
          bottom: "20px",
          opacity: text ? 1 : 0.6,
        }}
      >
        {giphyState ? (
          <></>
        ) : cooldownRemaining ? (
          <div className="input-ui-send-cooldown">
            <CooldownTimer
              cooldownInterval={cooldownInterval}
              setCooldownRemaining={setCooldownRemaining}
            />
          </div>
        ) : (
          <Send size={20} />
        )}
      </button>
    </div >
  );
};
