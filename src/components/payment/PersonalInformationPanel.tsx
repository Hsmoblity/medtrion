import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Validation Schema
const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter your full address'),
  city: z.string().min(2, 'Please enter your city'),
  state: z.string().min(1, 'Please select your province'),
  zipCode: z.string().regex(/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/, 'Please enter a valid postal code (e.g., K1A 0A6)'),
  country: z.string().default('CA')
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface PersonalInformationPanelProps {
  initialData?: Partial<PersonalInfoFormData>;
  onDataChange?: (data: PersonalInfoFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const PersonalInformationPanel: React.FC<PersonalInformationPanelProps> = ({
  initialData,
  onDataChange,
  onValidationChange
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    getValues
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      country: 'CA',
      state: 'ON',
      ...initialData
    },
    mode: 'onChange'
  });

  // Watch for changes and notify parent
  useEffect(() => {
    const subscription = watch((value) => {
      if (onDataChange && isValid) {
        onDataChange(value as PersonalInfoFormData);
      }
      if (onValidationChange) {
        onValidationChange(isValid);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, isValid, onDataChange, onValidationChange]);

  const provinces = [
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'YT', label: 'Yukon' }
  ];

  return (
    <div className="personal-information-panel bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      {/* Panel Header */}
      <div className="panel-header mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Personal Information
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Please provide your contact and shipping information
        </p>
      </div>

      {/* Form Fields */}
      <form className="space-y-6">
        {/* Name Fields - Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label 
              htmlFor="firstName" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              {...register('firstName')}
              className={`
                w-full px-4 py-3 rounded-lg border
                ${errors.firstName 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
                focus:ring-2 focus:border-transparent
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                transition-all duration-200
              `}
              placeholder="John"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="mt-1 text-sm text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label 
              htmlFor="lastName" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              {...register('lastName')}
              className={`
                w-full px-4 py-3 rounded-lg border
                ${errors.lastName 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
                focus:ring-2 focus:border-transparent
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                transition-all duration-200
              `}
              placeholder="Doe"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && (
              <p id="lastName-error" className="mt-1 text-sm text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.email 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
              }
              focus:ring-2 focus:border-transparent
              dark:bg-gray-700 dark:border-gray-600 dark:text-white
              transition-all duration-200
            `}
            placeholder="john.doe@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label 
            htmlFor="phone" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.phone 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
              }
              focus:ring-2 focus:border-transparent
              dark:bg-gray-700 dark:border-gray-600 dark:text-white
              transition-all duration-200
            `}
            placeholder="(555) 123-4567"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-500">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Address */}
        <div className="form-group">
          <label 
            htmlFor="address" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            id="address"
            type="text"
            {...register('address')}
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.address 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
              }
              focus:ring-2 focus:border-transparent
              dark:bg-gray-700 dark:border-gray-600 dark:text-white
              transition-all duration-200
            `}
            placeholder="123 Main Street, Apt 4B"
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? 'address-error' : undefined}
          />
          {errors.address && (
            <p id="address-error" className="mt-1 text-sm text-red-500">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* City, State, ZIP - Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label 
              htmlFor="city" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              type="text"
              {...register('city')}
              className={`
                w-full px-4 py-3 rounded-lg border
                ${errors.city 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
                focus:ring-2 focus:border-transparent
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                transition-all duration-200
              `}
              placeholder="New York"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>

          <div className="form-group">
            <label 
              htmlFor="state" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Province <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              {...register('state')}
              className={`
                w-full px-4 py-3 rounded-lg border
                ${errors.state 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
                focus:ring-2 focus:border-transparent
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                transition-all duration-200
              `}
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province.value} value={province.value}>
                  {province.label}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
            )}
          </div>

          <div className="form-group">
            <label 
              htmlFor="zipCode" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              id="zipCode"
              type="text"
              {...register('zipCode')}
              className={`
                w-full px-4 py-3 rounded-lg border
                ${errors.zipCode 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }
                focus:ring-2 focus:border-transparent
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                transition-all duration-200
              `}
              placeholder="K1A 0A6"
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-500">{errors.zipCode.message}</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalInformationPanel;