import ShowMoreLess from "../../../components/ui/showmoreless";

export default function EducatorTradeSlider({
  sliderImages,
  setIsLightBoxOpen,
  selectedIdea,
}) {
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
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          {sliderImages?.map((image, index) => (
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
          {/* <div className="flex flex-col gap-2 py-4.5">
          <div className="flex gap-5 sm:gap-10 flex-wrap">
              <div className='flex items-center gap-3'>
                  <div className="text-xs text-gray-800 uppercase">Entry</div>
                  <span class="mt-1 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">{selectedIdea?.entry ?? "-"}</span>
              </div>
              <div className='flex items-center gap-3'>
                  <div className="text-2sm text-gray-800 uppercase">Invalidation</div>
                  <span class="mt-1 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">{selectedIdea?.invalidation ?? "-"}</span>
              </div>
          </div>
          <div>
              <div className="text-2sm text-gray-800 uppercase mb-3">Exits</div>
              <div className="flex items-center flex-wrap gap-2">
                  {selectedIdea?.exits?.length > 0 && selectedIdea?.exits?.map((exit, index) => (
                      <div key={index} className="flex items-center gap-2 mt-1">
                          <div className="inline-flex items-center justify-center shrink-0 rounded-full border-2 border-primary text-dark text-sm size-5 bg-white">{index + 1}</div>
                          <div className="text-sm text-gray-900 font-semibold">{exit}</div>
                      </div>
                  ))}
              </div>
          </div>
        </div> */}

          <div className="mt-6 space-y-4">
            {/* <div className="text-2sm text-gray-800 uppercase mb-3">Exits</div>
                  <div className="flex items-center flex-wrap gap-2">
                      {selectedIdea?.exits?.length > 0 && selectedIdea?.exits?.map((exit, index) => (
                          <div key={index} className="flex items-center gap-2 mt-1">
                              <div className="inline-flex items-center justify-center shrink-0 rounded-full border-2 border-primary text-dark text-sm size-5 bg-white">{index + 1}</div>
                              <div className="text-sm text-gray-900 font-semibold">{exit}</div>
                          </div>
                      ))}

                  </div> */}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-normal text-sm">Entry</span>
              <span className="font-medium text-gray-800">
                {selectedIdea?.entry}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-normal text-sm">
                Stop Loss
              </span>
              <span className="font-medium text-gray-800">
                {selectedIdea?.invalidation}
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

        {/* <div className="col-span-12 md:col-span-5">

          <div className=" ideas_message">
            <div className="card-body py-0 px-0">
              <div className="chat p-3 border-2 border-b-0 rounded-t-lg">
                <h3 className="text-lg text-gray-900 font-semibold">Feed</h3>
              </div>
              <div className="chat_message border-2 border-b-0 overflow-auto h-[480px]">
                <div className="no_data flex items-center justify-center h-full hidden">
                  <div className="text-lg text-gray-900 font-semibold">No Chat</div>
                </div>
                <div className="message-ui p-4">
                  <div className='message-ui-content'>
                    <div className='message-ui-content-top'>
                      <div className='message-ui-content-top-time'>25 mins</div>
                      <div className='message-ui-content-top-name text-end'>Akshit Vaholiya</div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='message-ui-content-top-time cursor-pointer'>Edit</div>
                      <div className='message-ui-content-bottom text-end'>asihduasdhudhu</div>
                    </div>
                  </div>
                  <img className="size-10 avatar_img rounded-full" src="/media/avatars/300-1.png" alt="" />
                </div>
                <div className="message-ui p-4">
                  <div className='message-ui-content'>
                    <div className='message-ui-content-top'>
                      <div className='message-ui-content-top-time'>25 mins</div>
                      <div className='message-ui-content-top-name text-end'>Akshit Vaholiya</div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='message-ui-content-top-time cursor-pointer'>Edit</div>
                      <div className='message-ui-content-bottom text-end'>asihduasdhudhu</div>
                    </div>
                  </div>
                  <img className="size-10 avatar_img rounded-full" src="/media/avatars/300-1.png" alt="" />
                </div>
              </div>
              <div className="relative chat_input">
                  <textarea
                    className="rta__textarea w-full pr-14 resize-none border rounded-md p-2"
                    data-testid="message-input"
                    aria-label="Say something"
                    placeholder="Say something"
                    rows="1"
                  ></textarea>

                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-sm btn-primary input-ui-send-button flex items-center gap-1"
                  >
                    <i className="ki-filled ki-arrow-right"></i>
                  </button>
                </div>
            </div>
        </div>
      </div> */}
      </div>
    </>
  );
}
