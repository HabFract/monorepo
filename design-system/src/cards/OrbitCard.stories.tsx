import React from 'react';
import { StoryFn, Meta, StoryObj } from '@storybook/react';
import OrbitCard, { OrbitCardProps } from './OrbitCard';
import { Frequency, Orbit, Scale } from '../../../ui/src/graphql/generated';

const meta: Meta<OrbitCardProps> = {
  title: 'Components/Cards/OrbitCard',
  component: OrbitCard,
};

export default meta;

const Template: StoryFn<{ orbit: Orbit }> = (args) => <OrbitCard displayOnly={false} {...args} />;

type Story = StoryObj<OrbitCardProps>;

export const Subatomic: Story = Template.bind({});

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
    frequency: Frequency.Day,
    scale: Scale.Sub,
    eH: '',
    sphereHash: ''
  },
};
export const Atomic: Story = Template.bind({});
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
    frequency: Frequency.Day,
    scale: Scale.Atom,
    eH: '',
    sphereHash: ''
  },
};
export const Astronomic: Story = Template.bind({});
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
    frequency: Frequency.Day,
    scale: Scale.Astro,
    eH: '',
    sphereHash: ''
  },
};
