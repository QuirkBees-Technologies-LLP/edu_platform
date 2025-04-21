import React from 'react'
import { Container } from '@/components/container';

const LiveSessionCategory = () => {
  return (
    <div>
      <Container>
        <div class="grid grid-cols-3 gap-4">
          <div className="card">
            <div className="card-body">
              <div className="flex justify-between items-center mb-5">
                <h4 className='text-lg font-semibold text-gray-800'>Crypto Acadmy</h4>
                <i class="ki-filled ki-arrow-up-right"></i>
              </div>
              <img className='rounded-xl h-52 w-full object-cover' src="/media/images/600x400/1.jpg" alt="" />
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex justify-between items-center mb-5">
                <h4 className='text-lg font-semibold text-gray-800'>Crypto Acadmy</h4>
                <i class="ki-filled ki-arrow-up-right"></i>
              </div>
              <img className='rounded-xl h-52 w-full object-cover' src="/media/images/2600x1600/1.png" alt="" />
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex justify-between items-center mb-5">
                <h4 className='text-lg font-semibold text-gray-800'>Crypto Acadmy</h4>
                <i class="ki-filled ki-arrow-up-right"></i>
              </div>
              <img className='rounded-xl h-52 w-full object-cover' src="/media/images/600x600/1.jpg" alt="" />
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex justify-between items-center mb-5">
                <h4 className='text-lg font-semibold text-gray-800'>Crypto Acadmy</h4>
                <i class="ki-filled ki-arrow-up-right"></i>
              </div>
              <img className='rounded-xl h-52 w-full object-cover' src="/media/images/2600x1200/1.png" alt="" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default LiveSessionCategory
