import React from 'react'
import PageLayout from '../../components/PageLayout/PageLayout'
import MetaHead from '../../components/MetaHead'
import ConsultationForm from '../../components/Web3Forms/ConsultationForm'
import { useCartItems } from '../../stores/cartStore'

import Hero from "@/components/Common/Hero";

export default function ConsultationGoogleFormPage() {
  const cart = useCartItems()
  const includeCart = cart.length > 0

  return (
    <PageLayout hideFooter>
      <MetaHead title="Consultation - Medtrion" description="Request a consultation" />
      <Hero
           
            title="Request a Free Consultation"
            description="Fill out the form below and our mobility experts will contact you to discuss your needs and provide personalized recommendations."
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Request a Free Consultation" },
            ]}
          />
        
      <div className="max-w-5xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
       

        <div className="bg-white rounded-lg shadow-lg p-6">
          <ConsultationForm includeCart={includeCart} />
        </div>
      </div>
    </PageLayout>
  )
}
