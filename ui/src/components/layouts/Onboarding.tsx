import './common.css';

function OnboardingLayout({ children }: any) {
  return (
    <div className="onboarding-layout">
      <div className="container">{children}</div>
    </div>
  );
}

export default OnboardingLayout;
