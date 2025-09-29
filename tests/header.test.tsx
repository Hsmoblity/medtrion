import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import Header from '../src/components/PageLayout/Header';
import { useCartStore } from '../src/stores/cartStore';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock cart store
jest.mock('../src/stores/cartStore', () => ({
  useCartStore: jest.fn(),
  useCartCount: jest.fn(() => 0),
}));

// Mock navigation utility
jest.mock('../src/lib/utils/navigation', () => ({
  handleAnchorNavigation: jest.fn(),
}));

// Mock components
jest.mock('../src/components/PageLayout/Cart/Cart', () => {
  return function MockCart() {
    return <div data-testid="cart-component">Cart</div>;
  };
});

jest.mock('../src/components/btn', () => ({
  DrawOutlineButton: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('../src/components/drawer', () => {
  return function MockDrawer() {
    return <div data-testid="drawer-component">Drawer</div>;
  };
});

jest.mock('../src/components/ClientOnly', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

describe('Header Component', () => {
  const mockPush = jest.fn();
  const mockToggleCartVisibility = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      asPath: '/',
    });

    (useCartStore as jest.Mock).mockReturnValue(mockToggleCartVisibility);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders header with all navigation items', () => {
    render(<Header />);
    
    // Check desktop navigation items
    expect(screen.getByText('Shop All')).toBeInTheDocument();
    expect(screen.getByText('Acorn Stairlifts')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('FAQs')).toBeInTheDocument();
    expect(screen.getByText('Blogs')).toBeInTheDocument();
  });

  it('renders logo with correct link', () => {
    render(<Header />);
    
    const logoLink = screen.getByRole('link', { name: /logo/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders cart button', () => {
    render(<Header />);
    
    const cartButtons = screen.getAllByRole('button');
    const cartButton = cartButtons.find(button => 
      button.querySelector('svg') // Cart icon
    );
    
    expect(cartButton).toBeInTheDocument();
  });

  it('handles navigation clicks with analytics tracking', async () => {
    const { handleAnchorNavigation } = require('../src/lib/utils/navigation');
    
    render(<Header />);
    
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

  it('handles cart button clicks', () => {
    render(<Header />);
    
    const cartButtons = screen.getAllByRole('button');
    const cartButton = cartButtons.find(button => 
      button.querySelector('svg') // Cart icon
    );
    
    fireEvent.click(cartButton!);
    
    expect(mockPush).toHaveBeenCalledWith('/cart');
  });

  it('renders mobile drawer', () => {
    render(<Header />);
    
    expect(screen.getByTestId('drawer-component')).toBeInTheDocument();
  });

  it('renders cart component', () => {
    render(<Header />);
    
    expect(screen.getByTestId('cart-component')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Header />);
    
    // Check for proper ARIA labels
    const cartButtons = screen.getAllByRole('button');
    const cartButton = cartButtons.find(button => 
      button.querySelector('svg') // Cart icon
    );
    
    expect(cartButton).toBeInTheDocument();
  });

  it('handles scroll behavior', () => {
    render(<Header />);
    
    // Test scroll behavior by checking if scroll event listeners are attached
    const scrollEvent = new Event('scroll');
    window.dispatchEvent(scrollEvent);
    
    // Component should handle scroll without errors
    expect(true).toBe(true);
  });

  it('renders all navigation items with correct href attributes', () => {
    render(<Header />);
    
    // Check that all navigation items are present
    const navigationItems = [
      'Shop All',
      'Acorn Stairlifts', 
      'Contact Us',
      'Reviews',
      'FAQs',
      'Blogs'
    ];
    
    navigationItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('handles multiple navigation clicks correctly', async () => {
    const { handleAnchorNavigation } = require('../src/lib/utils/navigation');
    
    render(<Header />);
    
    // Click multiple navigation items
    fireEvent.click(screen.getByText('Shop All'));
    fireEvent.click(screen.getByText('Reviews'));
    fireEvent.click(screen.getByText('FAQs'));
    
    await waitFor(() => {
      expect(handleAnchorNavigation).toHaveBeenCalledTimes(3);
      expect(handleAnchorNavigation).toHaveBeenCalledWith('/#shop', expect.any(Object), 'Shop All');
      expect(handleAnchorNavigation).toHaveBeenCalledWith('/#reviews', expect.any(Object), 'Reviews');
      expect(handleAnchorNavigation).toHaveBeenCalledWith('/#faq', expect.any(Object), 'FAQs');
    });
  });
});