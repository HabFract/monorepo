import { Meta, StoryObj } from "@storybook/react";
import Button, { ButtonProps } from "./Button";
import { getIconSvg } from "../icons/icons";

const meta: Meta<ButtonProps> = {
  title: "Components/Onboarding/Button",
  component: Button,
  argTypes: {},
};

export default meta;

type Story = StoryObj<ButtonProps>;

export const Primary: Story = {
  args: {
    type: "onboarding",
  },
  render: (args) => (
    <Button type={args.type} onClick={() => {}}>
      Save & Continue
    </Button>
  ),
};

export const SquareIcon: Story = {
  render: () => (
    <Button type={"icon"} icon={(getIconSvg("cross") as any)()} onClick={() => {}}>
    </Button>
  ),
};

export const CircleIcon: Story = {
  render: () => (
    <Button type={"circle-icon"} icon={(getIconSvg("cross") as any)()} onClick={() => {}}>
    </Button>
  ),
};
