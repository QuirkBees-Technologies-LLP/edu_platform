import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ShowMoreLess from "../../../components/ui/showmoreless";
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

       
        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-normal text-sm">Entry</span>
            <span className="font-medium text-gray-800">
              {selectedIdea?.entry ?? "N/A"}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-normal text-sm">Stop Loss</span>
            <span className="font-medium text-gray-800">
              {selectedIdea?.invalidation ?? "N/A"}
            </span>
          </div>

          {[0, 1, 2].map((idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-600 font-normal text-sm">
                {`Exit ${idx + 1}`}
              </span>
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
