import type { Meta, StoryObj } from '@storybook/react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselIndicator,
  CarouselNavigation
} from './pictureCarousal';

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel
};

export default meta;

type Story = StoryObj<typeof Carousel>;

const BaseCarousel = () => (
  <Carousel className="max-w-3xl mx-auto" initialIndex={0}>
    <CarouselContent className="gap-6">
      {[1, 2, 3].map((item) => (
        <CarouselItem key={item} className="aspect-video rounded-xl overflow-hidden bg-gray-100">
          <img
            src={`https://picsum.photos/960/540?random=${item}`}
            alt={`Carousel item ${item}`}
            className="h-full w-full object-cover"
          />
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselNavigation alwaysShow className="-left-6 w-[calc(100%+3rem)]" />
    <div className="mt-4 flex justify-center">
      <CarouselIndicator />
    </div>
  </Carousel>
);

export const Default: Story = {
  render: () => <BaseCarousel />
};
