import { ProfessionalFooter } from '../Footer';
import { SiteLogo } from '../../lib/fetchSiteLogo';

interface ContactPhone {
  name: string;
  number: string;
}

interface FooterProps {
  logo?: SiteLogo | null;
  contactPhone?: ContactPhone[];
}

const Footer: React.FC<FooterProps> = ({ logo, contactPhone }) => {
  // Update footer content with CMS logo and contact phones if available
  const customContent = {
    companyInfo: {
      name: 'Medtrion',
      description: 'Medtrion is your trusted source for a wide range of health services and mobility products designed to improve your quality of life. Please note: We are not manufacturers of Acorn stairlifts but proud affiliate partners.',
      logo: logo ? {
        sourceUrl: logo.sourceUrl,
        altText: logo.altText,
      } : '/Logo.png',
      address: '3495 Rebecca St Oakville, ON L6L 6X9',
      phone: '+1 (905) 330-1774',
      contactPhone: contactPhone && contactPhone.length > 0 ? contactPhone : [
        { name: 'General Inquiries', number: '+1 (905) 330-1774' }
      ],
      email: 'Info@medtrion.ca',
      website: 'https://medtrion.ca'
    },
    navigation: [
      {
        title: 'Menu',
        links: [
          { label: 'Home', href: '/' },
          { label: 'Shop All', href: '/#shop' },
          { label: 'Reviews', href: '/#reviews' },
          { label: 'FAQs', href: '/#faq' },
          { label: 'Blogs', href: '/blogs' }
        ]
      }
    ],
    socialMedia: [
      {
        platform: 'facebook' as const,
        url: 'https://www.facebook.com/profile.php?id=61565518749182',
        icon: 'FaFacebook',
        label: 'Follow us on Facebook'
      },
      {
        platform: 'instagram' as const,
        url: 'https://www.instagram.com/healthsupplymobility_/?hl=en',
        icon: 'FaInstagram',
        label: 'Follow us on Instagram'
      }
    ],
    trustIndicators: [],
    paymentMethods: ['visa', 'mastercard', 'amex', 'discover'],
    legal: {
      copyright: '© Copyright 2025. All Rights Reserved.',
      privacyPolicy: '/privacy-policy',
      termsOfService: '/terms-of-service',
      cookiePolicy: '/cookie-policy'
    }
  };

  return <ProfessionalFooter customContent={customContent} />;
};

export default Footer;
