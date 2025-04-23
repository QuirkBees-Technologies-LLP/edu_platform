import React from 'react'
import { Container } from '@/components/container';

const LiveSessionCategoryDetails = () => {
  return (
    <div>
      <Container>
        <div class="grid grid-cols-3 gap-4">
            <div className="card">
                <div className="card-body">
                    <h6 className='text-lg text-center font-medium text-gray-900 mb-3'>Cedric Bierbaum</h6>
                    <img className='rounded-xl h-52 w-full object-cover' src="/media/images/600x400/1.jpg" alt="" />
                </div>
            </div>
        </div>
      </Container>
    </div>
  )
}

export default LiveSessionCategoryDetails
