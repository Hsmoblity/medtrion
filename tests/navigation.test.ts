import { handleAnchorNavigation } from '../src/lib/utils/navigation';

// Mock Next.js router
const mockRouter = {
  asPath: '/',
  push: jest.fn(),
};

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
  },
  writable: true,
});

// Mock document.getElementById
const mockElement = {
  scrollIntoView: jest.fn(),
};

Object.defineProperty(document, 'getElementById', {
  value: jest.fn(() => mockElement),
  writable: true,
});

describe('Navigation Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.asPath = '/';
  });

  describe('handleAnchorNavigation', () => {
    it('should handle anchor navigation on same page', async () => {
      mockRouter.asPath = '/';
      
      await handleAnchorNavigation('/#shop', mockRouter, 'Shop All');
      
      expect(document.getElementById).toHaveBeenCalledWith('shop');
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should handle page navigation with anchor', async () => {
      mockRouter.asPath = '/about';
      
      await handleAnchorNavigation('/#shop', mockRouter, 'Shop All');
      
      expect(mockRouter.push).toHaveBeenCalledWith('/');
      
      // Wait for setTimeout
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(document.getElementById).toHaveBeenCalledWith('shop');
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle regular page navigation', async () => {
      await handleAnchorNavigation('/blogs', mockRouter, 'Blogs');
      
      expect(mockRouter.push).toHaveBeenCalledWith('/blogs');
    });

    it('should track navigation events', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await handleAnchorNavigation('/#shop', mockRouter, 'Shop All');
      
      expect(consoleSpy).toHaveBeenCalledWith('Navigation Event:', expect.objectContaining({
        linkName: 'Shop All',
        destination: '/#shop',
        linkType: 'anchor',
        deviceType: 'desktop'
      }));
      
      consoleSpy.mockRestore();
    });

    it('should determine correct link types', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Test anchor link
      await handleAnchorNavigation('/#shop', mockRouter, 'Shop All');
      expect(consoleSpy).toHaveBeenCalledWith('Navigation Event:', expect.objectContaining({
        linkType: 'anchor'
      }));
      
      // Test internal link
      await handleAnchorNavigation('/blogs', mockRouter, 'Blogs');
      expect(consoleSpy).toHaveBeenCalledWith('Navigation Event:', expect.objectContaining({
        linkType: 'internal'
      }));
      
      // Test tel link
      await handleAnchorNavigation('tel:+19053301774', mockRouter, 'Phone');
      expect(consoleSpy).toHaveBeenCalledWith('Navigation Event:', expect.objectContaining({
        linkType: 'tel'
      }));
      
      // Test mailto link
      await handleAnchorNavigation('mailto:Info@hsmobility.ca', mockRouter, 'Email');
      expect(consoleSpy).toHaveBeenCalledWith('Navigation Event:', expect.objectContaining({
        linkType: 'mailto'
      }));
      
      consoleSpy.mockRestore();
    });

    it('should determine correct device type', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Mock desktop width
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        writable: true,
      });
      
      await handleAnchorNavigation('/#shop', mockRouter, 'Shop All');
      expect(consoleSpy).toHaveBeenCalledWith('Navigation Event:', expect.objectContaining({
        deviceType: 'desktop'
      }));
      
      // Mock mobile width
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true,
      });
      
      await handleAnchorNavigation('/#shop', mockRouter, 'Shop All');
      expect(consoleSpy).toHaveBeenCalledWith('Navigation Event:', expect.objectContaining({
        deviceType: 'mobile'
      }));
      
      consoleSpy.mockRestore();
    });
  });
});