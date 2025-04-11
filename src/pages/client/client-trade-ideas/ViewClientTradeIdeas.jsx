import React, { forwardRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ClientTradeSlider from './ClientTradeSlider';
import { format } from 'date-fns';

const ViewClientTradeIdeas = forwardRef(({ isViewOpen, handleCloseView, selectedIdea, setIsLightBoxOpen }, ref) => {
    return (
        <Dialog asChild open={isViewOpen} onOpenChange={() => {
            handleCloseView();
        }}>
            <DialogContent forceMount className="max-w-[800px]" ref={ref}>
                <DialogHeader className="sr-only">
                    <DialogTitle className="sr-only">text</DialogTitle>
                </DialogHeader>
                <div className="grid gap-5 px-0">
                    <div className="grid grid-cols-12 gap-4">
                        <div class="col-span-12">
                            <div class="flex items-center px-4 pb-3 pt-3">
                                <div class="mr-2 text-lg text-gray-900 font-semibold">{selectedIdea?.name}</div>
                            </div>
                            {/* <div className="flex px-4">
                                <div class="mr-2 mb-3 text-md text-gray-900 font-semibold">Buy</div>
                                <div class="mr-2 mb-3 text-md text-gray-900 font-semibold">•</div>
                                <div class="mr-2 mb-3 text-md text-gray-900 font-semibold">5m</div>
                                <div class="mr-2 mb-3 text-md text-gray-900 font-semibold">•</div>
                                <div class="mr-2 mb-3 text-md text-gray-900 font-semibold">Scalp</div>
                            </div> */}
                            <ClientTradeSlider sliderImages={selectedIdea?.image} setIsLightBoxOpen={setIsLightBoxOpen} selectedIdea={selectedIdea}/>
                            <div className="grid gap-5 p-5">
                                <div className="grid grid-cols-12 gap-4">
                                    <div class="col-span-6">
                                        <div class="flex flex-col gap-2 py-4.5">
                                            <div class="flex gap-10">
                                                <div>
                                                    <div class="text-2sm text-gray-800 uppercase">Entry</div>
                                                    <div class="text-sm text-gray-900 font-semibold">{selectedIdea?.entry ?? "-"}</div>
                                                </div>
                                                <div>
                                                    <div class="text-2sm text-gray-800 uppercase">Invalidation</div>
                                                    <div class="text-sm text-gray-900 font-semibold">{selectedIdea?.invalidation ?? "-"}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="text-2sm text-gray-800 uppercase">Exits</div>
                                                <div class="flex items-center flex-wrap gap-2">
                                                    {selectedIdea?.exits?.length > 0 && selectedIdea?.exits?.map((exit, index) => (
                                                        <div key={index} class="flex items-center gap-2 mt-1">
                                                            <div class="inline-flex items-center justify-center shrink-0 rounded-full border-2 border-primary text-dark text-sm size-5 bg-white">{index + 1}</div>
                                                            <div class="text-sm text-gray-900 font-semibold">{exit}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-span-6">
                                        <div className="card">
                                            <div class="flex flex-col gap-4 px-5 py-4.5">
                                                <div class="flex flex-col gap-3">
                                                    <p class="text-md font-medium text-gray-900">
                                                        {selectedIdea?.message ?? "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center p-5">
                                <img src="/media/avatars/300-6.png" class="rounded-full size-7 me-2" alt="" />
                                <div>
                                    <a class="text-2sm text-gray-800 hover:text-primary mb-px" href="/public-profile/profiles/nft">{selectedIdea?.educatorDetails?.name}</a>
                                    {selectedIdea?.createAt && <div class="text-2sm text-gray-700 mb-px">{format(selectedIdea?.createAt, "MMM dd, yyyy, hh:mm a")}</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
})

export default ViewClientTradeIdeas