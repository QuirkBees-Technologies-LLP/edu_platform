import React from 'react'
import logo from '../../../public/media/app/default-logo.png';
import bgImage from '../../../public/media/images/1920x1080/bg-img.png';

const TermsOfService = () => {
    return (
        <div className='bg-cover bg-center bg-fixed w-full overflow-auto' style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="flex justify-center items-start min-h-screen  dark:bg-gray-900 p-4 sm:p-6 md:p-8 w-full"
        >
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 sm:p-8 md:p-10 my-8">
                <div className='flex justify-center mb-5'>
                    <img src={logo} alt="IQONIC Logo" className='w-40 ' />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    Terms of Service
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 text-center">
                    Effective Date: 1st September 2025
                </p>

                <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                        By using IQONIC, you agree to these terms:
                    </p>

                    <div>
                        <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                            1. Using Our Services
                        </h2>
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>You must be at least 13 years old.</li>
                            <li>Provide accurate info when creating an account.</li>
                            <li>Keep your account credentials secure.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                            2. Acceptable Use
                        </h2>
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>No illegal or unauthorized activities.</li>
                            <li>Do not disrupt the app or access data you’re not authorized to see.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                            3. Intellectual Property
                        </h2>
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>IQONIC owns all content and branding.</li>
                            <li>Do not copy or distribute materials without permission.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                            4. Data and Privacy
                        </h2>
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>Subject to our Privacy Policy.</li>
                            <li>We do not sell your data.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                            5. Termination
                        </h2>
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>We may suspend or terminate accounts for violations.</li>
                            <li>You may terminate your account via the app.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                            6. Disclaimers
                        </h2>
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>Services are provided “as is” without warranties.</li>
                            <li>No guarantee of error-free or uninterrupted access.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                            Contact Us
                        </h2>
                        <p>Email: <a href="mailto:support@iqonic.space" className="text-primary hover:underline">support@iqonic.space</a></p>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default TermsOfService