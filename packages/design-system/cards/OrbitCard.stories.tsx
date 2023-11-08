import React from 'react';
import { Story, Meta } from '@storybook/react';
import OrbitCard from './OrbitCard';
import { Orbit } from '../../graphql/mocks/generated';

export default {
  title: 'Components/Cards/OrbitCard',
  component: OrbitCard,
} as Meta;

const Template: Story<{ orbit: Orbit }> = (args) => <OrbitCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  orbit: {
    id: 'R28gZm9yIGEgd2Fsay==',
    name: 'Go for a walk',
    metadata: {
      description: 'A daily walk to improve cardiovascular health.',
      frequency: 'DAY',
      scale: 'ATOMIC',
      isAtomic: true,
    },
    timeframe: {
      startTime: 1617235200,
      endTime: 1617321600,
    },
  },
};
