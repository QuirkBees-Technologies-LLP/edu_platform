import React from 'react';
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import { getOrderedImageUrls } from "@/utils/mediaOrder";

// Only ever opened on Ideas (Insights use iq-insight/ImageLightBox), so the ordering here
// can match the Idea cards unconditionally: the same stored order they display, so the
// slide the user clicked is the slide that opens rather than a different one.
const ImageLightBox = ({ isLightBoxOpen, setIsLightBoxOpen, selectedIdea }) => {
  const orderedUrls = getOrderedImageUrls(selectedIdea);
  const images = orderedUrls.length > 0 ? orderedUrls.map((image) => ({
    src: image,
    alt: "image 1",
    width: 3840,
    height: 2560,
    srcSet: [
      { src: image, width: 320, height: 213 },
      { src: image, width: 640, height: 427 },
      { src: image, width: 1200, height: 800 },
      { src: image, width: 2048, height: 1365 },
      { src: image, width: 3840, height: 2560 },
    ],
  })) : [];

  return (
    <div> <Lightbox
      plugins={[Captions, Fullscreen, Slideshow, Thumbnails, Video, Zoom, Counter]}
      open={isLightBoxOpen}
      close={() => setIsLightBoxOpen(false)}
      slides={images}
    /></div>
  )
}

export default ImageLightBox