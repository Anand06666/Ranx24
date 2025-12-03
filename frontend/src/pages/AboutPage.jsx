import React from 'react';
import { LucideInfo } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-center justify-center mb-8">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <LucideInfo size={40} className="text-blue-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">About RanX24</h1>

                <div className="prose prose-blue mx-auto text-gray-600 space-y-6">
                    <p>
                        Welcome to RanX24, your trusted partner for all home service needs. We are dedicated to connecting you with skilled and verified professionals to ensure your home maintenance tasks are handled with care and expertise.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800">Our Mission</h2>
                    <p>
                        To simplify home services by providing a reliable, transparent, and efficient platform that empowers both customers and service professionals.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800">Why Choose Us?</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Verified Professionals:</strong> Every worker on our platform undergoes a strict background check.</li>
                        <li><strong>Transparent Pricing:</strong> No hidden costs. You pay what you see.</li>
                        <li><strong>Quality Assurance:</strong> We monitor service quality to ensure high customer satisfaction.</li>
                        <li><strong>Seamless Booking:</strong> Book a service in just a few clicks.</li>
                    </ul>

                    <p>
                        Whether it's plumbing, electrical work, cleaning, or painting, RanX24 is here to make your life easier.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
