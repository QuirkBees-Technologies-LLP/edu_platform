import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";

const ImageLightBox = ({ isLightBoxOpen, setIsLightBoxOpen, selectedIdea }) => {
  const images = selectedIdea?.image?.length > 0 ? selectedIdea.image.map((image) => ({
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