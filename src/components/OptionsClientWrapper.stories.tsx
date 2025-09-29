import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import OptionsClientWrapper from './OptionsClientWrapper';
import { makeCartProduct, withCartEnvironment } from './storybook/storyHelpers';

const cartItem = makeCartProduct({
  cartItemId: 'ci_story',
  slug: 'deluxe-stairlift',
  productId: 'prod_story',
  title: 'Deluxe Stairlift Package'
});

const product = {
  ...cartItem,
  _related_options: [601, 602],
  _related_options_products: [
    {
      databaseId: 601,
      name: 'Outdoor Cover',
      type: 'simple',
      price: 249,
      slug: 'outdoor-cover'
    },
    {
      databaseId: 602,
      name: 'Comfort Seat',
      type: 'variable',
      variableType: 'radio',
      variations: [
        {
          databaseId: 6021,
          sku: 'SEAT-COMFORT-LG',
          price: 199,
          attributes: [
            { name: 'Size', value: 'Large' }
          ]
        },
        {
          databaseId: 6022,
          sku: 'SEAT-COMFORT-MD',
          price: 179,
          attributes: [
            { name: 'Size', value: 'Medium' }
          ]
        }
      ]
    }
  ]
};

const meta: Meta<typeof OptionsClientWrapper> = {
  title: 'Components/OptionsClientWrapper',
  component: OptionsClientWrapper,
  decorators: [withCartEnvironment([cartItem])],
  args: {
    product
  },
  parameters: {
    nextjs: {
      navigation: {
        push: (...args: unknown[]) => {
          console.info('[router.push]', ...args);
        }
      }
    }
  }
};

export default meta;

type Story = StoryObj<typeof OptionsClientWrapper>;

const WithQueryParam = (props: React.ComponentProps<typeof OptionsClientWrapper>) => {
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('cartItemId', 'ci_story');
    window.history.replaceState({}, '', url.toString());
  }, []);

  return <OptionsClientWrapper {...props} />;
};

export const Default: Story = {
  render: (args) => <WithQueryParam {...args} />
};
