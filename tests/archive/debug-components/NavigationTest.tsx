import React from 'react';
import { useRouter } from 'next/router';
import { handleAnchorNavigation } from 'lib/utils/navigation';

/**
 * Navigation test component to verify cross-page anchor navigation
 * This component can be temporarily added to any page to test the navigation fix
 */
const NavigationTest: React.FC = () => {
  const router = useRouter();

  const testNavigations = [
    { label: 'Shop Section (/#shop)', href: '/#shop' },
    { label: 'Contact Us (/#contact-us)', href: '/#contact-us' },
    { label: 'Reviews (/#reviews)', href: '/#reviews' },
    { label: 'FAQ (/#faq)', href: '/#faq' },
    { label: 'Home Page (/)', href: '/' },
    { label: 'Cart Page (/cart)', href: '/cart' },
  ];

  return (
    <div style={{ 
      border: '2px solid #dc3545', 
      borderRadius: '8px', 
      padding: '20px', 
      margin: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>🧭 Navigation Test Component</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Current Route:</strong> {router.asPath}
      </div>
      
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Test navigation from any page to homepage sections. Each button should navigate to the target page and scroll to the appropriate section.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {testNavigations.map((nav, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              console.log(`🧭 NavigationTest: Navigating to ${nav.href}`);
              handleAnchorNavigation(nav.href, router);
            }}
            style={{
              padding: '12px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
            {nav.label}
          </button>
        ))}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
        <strong>Expected Behavior:</strong>
        <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
          <li>Clicking any anchor link should navigate to homepage and scroll to section</li>
          <li>Regular page links should navigate normally</li>
          <li>Should work from any current page (cart, payment, blogs, etc.)</li>
        </ul>
      </div>
    </div>
  );
};

export default NavigationTest;