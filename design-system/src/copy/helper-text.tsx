export interface HelperTextProps {
  onClickInfo: (e: any) => {};
  children: React.ReactNode
}

const HelperText: React.FC<HelperTextProps> = ({ children, onClickInfo } : HelperTextProps) => {
  return (
    <div className="flex w-full font-medium leading-std text-input-text text-xs gap-4 font-sans font-semibold">
      {children}
      <div className="text-primary w-4 h-4 pr-4 mb-2 cursor-pointer" onClick={(e) => onClickInfo!(e)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
      </div>
    </div>
  )
}

export default HelperText