import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import VisModal, { VisModalProps } from "./VisModal";
import { Select, SelectInputField, TextAreaField, TextInputField } from "../inputs";
import { WithIconWithInfoRequired } from "../inputs/select.stories";
import { getIconForPlanetValue } from "../icons/icons";
import { Frequency, Scale } from "../generated-types";
import FrequencyIndicator from "../icons/FrequencyIndicator";
import { decodeFrequency } from "@ui/src/state";

const meta: Meta<VisModalProps> = {
  title: "Components/Modals/CreateOrbitModal",
  component: VisModal,
  argTypes: {},
  render: (args: any) => (
    <VisModal {...args} isModalOpen={true}
    />
  ),
};

export default meta;

type Story = StoryObj<VisModalProps>;

const mockForm = { field: {}, form: { touched:{}, errors:{}, setFieldValue: () => {}, setTouched: () => {} }};
const scaleSelectInputProps = {id: "test", value: "", placeholder: "test", labelValue: "Scale", required: true, name: "test", errored: false, withInfo: false, options: ["Sun","Planet","Moon"], size: "base", icon: getIconForPlanetValue(Scale.Astro), iconSide: 'left', disabled: false};
const nameInputProps = {id: "test1", value: "", placeholder: "E.g. Health & Fitness", labelValue: "Name", required: true, name: "test", errored: false, withInfo: false, size: "base", iconSide: 'left', disabled: false};
const agreementInputProps = {id: "test2", value: "", placeholder: "I agree to Run 5km before I go to work", labelValue: "Agreement", required: true, name: "test", errored: false, withInfo: false, size: "base", iconSide: 'left', disabled: false};
const frequencySelectInputProps = {id: "test3", value: "", placeholder: "test", labelValue: "Frequency", required: true, name: "test", errored: false, withInfo: false, options: [...Object.values(Frequency).map(freq => decodeFrequency(freq).toString())], size: "base", icon: () => <FrequencyIndicator size="sm" frequency={1} />, iconSide: 'left', disabled: false};

export const CreateOrbit: Story = {
  args: {
    size: "lg",
    children: <div className="flex flex-col gap-2">
      <SelectInputField {...mockForm} props={scaleSelectInputProps} {...scaleSelectInputProps}></SelectInputField>
      <TextInputField {...mockForm} props={nameInputProps} {...nameInputProps}></TextInputField>
      <TextAreaField {...mockForm} props={agreementInputProps} {...agreementInputProps}></TextAreaField>
      <SelectInputField {...mockForm} props={frequencySelectInputProps} {...frequencySelectInputProps}></SelectInputField>
    </div>,
    modalAnnotation: `Example: "Daily Workouts" in Health and Fitness sphere.`
  },
};