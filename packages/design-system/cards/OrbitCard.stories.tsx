import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import OrbitCard from './OrbitCard';
import { Orbit } from '../../app/src/graphql/generated';

export default {
  title: 'Components/Cards/OrbitCard',
  component: OrbitCard,
} as Meta;

const Template: StoryFn<{ orbit: Orbit }> = (args) => <OrbitCard {...args} />;

export const Subatomic = Template.bind({});
Subatomic.args = {
  orbit: {
    id: 'R28gZm9yIGEgd2Fsay==',
    name: 'Go for a walk',
    metadata: {
      description: 'A daily walk to improve cardiovascular health.',
      frequency: 'DAY',
      scale: 'SUB',
      isAtomic: true,
    },
    timeframe: {
      startTime: 1617235200,
      endTime: 1617321600,
    },
  },
};
export const Atomic = Template.bind({});
Atomic.args = {
  orbit: {
    id: 'R28gZm9yIGEgd2Fsay==',
    name: 'Go for a walk',
    metadata: {
      description: 'A daily walk to improve cardiovascular health.',
      frequency: 'DAY',
      scale: 'ATOM',
      isAtomic: true,
    },
    timeframe: {
      startTime: 1617235200,
      endTime: 1617321600,
    },
  },
};
export const Astronomic = Template.bind({});
Astronomic.args = {
  orbit: {
    id: 'R28gZm9yIGEgd2Fsay==',
    name: 'Go for a walk',
    metadata: {
      description: 'A daily walk to improve cardiovascular health.',
      frequency: 'DAY',
      scale: 'ASTRO',
      isAtomic: true,
    },
    timeframe: {
      startTime: 1617235200,
      endTime: 1617321600,
    },
  },
};
