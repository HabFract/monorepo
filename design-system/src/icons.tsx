import React, { FC, ComponentProps } from "react"
import { Scale } from "../../ui/src/graphql/generated";

export function getIconForPlanetValue(scale: Scale) : FC<ComponentProps<'svg'>> | undefined {
  switch (scale) {
    case Scale.Astro:
      return () => <img style={{height: "24px", width: "24px"}} src="../assets/icons/astro-incomplete-react.svg" />;
    case Scale.Atom:
      return () => <img style={{height: "24px", width: "24px", marginBottom: "5px"}} src="../assets/icons/atom-incomplete-react.svg" />;
    case Scale.Sub:
      return () => <img style={{height: "24px", width: "24px", marginBottom: "3px"}} src="../assets/icons/sub-astro-incomplete-react.svg" />;
  }
}
export function getIconSvg(icon: string | FC<ComponentProps<'svg'>>) : FC<ComponentProps<'svg'>> | undefined {
  if(typeof icon !== 'string') return icon;
  switch (icon) {
    case "tag":
      return () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="input-icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
    case "pencil":
      return () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="input-icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>    
    case "tick":
      return () => <svg width="8" height="6" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="input-icon">
      <path d="M11.3337 1L4.00033 8.33333L0.666992 5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>    
    case "cross":
      return () => <svg width="6" height="6" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="input-icon">
      <path d="M7.33366 0.666016L0.666992 7.33268M0.666992 0.666016L7.33366 7.33268" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>      
    case "info":
      return () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>      
    case "save":
      return () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.66667 1V3.26667C3.66667 3.64004 3.66667 3.82672 3.73933 3.96933C3.80324 4.09477 3.90523 4.19676 4.03067 4.26067C4.17328 4.33333 4.35997 4.33333 4.73333 4.33333H9.26667C9.64004 4.33333 9.82672 4.33333 9.96933 4.26067C10.0948 4.19676 10.1968 4.09477 10.2607 3.96933C10.3333 3.82672 10.3333 3.64004 10.3333 3.26667V1.66667M10.3333 13V8.73333C10.3333 8.35997 10.3333 8.17328 10.2607 8.03067C10.1968 7.90523 10.0948 7.80324 9.96933 7.73933C9.82672 7.66667 9.64004 7.66667 9.26667 7.66667H4.73333C4.35997 7.66667 4.17328 7.66667 4.03067 7.73933C3.90523 7.80324 3.80324 7.90523 3.73933 8.03067C3.66667 8.17328 3.66667 8.35997 3.66667 8.73333V13M13 5.21699V9.8C13 10.9201 13 11.4802 12.782 11.908C12.5903 12.2843 12.2843 12.5903 11.908 12.782C11.4802 13 10.9201 13 9.8 13H4.2C3.0799 13 2.51984 13 2.09202 12.782C1.71569 12.5903 1.40973 12.2843 1.21799 11.908C1 11.4802 1 10.9201 1 9.8V4.2C1 3.0799 1 2.51984 1.21799 2.09202C1.40973 1.71569 1.71569 1.40973 2.09202 1.21799C2.51984 1 3.0799 1 4.2 1H8.78301C9.10913 1 9.27219 1 9.42564 1.03684C9.56169 1.0695 9.69175 1.12337 9.81105 1.19648C9.9456 1.27894 10.0609 1.39424 10.2915 1.62484L12.3752 3.7085C12.6058 3.9391 12.7211 4.0544 12.8035 4.18895C12.8766 4.30825 12.9305 4.43831 12.9632 4.57436C13 4.72781 13 4.89087 13 5.21699Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    default:
      return

  }
}