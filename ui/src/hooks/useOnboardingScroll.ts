import { useEffect, RefObject } from 'react';

export function useOnboardingScroll(state: string, progressBarRef: RefObject<HTMLDivElement>, mainPageRef: RefObject<HTMLDivElement>) {
  useEffect(() => {
    const stage = +(state.match(/Onboarding(\d+)/)?.[1] || 0);
    if (!stage || progressBarRef.current == null) return;
    setTimeout(() => {
      (progressBarRef.current as any).querySelector(".onboarding-progress").scrollTo(stage * 130, 0)
    }, 500);
  }, [state, progressBarRef]);

  useEffect(() => {
    if (mainPageRef.current == null) return;
    setTimeout(() => {
      (mainPageRef.current as any)?.querySelector(".onboarding-layout")?.scrollTo(0, 0);
    }, 500);
  }, [state, mainPageRef]);
}