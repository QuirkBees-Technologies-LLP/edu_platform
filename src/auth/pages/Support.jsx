
import React from 'react';
import logo from '../../../public/media/app/default-logo-dark.png'
import bgImage from '../../../public/media/images/1920x1080/bg-img.png';

const Support = () => {
    return (
        <main
            className="font-manrope flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-fixed p-4 w-full"
            style={{ backgroundImage: `url(${bgImage})` }}>
            {/* Main Card */}
            <div className="relative w-full max-w-[600px] overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 p-8 text-center shadow-2xl backdrop-blur-lg sm:p-12 md:p-16 lg:p-20 bg-gray-900">
                {/* Decorative Elements - hidden on mobile (sm) and up */}
                <div className="absolute top-[-50px] right-[-50px] hidden h-[100px] w-[100px] rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] opacity-10 sm:block"></div>
                <div className="absolute bottom-[-30px] left-[-30px] hidden h-[60px] w-[60px] rounded-full bg-gradient-to-br from-[#f093fb] to-[#f5576c] opacity-10 sm:block"></div>

                {/* Logo */}
                <div className="mb-6 sm:mb-8">
                    <img 
                        src={logo} 
                        alt="Iqonic Logo"
                        className="mx-auto h-auto max-h-[50px] w-auto max-w-[120px] object-contain brightness-110 sm:max-h-[60px] sm:max-w-[150px] md:max-h-[80px] md:max-w-[200px]"
                    />
                </div>

                {/* Welcome Message */}
                <h1 className="mb-2 bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-3xl font-bold text-transparent sm:mb-3 sm:text-4xl md:text-5xl">
                    Welcome to
                </h1>
                
                <h2 className="mb-6 text-2xl font-semibold tracking-tight text-slate-200 sm:mb-8 sm:text-3xl md:mb-10 md:text-4xl">
                    Iqonic Support
                </h2>

                <p className="mb-8 text-base leading-relaxed text-slate-300 sm:mb-10 sm:text-lg md:mb-12">
                    We're here to help you with all your questions and support needs. Click the button below to get in touch with our support team.
                </p>

                {/* Send Email Button */}
                <a 
                    href="mailto:Support@iqonic.space?subject=Support%20Request&body=Hello%20Iqonic%20Support%20Team%2C%0A%0AI%20need%20assistance%20with%3A%0A%0A%5BPlease%20describe%20your%20issue%20here%5D%0A%0AThank%20you%21"
                    className="inline-flex w-full max-w-72 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-600/50 bg-slate-700/90 px-8 py-4 text-base font-medium text-slate-200 no-underline backdrop-blur-lg transition-all duration-200 ease-in-out hover:border-slate-500/70 hover:bg-slate-600/90 active:scale-95"
                >
                    {/* SVG Icon embedded directly */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Send Email</span>
                </a>
            </div>
        </main>
    );
};

export default Support;