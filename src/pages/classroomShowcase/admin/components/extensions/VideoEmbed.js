import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import VideoEmbedComponent from "./VideoEmbedComponent";

const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-url"),
        renderHTML: (attributes) => {
          return {
            "data-url": attributes.url,
          };
        },
      },
      provider: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-provider"),
        renderHTML: (attributes) => {
          return {
            "data-provider": attributes.provider,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video-embed"]',
        getAttrs: (element) => {
          if (typeof element === "string") return {};
          return {
            url: element.getAttribute("data-url"),
            provider: element.getAttribute("data-provider"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-type": "video-embed", ...HTMLAttributes }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedComponent);
  },

  addCommands() {
    return {
      setVideoEmbed:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});

export default VideoEmbed;
