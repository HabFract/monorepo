
function OnboardingLayout({ children } : any) {

  return (
    <div className="onboarding-layout">
      <div className="flex flex-col flex-around w-full">{children}</div>
    </div>
  )
}

export default OnboardingLayout
