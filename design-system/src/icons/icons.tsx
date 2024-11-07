import React, { FC, ComponentProps } from "react";
import { Frequency, Scale } from "../generated-types";
import FrequencyIndicator from "./FrequencyIndicator";

export function getIconForPlanetValue(
  scale: Scale,
): FC<ComponentProps<"svg">> {
  switch (scale) {
    case Scale.Astro:
      return () => (
        <img
          style={{ height: "24px", minWidth: "24px", transform: 'scale(0.9)', marginTop: '0px', objectFit: "cover" }}
          src="/assets/icons/sun-minimal.svg"
        />
      );
    case Scale.Sub:
      return () => (
        <img
          style={{ height: "24px", width: "auto", transform: 'scale(1.1)', marginTop: '0px', objectFit: "cover" }}
          src="assets/planet.svg"
        />
      );
    case Scale.Atom:
      return () => (
        <img
          style={{ height: "24px", width: "auto", maxWidth: "24px", transform: 'scale(0.8)', marginTop: '0px', objectFit: "cover" }}
          src="assets/moon.svg"
        />
      );
  }
}
export function getIconSvg(
  icon: string,
): FC<ComponentProps<"svg">> | FC<ComponentProps<any>> {
  if (Object.values(Frequency).includes(icon as Frequency)) {
    //@ts-ignore
    return () => <FrequencyIndicator size={"sm"} frequency={icon as Frequency} />;
  }
  if (typeof icon !== "string") return icon;
  switch (icon) {
    case "tag":
      return () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 6h.008v.008H6V6Z"
          />
        </svg>
      );
    case "pencil":
      return () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.4908 2.22039C10.7779 1.9333 11.2434 1.9333 11.5305 2.22039L13.2601 3.94996C13.5472 4.23706 13.5472 4.70253 13.2601 4.98962L12.6552 5.59449C12.5117 5.73804 12.2789 5.73804 12.1354 5.59449L9.88598 3.34509C9.74243 3.20155 9.74243 2.96881 9.88598 2.82526L10.4908 2.22039Z" fill="currentColor" />
          <path d="M8.6598 3.90447C8.94689 3.61738 9.41236 3.61738 9.69946 3.90447L11.429 5.63404C11.7161 5.92114 11.7161 6.38661 11.429 6.67371L6.00084 12.1019C5.97213 12.1306 5.92558 12.1306 5.89687 12.1019L3.23161 9.43663C3.2029 9.40792 3.2029 9.36137 3.23161 9.33266L8.6598 3.90447Z" fill="currentColor" />
          <path d="M2.69741 9.99174C2.70597 9.93177 2.77933 9.90732 2.82217 9.95016L5.38347 12.5115C5.4263 12.5543 5.40185 12.6276 5.34188 12.6362L3.22701 12.9383C2.74184 13.0077 2.32597 12.5918 2.39528 12.1066L2.69741 9.99174Z" fill="currentColor" />
          <path d="M3.33344 14H12.8904" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "cross":
      return () => (
        <svg
          width="6"
          height="6"
          viewBox="0 0 8 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.33366 0.666016L0.666992 7.33268M0.666992 0.666016L7.33366 7.33268"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "save":
      return () => (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.66667 1V3.26667C3.66667 3.64004 3.66667 3.82672 3.73933 3.96933C3.80324 4.09477 3.90523 4.19676 4.03067 4.26067C4.17328 4.33333 4.35997 4.33333 4.73333 4.33333H9.26667C9.64004 4.33333 9.82672 4.33333 9.96933 4.26067C10.0948 4.19676 10.1968 4.09477 10.2607 3.96933C10.3333 3.82672 10.3333 3.64004 10.3333 3.26667V1.66667M10.3333 13V8.73333C10.3333 8.35997 10.3333 8.17328 10.2607 8.03067C10.1968 7.90523 10.0948 7.80324 9.96933 7.73933C9.82672 7.66667 9.64004 7.66667 9.26667 7.66667H4.73333C4.35997 7.66667 4.17328 7.66667 4.03067 7.73933C3.90523 7.80324 3.80324 7.90523 3.73933 8.03067C3.66667 8.17328 3.66667 8.35997 3.66667 8.73333V13M13 5.21699V9.8C13 10.9201 13 11.4802 12.782 11.908C12.5903 12.2843 12.2843 12.5903 11.908 12.782C11.4802 13 10.9201 13 9.8 13H4.2C3.0799 13 2.51984 13 2.09202 12.782C1.71569 12.5903 1.40973 12.2843 1.21799 11.908C1 11.4802 1 10.9201 1 9.8V4.2C1 3.0799 1 2.51984 1.21799 2.09202C1.40973 1.71569 1.71569 1.40973 2.09202 1.21799C2.51984 1 3.0799 1 4.2 1H8.78301C9.10913 1 9.27219 1 9.42564 1.03684C9.56169 1.0695 9.69175 1.12337 9.81105 1.19648C9.9456 1.27894 10.0609 1.39424 10.2915 1.62484L12.3752 3.7085C12.6058 3.9391 12.7211 4.0544 12.8035 4.18895C12.8766 4.30825 12.9305 4.43831 12.9632 4.57436C13 4.72781 13 4.89087 13 5.21699Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "back":
      return () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 5L8.43004 11.6237C8.20238 11.8229 8.20238 12.1771 8.43004 12.3763L16 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "arrow-right":
      return () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.66669 4.16669L12.9033 9.62373C13.131 9.82294 13.131 10.1771 12.9033 10.3763L6.66669 15.8334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "more":
      return () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="4" cy="12" r="2" fill="currentColor" />
          <circle cx="20" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    case "plus":
      return () => (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 1.33337L6 10.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M10.6667 6L1.33335 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "tick":
      return () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM16.7474 9.66436C17.1143 9.25158 17.0771 8.61951 16.6644 8.25259C16.2516 7.88567 15.6195 7.92285 15.2526 8.33564L10.6667 13.4948L8.74741 11.3356C8.38049 10.9229 7.74842 10.8857 7.33564 11.2526C6.92285 11.6195 6.88567 12.2516 7.25259 12.6644L9.17185 14.8235C9.96743 15.7186 11.3659 15.7186 12.1615 14.8235L16.7474 9.66436Z" fill="currentColor" />
        </svg>
      );
    case "lock":
      return () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 9V7C8 4.79086 9.79086 3 12 3V3C14.2091 3 16 4.79086 16 7V9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          <path fillRule="evenodd" clipRule="evenodd" d="M3 11C3 9.89543 3.89543 9 5 9H19C20.1046 9 21 9.89543 21 11V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V11ZM12.75 15.1007C13.1012 14.8609 13.3318 14.4574 13.3318 14C13.3318 13.2645 12.7355 12.6682 12 12.6682C11.2645 12.6682 10.6682 13.2645 10.6682 14C10.6682 14.4574 10.8988 14.8609 11.25 15.1007V17C11.25 17.4142 11.5858 17.75 12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V15.1007Z" fill="currentColor" />
        </svg>
      );
    case "info":
      return () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M18.3334 9.99996C18.3334 14.6023 14.6025 18.3333 10.0001 18.3333C5.39771 18.3333 1.66675 14.6023 1.66675 9.99996C1.66675 5.39759 5.39771 1.66663 10.0001 1.66663C14.6025 1.66663 18.3334 5.39759 18.3334 9.99996ZM9.16675 6.66663C9.16675 6.20639 9.53984 5.83329 10.0001 5.83329C10.4603 5.83329 10.8334 6.20639 10.8334 6.66663C10.8334 7.12686 10.4603 7.49996 10.0001 7.49996C9.53984 7.49996 9.16675 7.12686 9.16675 6.66663ZM9.25008 14.1666C9.25008 14.5808 9.58587 14.9166 10.0001 14.9166C10.4143 14.9166 10.7501 14.5808 10.7501 14.1666V9.16663C10.7501 8.75241 10.4143 8.41663 10.0001 8.41663C9.58587 8.41663 9.25008 8.75241 9.25008 9.16663L9.25008 14.1666Z" fill="currentColor" />
        </svg>
      );
    default:
      return () => <svg></svg>;
  }
}
