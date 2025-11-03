import React from "react";
import Slider from "react-slick";
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

export default function EducatorTradeSlider({
  sliderImages,
  setIsLightBoxOpen,
  selectedIdea,
}) {
  const settings = {
    dots: sliderImages?.length > 1,
    arrows: sliderImages?.length > 1,
    infinite: sliderImages?.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    autoplay: sliderImages?.length > 1,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12">
        {sliderImages?.length > 0 ? (
          <Slider {...settings}>
            {sliderImages.map((image, index) => (
              <div
                key={index}
                onClick={() => setIsLightBoxOpen(true)}
                className="cursor-pointer"
              >
                <img
                  className="w-full h-96 object-cover rounded-lg"
                  src={image}
                  alt={`Trade image ${index}`}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
            No Image Available
          </div>
        )}

        <div className="flex flex-col gap-2 py-4.5">
          <div className="flex gap-5 sm:gap-10 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-800 uppercase">Entry</div>
              <span className="mt-1 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                {selectedIdea?.entry ?? "-"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2sm text-gray-800 uppercase">
                Invalidation
              </div>
              <span className="mt-1 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">
                {selectedIdea?.invalidation ?? "-"}
              </span>
            </div>
          </div>

          <div>
            <div className="text-2sm text-gray-800 uppercase mb-3">Exits</div>
            <div className="flex items-center flex-wrap gap-2">
              {selectedIdea?.exits?.length > 0 ? (
                selectedIdea.exits.map((exit, index) => (
                  <div key={index} className="flex items-center gap-2 mt-1">
                    <div className="inline-flex items-center justify-center shrink-0 rounded-full border-2 border-primary text-dark text-sm size-5 bg-white">
                      {index + 1}
                    </div>
                    <div className="text-sm text-gray-900 font-semibold">
                      {exit}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">No exits</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
