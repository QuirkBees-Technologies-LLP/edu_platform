import React from 'react'
import { Container } from '@/components/container';

const ClientCourses = () => {
  return (
    <div>
      <Container>
        <div className="card">
          <div className="card-body">
              <h4 className='text-xl font-medium text-gray-900 mb-10'>Binance Training</h4>
              <ul className='flex flex-col md:gap-12 gap-8'>
                <li>
                  <a href="">
                    <div className="flex items-center gap-5">
                      <img className='rounded-xl sm:h-24 sm:w-40 w-20 h-22 object-cover' src="/media/images/600x400/1.jpg" alt="" />
                      <h5 className='sm:text-lg text-md font-semibold text-gray-900'>Binance Earn</h5>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="">
                    <div className="flex items-center gap-5">
                      <img className='rounded-xl sm:h-24 sm:w-40 w-20 h-22 object-cover' src="/media/images/600x400/1.jpg" alt="" />
                      <h5 className='sm:text-lg text-md font-semibold text-gray-900'>Binance Earn</h5>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="">
                    <div className="flex items-center gap-5">
                      <img className='rounded-xl sm:h-24 sm:w-40 w-20 h-22 object-cover' src="/media/images/600x400/1.jpg" alt="" />
                      <h5 className='sm:text-lg text-md font-semibold text-gray-900'>Binance Earn</h5>
                    </div>
                  </a>
                </li>
              </ul>
              <div className="text-end mt-3">
                <button className='btn btn-primary'>More</button>
              </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default ClientCourses
