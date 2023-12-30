import React from "react"
import { Form, DatePicker } from "antd"
import { DateTime } from "luxon"

import luxonGenerateConfig from 'rc-picker/lib/generate/luxon';
const MyDatePicker = DatePicker.generatePicker<DateTime>(luxonGenerateConfig);

const FormItem = Form.Item

const dateFormat = "YYYY/MM/DD";

const DateInput = ({
  field,
  form: { touched, errors, setFieldValue, values },
  ...props
}) => {
  const errorMsg = touched[field.name] && errors[field.name]
  const validateStatus = errorMsg
    ? "error"
    : touched[field.name] && !errors[field.name]
    ? "success"
    : undefined

  return (
    <div>
      <FormItem
        help={errorMsg}
        validateStatus={validateStatus}
        hasFeedback
      >
        <MyDatePicker format={dateFormat}
          disabled={props.disabled}
          picker={values.frequency.toLowerCase()} 
          onChange={async (_date, dateString) => setFieldValue(field.name, DateTime.local(...dateString.split('/').map(n => +n)).ts)}
        />
      </FormItem>
    </div>
  )
}
export default DateInput
