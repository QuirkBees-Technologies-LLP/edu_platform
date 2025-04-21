import React from "react";
import Slider from "react-slick";

export default function ClientTradeSlider({ sliderImages, setIsLightBoxOpen }) {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  return (
    <>
      <Slider {...settings} className="trade_slider">
        {sliderImages?.length > 0 && sliderImages.map((image, index) => {
          return (
            <div key={index} onClick={() => setIsLightBoxOpen(true)}>
              <img className="w-full" src={image} alt="Trade image"/>
            </div>
          )
        })}
      </Slider>
    </>
  );
}

