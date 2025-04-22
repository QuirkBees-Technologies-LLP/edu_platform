import React from 'react'
import { Container } from '@/components/container';

const StudentLiveSessionCategoryDetails = () => {
  return (
    <div>
      <Container>
        <div class="grid xl:grid-cols-3 sm:grid-cols-2 gap-4">
          <div className="card">
            <div className="card-body">
              <h6 className='text-lg text-center font-medium text-gray-900 mb-3'>Cedric Bierbaum</h6>
              <img className='rounded-xl h-80 w-full object-cover' src="/media/images/600x400/1.jpg" alt="" />
              <button className='btn text-md btn-primary text-white w-full justify-center mt-3'>Access to live</button>
              <button className='btn text-md bg-primary-light text-primary w-full justify-center mt-3'>Access to Courses</button>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h6 className='text-lg text-center font-medium text-gray-900 mb-3'>Cedric Bierbaum</h6>
              <img className='rounded-xl h-80 w-full object-cover' src="/media/images/600x400/1.jpg" alt="" />
              <button className='btn text-md btn-primary text-white w-full justify-center mt-3'>Access to live</button>
              <button className='btn text-md bg-primary-light text-primary w-full justify-center mt-3'>Access to Courses</button>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h6 className='text-lg text-center font-medium text-gray-900 mb-3'>Cedric Bierbaum</h6>
              <img className='rounded-xl h-80 w-full object-cover' src="/media/images/600x400/1.jpg" alt="" />
              <button className='btn text-md btn-primary text-white w-full justify-center mt-3'>Access to live</button>
              <button className='btn text-md bg-primary-light text-primary w-full justify-center mt-3'>Access to Courses</button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default StudentLiveSessionCategoryDetails
