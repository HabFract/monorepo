
export interface ErrorLabelProps {
  fieldName: string;
  errors: object;
  touched?: object;
}

const ErrorLabel: React.FC<ErrorLabelProps>  = ({ fieldName, errors, touched } : ErrorLabelProps) => {
  return (
    <div className='error-label'>
      {errors[fieldName] && touched![fieldName] 
        ? <span className={errors[fieldName].match(/required/) ? 'warn' : 'danger'}>
              {errors[fieldName]}
          </span> 
        : ''}
    </div>
      );
}

export default ErrorLabel