# Web3Forms Integration Guide

## Overview

The application uses **Web3Forms** (https://web3forms.com) for handling contact form submissions. Web3Forms is a free, serverless form backend that sends form submissions directly to your email without requiring a backend server.

## Features

- ✅ **No Backend Required** - Serverless form submission
- ✅ **Free Plan Available** - 250 submissions/month
- ✅ **Email Notifications** - Form submissions sent directly to your email
- ✅ **Spam Protection** - Built-in honeypot and reCAPTCHA support
- ✅ **No Storage** - No data stored on their servers
- ✅ **Customizable** - Full control over form fields and validation

## Forms Using Web3Forms

### 1. Contact Form (`/contact`)
**Component:** `src/components/Web3Forms/ContactForm.tsx`
**Used In:** `src/pages/contact.tsx`

**Fields:**
- First Name
- Last Name
- Email
- Phone
- Subject
- Message

### 2. Consultation Form (`/consultation`)
**Component:** `src/components/Web3Forms/ConsultationForm.tsx`
**Used In:** 
- `src/pages/consultation.tsx`
- `src/pages/consultation/google-form.tsx`

**Fields:**
- First Name
- Last Name
- Email
- Phone
- Address
- Product Interest
- Preferred Contact Method
- Mobility Challenges
- Additional Notes

### 3. Consultation Modal
**Component:** `src/components/Web3Forms/ConsultationFormModal.tsx`
**Used In:** Product pages for quick consultation requests

## Setup Instructions

### Step 1: Get Your Web3Forms Access Key

1. Visit https://web3forms.com
2. Sign up for a free account
3. Create a new form
4. Copy your **Access Key** (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Step 2: Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Web3Forms Configuration
NEXT_PUBLIC_WEB3FORMS_URL=https://api.web3forms.com/submit
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your_access_key_here
```

**Important:** Replace `your_access_key_here` with your actual Web3Forms access key.

### Step 3: Configure Email Recipients

In your Web3Forms dashboard:

1. Go to **Form Settings**
2. Add **Email Recipients** (where form submissions will be sent)
3. Configure **Email Notifications** (optional)
4. Set up **Spam Protection** (recommended)

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_WEB3FORMS_URL` | Yes | Web3Forms API endpoint | `https://api.web3forms.com/submit` |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Yes | Your unique access key | `3c01bf6a-1e01-47f6-8337-e2155b97fa50` |

## How It Works

1. **User fills form** → Form data is validated client-side using Zod schemas
2. **Form submits** → Data is sent to Web3Forms API with your access key
3. **Web3Forms processes** → Validates and forwards to your configured email
4. **User sees confirmation** → Success message displayed on the page

## Code Example

```tsx
import ContactForm from '@/components/Web3Forms/ContactForm'

export default function ContactPage() {
  return (
    <div>
      <h1>Contact Us</h1>
      <ContactForm onSuccess={() => console.log('Form submitted!')} />
    </div>
  )
}
```

## Validation

All forms use **Zod** for schema validation:

- First/Last Name: Required, minimum 1 character
- Email: Required, must be valid email format
- Phone: Required, minimum 1 character
- Subject: Required, minimum 1 character
- Message: Required, minimum 10 characters

## Error Handling

The form handles errors gracefully:

```typescript
// Missing configuration
if (!web3formsUrl || !accessKey) {
  throw new Error("Web3Forms configuration missing. Please contact support.")
}

// API errors
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || "Submission failed")
}
```

## Testing

### Test Form Submission

1. Start dev server: `npm run dev`
2. Navigate to `/contact` or `/consultation`
3. Fill out the form with valid data
4. Submit and check:
   - Success message appears
   - Email received at configured address
   - Browser console shows success log

### Common Issues

**Issue:** "Web3Forms configuration missing"
**Solution:** Ensure both `NEXT_PUBLIC_WEB3FORMS_URL` and `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` are set in `.env.local`

**Issue:** Form submits but no email received
**Solution:** Check Web3Forms dashboard to ensure email recipients are configured correctly

**Issue:** 403 Forbidden error
**Solution:** Verify your access key is valid and not expired

## Pricing Plans

### Free Plan (Current)
- ✅ 250 submissions/month
- ✅ Email notifications
- ✅ Spam protection
- ✅ API access

### Pro Plan ($9/month)
- ✅ 5,000 submissions/month
- ✅ File uploads
- ✅ Custom email templates
- ✅ Webhooks
- ✅ Priority support

## Security

- ✅ **Access Key Required** - Prevents unauthorized submissions
- ✅ **Honeypot Protection** - Built-in spam detection
- ✅ **reCAPTCHA Support** - Optional advanced spam protection
- ✅ **HTTPS Only** - All API requests use secure connection
- ✅ **No Data Storage** - Web3Forms doesn't store form submissions

## Migration Notes

**Previous Implementation:** Google Forms embed
**Current Implementation:** Web3Forms native React components

**Benefits of Migration:**
- Better UX with custom styling
- Client-side validation
- Better mobile experience
- No iframe dependencies
- Better performance
- Full control over form behavior

## Support

- **Web3Forms Docs:** https://docs.web3forms.com
- **Web3Forms Support:** support@web3forms.com
- **Dashboard:** https://web3forms.com/dashboard

## Related Files

```
src/
├── components/
│   └── Web3Forms/
│       ├── ContactForm.tsx          # Contact form component
│       ├── ConsultationForm.tsx     # Consultation form component
│       ├── ConsultationFormModal.tsx # Modal version
│       └── index.ts                 # Central exports
├── pages/
│   ├── contact.tsx                  # Contact page
│   ├── consultation.tsx             # Consultation page
│   └── consultation/
│       └── google-form.tsx          # Alternative consultation page
└── lib/
    └── api/
        └── hooks/
            └── useForms.ts          # Deprecated form hooks (kept for compatibility)
```

## Maintenance

### Checking Usage

Monitor your Web3Forms dashboard for:
- Monthly submission count
- Spam detection rate
- Failed submissions
- Email delivery status

### Updating Access Key

If you need to rotate your access key:

1. Generate new key in Web3Forms dashboard
2. Update `.env.local` with new key
3. Restart dev server
4. Test form submission
5. Update production environment variables

---

**Last Updated:** June 12, 2026
**Maintained By:** Development Team
