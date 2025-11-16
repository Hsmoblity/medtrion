/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ConsultationForm Component - Web3Forms Implementation
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Replaces Google Form modal with Web3Forms consultation form
 * 
 * USAGE:
 * ```tsx
 * <ConsultationForm 
 *   onSuccess={() => router.push('/consultation/success')}
 *   includeCart={true}
 * />
 * ```
 */

import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartItems, useCartStore } from '../../stores/cartStore'
import { useRouter } from 'next/router'

// Form validation schema
const ConsultationFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  preferredContact: z.enum(['email', 'phone', 'either']),
  preferredTime: z.enum(['morning', 'afternoon', 'evening', 'weekend']),
  urgency: z.enum(['immediate', 'within_week', 'within_month', 'flexible']),
  additionalNotes: z.string().optional(),
})

type ConsultationFormData = z.infer<typeof ConsultationFormSchema>

interface ConsultationFormProps {
  onSuccess?: () => void
  includeCart?: boolean
  className?: string
}

export default function ConsultationForm({ 
  onSuccess, 
  includeCart = false,
  className = '' 
}: ConsultationFormProps) {
  const router = useRouter()
  const cart = useCartItems()
  const { clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(ConsultationFormSchema)
  })

  // Calculate order totals if cart is included
  const calculateOrderTotal = () => {
    if (!includeCart || cart.length === 0) {
      return { subtotal: 0, tax: 0, total: 0 }
    }

    const subtotal = cart.reduce((sum, item) => {
      const basePrice = typeof item.price === 'number' ? item.price : Number(item.price || 0) || 0
      let optionsTotal = 0
      
      if (item.options && Array.isArray(item.options)) {
        optionsTotal = item.options.reduce((optSum, option) => {
          const optPrice = Number(option.priceModifier || 0) || 0
          const optQuantity = Number(option.quantity || 1) || 1
          return optSum + (optPrice * optQuantity)
        }, 0)
      }
      
      const unitTotal = basePrice + optionsTotal
      const quantity = Number(item.quantity) || 1
      return sum + (unitTotal * quantity)
    }, 0)

    const tax = subtotal * 0.13 // 13% HST
    return {
      subtotal,
      tax,
      total: subtotal + tax
    }
  }

  const onSubmit: SubmitHandler<ConsultationFormData> = async (data) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage(null)

    try {
      const orderTotals = calculateOrderTotal()

      // Prepare consultation request data
      const consultationData = {
        customer: data,
        products: includeCart && cart.length > 0 ? cart.map(item => ({
          product: {
            id: item.productId,
            title: item.title,
            slug: item.slug,
            price: item.price,
            quantity: item.quantity
          },
          options: item.options || [],
        })) : [],
        orderTotals,
        timestamp: new Date().toISOString(),
        type: 'consultation_request'
      }

      // Submit to Web3Forms
      const web3formsUrl = process.env.NEXT_PUBLIC_WEB3FORMS_URL
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY

      if (!web3formsUrl || !accessKey) {
        throw new Error("Web3Forms configuration missing. Please contact support.")
      }

      const response = await fetch(web3formsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Professional Consultation Request - ${data.firstName} ${data.lastName}`,
          from_name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          address: `${data.address}, ${data.city}, ${data.province} ${data.postalCode}`,
          preferred_contact: data.preferredContact,
          preferred_time: data.preferredTime,
          urgency: data.urgency,
          additional_notes: data.additionalNotes || 'None',
          products: includeCart && cart.length > 0 
            ? JSON.stringify(consultationData.products, null, 2)
            : 'No products in cart',
          order_subtotal: includeCart ? `$${orderTotals.subtotal.toFixed(2)}` : 'N/A',
          order_tax: includeCart ? `$${orderTotals.tax.toFixed(2)}` : 'N/A',
          order_total: includeCart ? `$${orderTotals.total.toFixed(2)}` : 'N/A',
          consultation_data: JSON.stringify(consultationData, null, 2)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Consultation request submission failed")
      }

      const result = await response.json()
      console.log('✅ Consultation request submitted successfully:', result)
      setSubmitStatus('success')

      // Clear cart if included
      if (includeCart && cart.length > 0) {
        clearCart()
      }

      // Reset form
      reset()

      // Call success callback or redirect
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setTimeout(() => {
          router.push('/consultation/success')
        }, 2000)
      }

    } catch (error) {
      console.error('❌ Error submitting consultation request:', error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit consultation request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Address Fields */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            {...register('address')}
            type="text"
            id="address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              {...register('city')}
              type="text"
              id="city"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
              Province *
            </label>
            <input
              {...register('province')}
              type="text"
              id="province"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.province && (
              <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code *
            </label>
            <input
              {...register('postalCode')}
              type="text"
              id="postalCode"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="preferredContact" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Contact *
            </label>
            <select
              {...register('preferredContact')}
              id="preferredContact"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="either">Either</option>
            </select>
            {errors.preferredContact && (
              <p className="mt-1 text-sm text-red-600">{errors.preferredContact.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Time *
            </label>
            <select
              {...register('preferredTime')}
              id="preferredTime"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="weekend">Weekend</option>
            </select>
            {errors.preferredTime && (
              <p className="mt-1 text-sm text-red-600">{errors.preferredTime.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
              Urgency *
            </label>
            <select
              {...register('urgency')}
              id="urgency"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="immediate">Immediate</option>
              <option value="within_week">Within a Week</option>
              <option value="within_month">Within a Month</option>
              <option value="flexible">Flexible</option>
            </select>
            {errors.urgency && (
              <p className="mt-1 text-sm text-red-600">{errors.urgency.message}</p>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            {...register('additionalNotes')}
            id="additionalNotes"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell us more about your needs..."
          />
        </div>

        {/* Error Message */}
        {submitStatus === 'error' && errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm font-semibold">
              ✅ Consultation request submitted successfully! We'll contact you soon.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Consultation Request'}
        </button>
      </form>
    </div>
  )
}

// Agent Signature: 160125 - Fullstack - Web3Forms_Consultation_Form_Replacement

