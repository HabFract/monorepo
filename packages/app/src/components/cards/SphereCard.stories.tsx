import React from 'react';
import { Story, Meta } from '@storybook/react';
import SphereCard from './SphereCard';
import { Sphere } from '../../graphql/mocks/generated';

export default {
  title: 'Components/Cards/SphereCard',
  component: SphereCard,
} as Meta;

const Template: Story<{ sphere: Sphere }> = (args) => <SphereCard {...args} />;

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
};
