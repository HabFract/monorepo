import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import SphereCard from './SphereCard';
import { Scale, Sphere } from '../../app/src/graphql/mocks/generated';

export default {
  title: 'Components/Cards/SphereCard',
  component: SphereCard,
} as Meta;

const Template: StoryFn<{ sphere: Sphere }> = (args) => <SphereCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  sphere: {
    id: 'SGVhbHRoMQ==',
    name: 'Health and Fitness',
    metadata: {
      description: 'Focus on physical health, exercise, and nutrition.',
      hashtag: 'fitness exercise nutrition',
    },
  },
  isHeader: false,
  orbitScales: [Scale.ASTRO,Scale.ATOM,Scale.ASTRO,Scale.SUB,Scale.SUB]
};

export const Header = Template.bind({});
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
  orbitScales: [Scale.ASTRO,Scale.ATOM,Scale.ASTRO,Scale.SUB,Scale.SUB]
};
