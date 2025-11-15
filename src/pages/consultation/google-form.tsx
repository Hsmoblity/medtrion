import React from 'react'
import PageLayout from '../../components/PageLayout/PageLayout'
import MetaHead from '../../components/MetaHead'
import GoogleFormEmbed from '../../components/GoogleFormEmbed/GoogleFormEmbed'

export default function ConsultationGoogleFormPage() {
  return (
    <PageLayout>
      <MetaHead title="Consultation - HS Mobility" description="Request a consultation" />
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Request a Free Consultation</h1>
          <p className="text-lg text-gray-600">
            Fill out the form below to request a free consultation. Our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <GoogleFormEmbed
            apiPath="/wp-json/hsm/v1/consult-form-url"
            height="80vh"
            showFallbackLink={true}
            responsive={true}
          />
        </div>
      </div>
    </PageLayout>
  )
}
