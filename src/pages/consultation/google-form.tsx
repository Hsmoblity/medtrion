import React from 'react'
import PageLayout from '../../components/PageLayout/PageLayout'
import MetaHead from '../../components/MetaHead'
import ConsultationForm from '../../components/Web3Forms/ConsultationForm'
import { useCartItems } from '../../stores/cartStore'

export default function ConsultationGoogleFormPage() {
  const cart = useCartItems()
  const includeCart = cart.length > 0

  return (
    <PageLayout>
      <MetaHead title="Consultation - HS Mobility" description="Request a consultation" />
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Request a Free Consultation</h1>
          <p className="text-lg text-gray-600">
            Fill out the form below and our mobility experts will contact you to discuss your needs and provide personalized recommendations.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <ConsultationForm includeCart={includeCart} />
        </div>
      </div>
    </PageLayout>
  )
}
