import React from 'react'
import logo from '../../../public/media/app/default-logo.png'
import bgImage from '../../../public/media/images/1920x1080/bg-img.png';

const PrivacyPolicy = () => {
    return (
        <div className='bg-cover bg-center bg-fixed w-full overflow-auto' style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="flex justify-center items-start w-full min-h-screen p-4 sm:p-6 md:p-8">
                <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 sm:p-8 md:p-10 my-8">
                    <div className='flex justify-center mb-5'>
                        <img src={logo} alt="" className='w-40 ' />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                        Privacy Policy
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 text-center">
                        Effective Date: 1st September 2025
                    </p>

                    <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                        <p>
                            IQONIC (“we”, “our”, or “us”) respects your privacy. This Privacy Policy explains how we handle your information when you use our app and related services.
                        </p>

                        <div>
                            <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                1. Information We Collect
                            </h2>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li>
                                    <strong>Account Info:</strong> Name, email address, or phone number if you sign up.
                                </li>
                                <li>
                                    <strong>Usage Data:</strong> Device info, app version, and app activity.
                                </li>
                                <li>
                                    <strong>Optional Info:</strong> Any data you voluntarily provide (profile details, feedback, preferences).
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                2. How We Use Information
                            </h2>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li>Provide and improve our services</li>
                                <li>Communicate with you (support, updates, notifications)</li>
                                <li>Maintain security and prevent misuse</li>
                                <li>Comply with legal requirements</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                3. Sharing of Information
                            </h2>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li>We do not sell your personal data.</li>
                                <li>We may share data only with trusted service providers or if required by law.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                4. Data Security
                            </h2>
                            <p>
                                We take reasonable measures to protect your data, but no system is 100% secure.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                5. Your Choices
                            </h2>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li>Access, update, or delete account information in the app.</li>
                                <li>Opt out of optional communications.</li>
                                <li>Uninstall the app to stop data collection.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                6. Children’s Privacy
                            </h2>
                            <p>Our app is not for children under 13.</p>
                        </div>

                        <div>
                            <h2 className="text-xl sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                7. Contact Us
                            </h2>
                            <p>Email: <a href="mailto:support@iqonic.space" className="text-primary hover:underline">support@iqonic.space</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy