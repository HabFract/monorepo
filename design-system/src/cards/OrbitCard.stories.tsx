import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import OrbitCard from './OrbitCard';
import { Orbit } from '../../../ui/src/graphql/generated';

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
      timeframe: {
        startTime: 1617235200,
        endTime: 1617321600,
      },
    },
    frequency: 'DAY',
    scale: 'Sub',
    isAtomic: true,
  },
};
export const Atomic = Template.bind({});
Atomic.args = {
  orbit: {
    id: 'R28gZm9yIGEgd2Fsay==',
    name: 'Go for a walk',
    metadata: {
      description: 'A daily walk to improve cardiovascular health.',
      timeframe: {
        startTime: 1617235200,
        endTime: 1617321600,
      },
    },
    frequency: 'DAY',
    scale: 'Atom',
    isAtomic: true,
  },
};
export const Astronomic = Template.bind({});
Astronomic.args = {
  orbit: {
    id: 'R28gZm9yIGEgd2Fsay==',
    name: 'Go for a walk',
    metadata: {
      description: 'A daily walk to improve cardiovascular health.',
      timeframe: {
        startTime: 1617235200,
        endTime: 1617321600,
      },
    },
    frequency: 'DAY',
    scale: 'Astro',
    isAtomic: true,
  },
};
