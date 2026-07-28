import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  MdCheckCircle as CheckCircleIcon,
  MdPhone as PhoneIcon, 
  MdEmail as EnvelopeIcon, 
  MdHome as HomeIcon
} from 'react-icons/md';
import PageLayout from '../../components/PageLayout/PageLayout';
import MetaHead from '../../components/MetaHead';
import { PrimaryButton } from '../../components/ui';

const ConsultationSuccessPage: React.FC = () => {
  return (
    <PageLayout hideFooter>
      <MetaHead
        title="Consultation Request Submitted - HSM Mobility"
        description="Your consultation request has been successfully submitted. We'll contact you soon."
      />

      <div className="min-h-screen bg-gray-50 py-20 mt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Consultation Request Submitted!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your interest in our mobility solutions. 
                Our team of experts will review your request and contact you soon to discuss your specific needs.
              </p>
            </motion.div>

            {/* What's Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-orange-50 rounded-lg p-6 mb-8"
            >
              <h2 className="text-xl font-semibold text-brand-dark mb-4">What Happens Next?</h2>
              <div className="text-left space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-brand-dark">
                      <span className="font-medium">Review & Assessment</span> - 
                      Our mobility specialists will review your configuration and requirements.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-brand-dark">
                      <span className="font-medium">Personal Contact</span> - 
                      We'll reach out via your preferred contact method within 24 hours.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-brand-dark">
                      <span className="font-medium">Personalized Consultation</span> - 
                      Discuss options, pricing, installation, and answer all your questions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <div>
                    <p className="text-brand-dark">
                      <span className="font-medium">Next Steps</span> - 
                      Schedule installation, arrange financing, or modify your configuration as needed.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Need to reach us immediately?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <PhoneIcon className="h-5 w-5 text-brand-primary mr-2" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Call Us</p>
                    <p className="text-gray-600">(905) 844-7171</p>
                  </div>
                </div>
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-brand-primary mr-2" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Email Us</p>
                    <p className="text-gray-600">info@medtrion.ca</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/">
                <PrimaryButton className="flex items-center justify-center">
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Return to Home
                </PrimaryButton>
              </Link>
              <Link href="/products">
                <button className="px-6 py-3 border-2 border-[#3fa2a3] bg-[#3fa2a3] text-white rounded-[35px] font-primary font-semibold hover:bg-[#f7a236] hover:border-[#f7a236] transition-all duration-300">
                  Browse More Products
                </button>
              </Link>
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 p-4 bg-gray-50 rounded-lg"
            >
              <p className="text-sm text-gray-600">
                Your consultation request reference number has been sent to your email. 
                Please keep this for your records. If you don't receive an email within a few minutes, 
                please check your spam folder or contact us directly.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ConsultationSuccessPage;