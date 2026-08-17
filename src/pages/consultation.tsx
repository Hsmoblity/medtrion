import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { 
  MdPhone as PhoneIcon, 
  MdEmail as EnvelopeIcon, 
  MdAccessTime as ClockIcon,
  MdCheckCircle as CheckCircleIcon,
  MdWarning as ExclamationTriangleIcon,
  MdPerson as PersonIcon,
  MdShoppingCart as ShoppingCartIcon,
  MdAssignment as AssignmentIcon
} from 'react-icons/md';
import PageLayout from '../components/PageLayout/PageLayout';
import MetaHead from '../components/MetaHead';
import { PrimaryButton } from '../components/ui';
import { useCartStore, useCartItems } from '../stores/cartStore';

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
  consent: z.boolean().refine(val => val === true, 'You must consent to contact')
});

type ConsultationFormData = z.infer<typeof ConsultationFormSchema>;

interface ProductGroup {
  mainProduct: any;
  options: any[];
  total: number;
}

const ConsultationPage: React.FC = () => {
  const router = useRouter();
  const cart = useCartItems();
  const { clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(ConsultationFormSchema)
  });

  // Process cart items into grouped products for display
  useEffect(() => {
    if (cart.length === 0) {
      // If cart is empty, redirect to home
      router.push('/');
      return;
    }

    // Group and calculate totals for cart items
    const groups = cart.map(item => {
      const basePrice = typeof item.price === 'number' ? item.price : Number(item.price || 0) || 0;
      let optionsTotal = 0;
      
      if (item.options && Array.isArray(item.options)) {
        optionsTotal = item.options.reduce((sum, option) => {
          const optPrice = Number(option.priceModifier || 0) || 0;
          const optQuantity = Number(option.quantity || 1) || 1;
          return sum + (optPrice * optQuantity);
        }, 0);
      }
      
      const unitTotal = basePrice + optionsTotal;
      const quantity = Number(item.quantity) || 1;
      const total = unitTotal * quantity;

      return {
        mainProduct: item,
        options: item.options || [],
        total
      };
    });

    setProductGroups(groups);
  }, [cart, router]);

  const calculateOrderTotal = () => {
    const subtotal = productGroups.reduce((sum, group) => sum + group.total, 0);
    const tax = subtotal * 0.13; // 13% HST
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  };

  const onSubmit: SubmitHandler<ConsultationFormData> = async (data) => {
    setIsSubmitting(true);
    
    try {
      const orderTotals = calculateOrderTotal();
      
      // Prepare consultation request data
      const consultationData = {
        customer: data,
        products: productGroups.map(group => ({
          product: {
            id: group.mainProduct.productId,
            title: group.mainProduct.title,
            slug: group.mainProduct.slug,
            price: group.mainProduct.price,
            quantity: group.mainProduct.quantity
          },
          options: group.options,
          total: group.total
        })),
        orderTotals,
        timestamp: new Date().toISOString(),
        type: 'consultation_request'
      };

      console.log('📋 Consultation Request Data:', consultationData);

      // Submit to Web3Forms
      const web3formsUrl = process.env.NEXT_PUBLIC_WEB3FORMS_URL;
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

      if (!web3formsUrl || !accessKey) {
        throw new Error("Web3Forms configuration missing");
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
          reply_to: data.email,  // Set reply-to address to customer's email
          to: 'info@medtrion.ca',  // Send to company email
          phone: data.phone,
          address: `${data.address}, ${data.city}, ${data.province} ${data.postalCode}`,
          preferred_contact: data.preferredContact,
          preferred_time: data.preferredTime,
          urgency: data.urgency,
          additional_notes: data.additionalNotes || 'None',
          // Include product information in the email
          products: JSON.stringify(consultationData.products, null, 2),
          order_subtotal: `$${orderTotals.subtotal.toFixed(2)}`,
          order_tax: `$${orderTotals.tax.toFixed(2)}`,
          order_total: `$${orderTotals.total.toFixed(2)}`,
          consultation_data: JSON.stringify(consultationData, null, 2)
        }),
      });

      if (!response.ok) {
        throw new Error("Consultation request submission failed");
      }

      const result = await response.json();
      console.log('✅ Consultation request submitted successfully:', result);
      setSubmitStatus('success');
      
      // Clear the cart after successful submission
      setTimeout(() => {
        clearCart();
        router.push('/consultation/success');
      }, 2000);

    } catch (error) {
      console.error('❌ Error submitting consultation request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { subtotal, tax, total } = calculateOrderTotal();

  return (
    <PageLayout>
      <MetaHead
        title="Professional Consultation - HSM Mobility"
        description="Schedule a professional consultation for your mobility equipment needs."
      />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Professional Consultation
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Let our mobility experts help you find the perfect solution. 
              Schedule a personalized consultation to discuss your specific needs and get professional recommendations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center mb-6">
                <ShoppingCartIcon className="h-6 w-6 text-brand-primary mr-2" />
                <h2 className="text-2xl font-semibold text-gray-900">Your Configuration</h2>
              </div>

              <div className="space-y-4">
                {productGroups.map((group, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{group.mainProduct.title}</h3>
                        <p className="text-sm text-gray-600">Quantity: {group.mainProduct.quantity}</p>
                        
                        {group.options.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Configuration:</p>
                            <ul className="text-sm text-gray-600 ml-2">
                              {group.options.map((option, optIndex) => (
                                <li key={optIndex}>
                                  {option.name}: {option.value}
                                  {option.priceModifier && option.priceModifier !== 0 && (
                                    <span className="ml-1 text-green-600">
                                      (+${Math.abs(option.priceModifier).toFixed(2)})
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${group.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Order Totals */}
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (HST):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Consultation Benefits */}
              <div className="mt-8 p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-brand-dark mb-2">What to Expect:</h3>
                <ul className="text-sm text-brand-dark space-y-1">
                  <li>• Personalized product recommendations</li>
                  <li>• Professional installation guidance</li>
                  <li>• Warranty and maintenance information</li>
                  <li>• Financing options discussion</li>
                  <li>• Home assessment if needed</li>
                </ul>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center mb-6">
                <PersonIcon className="h-6 w-6 text-brand-primary mr-2" />
                <h2 className="text-2xl font-semibold text-gray-900">Contact Information</h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      {...register('firstName')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      {...register('lastName')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Address Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    {...register('address')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.city && (
                      <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province *
                    </label>
                    <select
                      {...register('province')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="ON">Ontario</option>
                      <option value="QC">Quebec</option>
                      <option value="BC">British Columbia</option>
                      <option value="AB">Alberta</option>
                      <option value="MB">Manitoba</option>
                      <option value="SK">Saskatchewan</option>
                      <option value="NS">Nova Scotia</option>
                      <option value="NB">New Brunswick</option>
                      <option value="NL">Newfoundland and Labrador</option>
                      <option value="PE">Prince Edward Island</option>
                      <option value="NT">Northwest Territories</option>
                      <option value="NU">Nunavut</option>
                      <option value="YT">Yukon</option>
                    </select>
                    {errors.province && (
                      <p className="text-red-600 text-sm mt-1">{errors.province.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      {...register('postalCode')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.postalCode && (
                      <p className="text-red-600 text-sm mt-1">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>

                {/* Contact Preferences */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Contact Method *
                    </label>
                    <select
                      {...register('preferredContact')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="either">Either</option>
                    </select>
                    {errors.preferredContact && (
                      <p className="text-red-600 text-sm mt-1">{errors.preferredContact.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time *
                    </label>
                    <select
                      {...register('preferredTime')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="morning">Morning (9 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                      <option value="evening">Evening (5 PM - 8 PM)</option>
                      <option value="weekend">Weekend</option>
                    </select>
                    {errors.preferredTime && (
                      <p className="text-red-600 text-sm mt-1">{errors.preferredTime.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency *
                  </label>
                  <select
                    {...register('urgency')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate (within 24 hours)</option>
                    <option value="within_week">Within a week</option>
                    <option value="within_month">Within a month</option>
                    <option value="flexible">Flexible timing</option>
                  </select>
                  {errors.urgency && (
                    <p className="text-red-600 text-sm mt-1">{errors.urgency.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    {...register('additionalNotes')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any specific requirements, questions, or additional information..."
                  />
                  {errors.additionalNotes && (
                    <p className="text-red-600 text-sm mt-1">{errors.additionalNotes.message}</p>
                  )}
                </div>

                {/* Consent */}
                <div className="flex items-start space-x-2">
                  <input
                    {...register('consent')}
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-brand-primary focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    I consent to be contacted by HSM Mobility regarding my consultation request. 
                    I understand that this information will be used to provide personalized service and recommendations. *
                  </label>
                </div>
                {errors.consent && (
                  <p className="text-red-600 text-sm mt-1">{errors.consent.message}</p>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <PrimaryButton
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Request...
                      </div>
                    ) : (
                      'Request Professional Consultation'
                    )}
                  </PrimaryButton>
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-green-800">
                      Consultation request submitted successfully! We'll contact you soon.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-red-800">
                      There was an error submitting your request. Please try again.
                    </p>
                  </div>
                )}
              </form>
            </motion.div>
          </div>

          {/* Contact Information Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Or Contact Us Directly</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <PhoneIcon className="h-6 w-6 text-brand-primary mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <p className="text-gray-600">(905) 844-7171</p>
                </div>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-6 w-6 text-brand-primary mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">info@medtrion.ca</p>
                </div>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-brand-primary mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Business Hours</p>
                  <p className="text-gray-600">Mon-Fri: 9 AM - 5 PM</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ConsultationPage;