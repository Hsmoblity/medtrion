import React from 'react';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { SocialMediaLinkProps, footerDesignTokens } from '../../lib/interfaces/footer';

/**
 * Social Media Links Component
 * 
 * Displays social media links with consistent styling and accessibility features.
 * Maintains consistency with header design patterns.
 */
const SocialMediaLinks: React.FC<{ socialMedia: SocialMediaLinkProps[]; className?: string }> = ({
  socialMedia,
  className = ""
}) => {
  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      FaFacebook,
      FaTwitter,
      FaInstagram,
      FaLinkedin,
      FaYoutube
    };
    
    const IconComponent = iconMap[iconName] || FaFacebook;
    return <IconComponent size={25} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={className}
    >
      <h3 className={`${footerDesignTokens.typography.heading} mb-4`}>
        Follow Us
      </h3>
      <div className="flex justify-start gap-4">
        {socialMedia.map((social, index) => (
          <motion.a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className={`
              ${footerDesignTokens.colors.text.accent}
              transition-colors duration-300
              hover:scale-110 transform
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              rounded-full p-2
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {getIcon(social.icon)}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};

export default SocialMediaLinks;