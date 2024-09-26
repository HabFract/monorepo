import React from 'react';
import { StoryFn, Meta, StoryObj } from '@storybook/react';
import SphereCard, { SphereCardProps } from './SphereCard';
import { Scale, Sphere } from '../../../ui/src/graphql/generated';

export default {
  title: 'Components/Cards/SphereCard',
  component: SphereCard,
} as Meta<SphereCardProps>;

const Template: StoryFn<{ sphere: Sphere }> = (args) => <SphereCard {...args} />;

type Story = StoryObj<SphereCardProps>;

export const Default: Story = Template.bind({});
Default.args = {
  sphere: {
    id: 'SGVhbHRoMQ==',
    name: 'Health and Fitness',
    metadata: {
      description: 'Focus on physical health, exercise, and nutrition.',
      hashtag: 'fitness exercise nutrition',
    },
  },
  eH: '',
  isHeader: false,
  orbitScales: [Scale.Astro,Scale.Atom,Scale.Astro,Scale.Sub,Scale.Sub]
};

export const Header: Story = Template.bind({});
Header.args = {
  sphere: {
    id: 'SGVhbHRoMQ==',
    name: 'Health and Fitness',
    metadata: {
      description: 'Focus on physical health, exercise, and nutrition.',
      hashtag: 'fitness exercise nutrition',
    },
  },
  isHeader: true,
  eH: '',
  orbitScales: [Scale.Astro,Scale.Atom,Scale.Astro,Scale.Sub,Scale.Sub]
};
