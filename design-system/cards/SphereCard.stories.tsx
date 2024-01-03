import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import SphereCard from './SphereCard';
import { Scale, Sphere } from '../../app/src/graphql/generated';

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
  orbitScales: [Scale.Astro,Scale.Atom,Scale.Astro,Scale.Sub,Scale.Sub]
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
  orbitScales: [Scale.Astro,Scale.Atom,Scale.Astro,Scale.Sub,Scale.Sub]
};
