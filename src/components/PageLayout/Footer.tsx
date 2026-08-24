import { ProfessionalFooter } from '../Footer';
import { SiteLogo } from '../../lib/fetchSiteLogo';
import { removeAddressLabels } from '../../lib/utils/addressFormatter';

interface ContactPhone {
  name: string;
  number: string;
}

interface ContactInfo {
  contactAddress: string;
  contactEmail: string;
  contactPhone: ContactPhone[];
}

interface FooterProps {
  logo?: SiteLogo | null;
  contactInfo?: ContactInfo | null;
}

const Footer: React.FC<FooterProps> = ({ logo, contactInfo }) => {
  // Clean address by removing labels like "Street:", "City:", "Postal:"
  const cleanedAddress = contactInfo?.contactAddress 
    ? removeAddressLabels(contactInfo.contactAddress) 
    : '3495 Rebecca St Oakville, ON L6L 6X9';

  // Use dynamic contact info from CMS, with fallbacks
  const customContent = {
    companyInfo: {
      name: 'Medtrion',
      description: 'Medtrion is your trusted source for a wide range of health services and mobility products designed to improve your quality of life. Please note: We are not manufacturers of Acorn stairlifts but proud affiliate partners.',
      logo: '/med-logo.png',
      address: cleanedAddress,
      phone: contactInfo?.contactPhone?.[0]?.number || '1(888) 672-6206',
      contactPhone: contactInfo?.contactPhone && contactInfo.contactPhone.length > 0 
        ? contactInfo.contactPhone 
        : [{ name: '', number: '1(888) 672-6206' }],
      email: contactInfo?.contactEmail || 'Info@medtrion.ca',
      website: 'https://medtrion.ca'
    },
    navigation: [
      {
        title: 'Products',
        links: [
          { label: 'Acorn 180 Curved Stairlift', href: '/product/acorn-stairlifts-acorn-180-curved-stairlift' },
          { label: 'Acorn 130 Straight Stairlift', href: '/product/acorn-stairlifts-acorn-130-straight-stairlift' },
          { label: 'VivaLift Tranquil 2 Lift Chair', href: '/product/vivalift-tranquil-2-plr-935s-lift-chair' },
          { label: 'VivaLift Ultra Lift Chair', href: '/product/vivalift-ultra-plr4955s-lift-chair' },
          { label: 'VivaLift Classic Lift Chair', href: '/product/vivalift-classic-plr-835s-lift-chair' }
        ]
      },
      {
        title: 'Services',
        links: [
          { label: 'Installation', href: '/services/installation' },
          { label: 'Maintenance', href: '/services/maintenance' },
          { label: 'Home Assessments', href: '/services/home-assessments' },
          { label: 'Design Consultation', href: '/services/design-consultation' }
        ]
      },
      {
        title: 'Help',
        links: [
          { label: 'Privacy Policy', href: '/privacy-policy' },
          { label: 'FAQ', href: '/#faq' },
          { label: 'Blog', href: '/blogs' },
          { label: 'Contact Us', href: '/contact' }
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
      copyright: '© Copyright 2026. All Rights Reserved.',
      privacyPolicy: '/privacy-policy',
      termsOfService: '/terms-of-service',
      cookiePolicy: '/cookie-policy',
      returnPolicy: '/return-policy'
    }
  };

  return <ProfessionalFooter customContent={customContent} />;
};

export default Footer;
