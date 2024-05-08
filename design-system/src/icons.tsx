import React, { FC, ComponentProps } from "react"
import { Scale } from "../../app/src/graphql/generated";

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
        
    default:
      return

  }
}