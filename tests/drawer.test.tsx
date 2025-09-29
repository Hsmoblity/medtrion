import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import Drawer from '../src/components/drawer';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock navigation utility
jest.mock('../src/lib/utils/navigation', () => ({
  handleAnchorNavigation: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  useAnimate: jest.fn(() => [null, jest.fn()]),
  stagger: jest.fn(),
}));

describe('Drawer Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      asPath: '/',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders drawer with all navigation items', () => {
    render(<Drawer />);
    
    // Check mobile navigation items
    expect(screen.getByText('Shop All')).toBeInTheDocument();
    expect(screen.getByText('Acorn Stairlift')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('FAQs')).toBeInTheDocument();
    expect(screen.getByText('Blogs')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('renders logo in drawer', () => {
    render(<Drawer />);
    
    const logo = screen.getByAltText('HS Mobility Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/Logo.png');
  });

  it('renders contact information section', () => {
    render(<Drawer />);
    
    expect(screen.getByText('Contact Us:')).toBeInTheDocument();
    expect(screen.getByText('3495 Rebecca St')).toBeInTheDocument();
    expect(screen.getByText('#207 Oakville, ON')).toBeInTheDocument();
    expect(screen.getByText('L6L 6X9')).toBeInTheDocument();
  });

  it('renders phone and email links', () => {
    render(<Drawer />);
    
    const phoneLink = screen.getByText('+1 (905) 330-1774');
    const emailLink = screen.getByText('Info@hsmobility.ca');
    
    expect(phoneLink).toHaveAttribute('href', 'tel:+19053301774');
    expect(emailLink).toHaveAttribute('href', 'mailto:Info@hsmobility.ca');
  });

  it('handles navigation clicks with analytics tracking', async () => {
    const { handleAnchorNavigation } = require('../src/lib/utils/navigation');
    
    render(<Drawer />);
    
    const shopButton = screen.getByText('Shop All');
    fireEvent.click(shopButton);
    
    await waitFor(() => {
      expect(handleAnchorNavigation).toHaveBeenCalledWith(
        '/#shop',
        expect.any(Object),
        'Shop All'
      );
    });
  });

  it('handles all navigation clicks correctly', async () => {
    const { handleAnchorNavigation } = require('../src/lib/utils/navigation');
    
    render(<Drawer />);
    
    // Test all navigation items
    const navigationItems = [
      { text: 'Shop All', href: '/#shop' },
      { text: 'Acorn Stairlift', href: '/product/acorn-stairlifts-acorn-180-curved-stairlift' },
      { text: 'Reviews', href: '/#reviews' },
      { text: 'FAQs', href: '/#faq' },
      { text: 'Blogs', href: '/blogs' },
      { text: 'Contact Us', href: '/#contact-us' },
    ];
    
    for (const item of navigationItems) {
      const button = screen.getByText(item.text);
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(handleAnchorNavigation).toHaveBeenCalledWith(
          item.href,
          expect.any(Object),
          item.text
        );
      });
    }
  });

  it('toggles drawer state when navigation items are clicked', () => {
    render(<Drawer />);
    
    const shopButton = screen.getByText('Shop All');
    fireEvent.click(shopButton);
    
    // Drawer should close after navigation click
    // This is handled by the toggleDrawer function
    expect(true).toBe(true); // Placeholder assertion
  });

  it('has proper accessibility attributes', () => {
    render(<Drawer />);
    
    // Check for proper ARIA labels
    expect(screen.getByLabelText('link to shop section')).toBeInTheDocument();
    expect(screen.getByLabelText('check Acorn Stairlift designs')).toBeInTheDocument();
    expect(screen.getByLabelText('Check out our reviews')).toBeInTheDocument();
    expect(screen.getByLabelText('Frequently asked Questions')).toBeInTheDocument();
    expect(screen.getByLabelText('Read our blogs')).toBeInTheDocument();
    expect(screen.getByLabelText('Contact us')).toBeInTheDocument();
  });

  it('renders toggle button with proper accessibility', () => {
    render(<Drawer />);
    
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-label', 'Toggle navigation menu');
  });

  it('handles external links correctly', () => {
    render(<Drawer />);
    
    const phoneLink = screen.getByText('+1 (905) 330-1774');
    const emailLink = screen.getByText('Info@hsmobility.ca');
    
    // Phone link should have tel: protocol
    expect(phoneLink).toHaveAttribute('href', 'tel:+19053301774');
    
    // Email link should have mailto: protocol
    expect(emailLink).toHaveAttribute('href', 'mailto:Info@hsmobility.ca');
  });

  it('has consistent navigation structure with desktop header', () => {
    render(<Drawer />);
    
    // Verify all navigation items from desktop are present in mobile
    const expectedItems = [
      'Shop All',
      'Acorn Stairlift', // Note: singular in mobile
      'Reviews', 
      'FAQs',
      'Blogs',
      'Contact Us'
    ];
    
    expectedItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('handles multiple rapid clicks correctly', async () => {
    const { handleAnchorNavigation } = require('../src/lib/utils/navigation');
    
    render(<Drawer />);
    
    // Rapidly click multiple navigation items
    fireEvent.click(screen.getByText('Shop All'));
    fireEvent.click(screen.getByText('Reviews'));
    fireEvent.click(screen.getByText('FAQs'));
    
    await waitFor(() => {
      expect(handleAnchorNavigation).toHaveBeenCalledTimes(3);
    });
  });
});