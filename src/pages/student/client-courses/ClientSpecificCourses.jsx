import React from 'react'
import { Container } from '@/components/container';
import { Play } from 'lucide-react';

const ClientSpecificCourses = () => {
  return (
    <div>
      <Container>
        <div class="grid grid-cols-12 gap-4">
          <div className="xl:col-span-8 col-span-12">
            <iframe className='w-full rounded-lg' height="480" src="https://www.youtube.com/embed/j6Ule7GXaRs" title="Learn Web Design For Beginners - Full Course" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            <div className="mt-3">
              <h3 className='text-2xl font-semibold text-gray-900'>Binance Earn</h3>
              <h5 className='text-md font-medium text-gray-700'>Binance Training</h5>
            </div>
          </div>
          <div className="xl:col-span-4 col-span-12">
            <div className="card p-3 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className='text-lg font-medium text-gray-900'>Binance Training</h4>
                <span>4 Lessons</span>
              </div>
              <div className="flex flex-col">
                <div className="rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className='flex items-center gap-2'>
                      <span>1</span>
                      <img className='rounded-xl h-14 w-24 object-cover' src="/media/images/600x400/1.jpg" alt="" />
                    </div>
                    <div>
                      <h4 className='text-md font-medium text-gray-900'>Binance Earn</h4>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className='flex items-center gap-2'>
                      <span>2</span>
                      <img className='rounded-xl h-14 w-24 object-cover' src="/media/images/600x400/1.jpg" alt="" />
                    </div>
                    <div>
                      <h4 className='text-md font-medium text-gray-900'>Binance Earn</h4>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className='flex items-center gap-2'>
                      <span>3</span>
                      <img className='rounded-xl h-14 w-24 object-cover' src="/media/images/600x400/1.jpg" alt="" />
                    </div>
                    <div>
                      <h4 className='text-md font-medium text-gray-900'>Binance Earn</h4>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className='flex items-center gap-2'>
                      <span>4</span>
                      <img className='rounded-xl h-14 w-24 object-cover' src="/media/images/600x400/1.jpg" alt="" />
                    </div>
                    <div>
                      <h4 className='text-md font-medium text-gray-900'>Binance Earn</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default ClientSpecificCourses
