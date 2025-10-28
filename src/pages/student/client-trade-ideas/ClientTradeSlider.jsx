import React from "react";
import Slider from "react-slick";
import ShowMoreLess from "../../../components/ui/showmoreless";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

function PrevArrow(props) {
  const { className, onClick } = props;
  return (
    <button
      className={`${className} !left-3 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow-md`}
      onClick={onClick}
      aria-label="Previous slide"
    >
      <ChevronLeft size={20} />
    </button>
  );
}

function NextArrow(props) {
  const { className, onClick } = props;
  return (
    <button
      className={`${className} !right-3 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow-md`}
      onClick={onClick}
      aria-label="Next slide"
    >
      <ChevronRight size={20} />
    </button>
  );
}

export default function ClientTradeSlider({
  sliderImages,
  setIsLightBoxOpen,
  selectedIdea,
}) {
  const settings = {
    dots: sliderImages?.length > 1,
    infinite: sliderImages?.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,

    appendDots: (dots) => (
      <div>
        <ul className="flex justify-center gap-2 mt-4">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-2 h-2 bg-gray-400 rounded-full hover:bg-gray-700" />
    ),
  };
  console.log("selectedIdea", sliderImages);

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 relative">
        {sliderImages?.length > 0 ? (
          <Slider {...settings}>
            {sliderImages.map((image, index) => (
              <div
                key={index}
                onClick={() => setIsLightBoxOpen(true)}
                className="cursor-pointer"
              >
                <img
                  className="w-full rounded-lg object-cover max-h-[400px]"
                  src={image}
                  alt={`Trade image ${index}`}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="text-gray-500 text-center py-6">
            No images available
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Entry</span>
            <span className="font-medium text-gray-800">
              {selectedIdea?.entry}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Stop Loss</span>
            <span className="font-medium text-gray-800">
              {selectedIdea?.invalidation}
            </span>
          </div>

          {[0, 1, 2].map((idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-600">{`Exit ${idx + 1}`}</span>
              <span className="font-medium text-gray-800">
                {selectedIdea?.exits?.[idx] ?? "N/A"}
              </span>
            </div>
          ))}

          <ShowMoreLess
            html={selectedIdea?.description || "No description"}
            limit={95}
          />
        </div>
      </div>
    </div>
  );
}
