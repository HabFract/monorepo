import React, { FC, ComponentProps } from "react";
import { Frequency, Scale } from "../generated-types";
import FrequencyIndicator from "./FrequencyIndicator";
import { decodeFrequency } from "@ui/src/state";

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
          className="planet-icon"
          style={{ height: "24px", width: "auto", transform: 'scale(1.3) translate(3px, 3.5px)', marginTop: '0px', objectFit: "cover" }}
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
    return () => <span style={{marginTop: "-0.25rem"}}>
      <FrequencyIndicator size={"sm"} frequency={decodeFrequency(icon as Frequency)} />
    </span>;
  }
  if (typeof icon !== "string") return icon;
  switch (icon) {
    case "fire":
      return () => (
        <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.6281 11.2222C13.3629 13.9868 10.5969 17.3333 7.13012 17.3333C3.53772 17.3333 0.699048 14.5649 0.379769 11.2222C0.0653604 7.93042 1.39909 6.38962 2.86418 4.34873C2.94106 4.24162 3.11404 4.29861 3.11799 4.43039C3.19288 6.92496 3.93319 6.57451 4.33868 8.48663C4.37304 8.64867 4.73227 8.6511 4.76105 8.48798C5.51999 4.18728 7.10385 5.76991 7.55946 0.991887C7.5708 0.872915 7.71986 0.818976 7.7972 0.910092C9.89751 3.38463 10.5836 5.21499 9.1393 9.3735C9.10191 9.48118 9.20416 9.58484 9.30805 9.53794C10.628 8.94221 11.7166 7.50353 11.8873 6.05664C11.9023 5.92931 12.0711 5.87442 12.147 5.97773C12.9668 7.09341 13.865 8.75183 13.6281 11.2222Z" fill="white"/>
        </svg>
      );
    case "trash":
      return () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M4.16663 6.66663H15.8333V16.3333C15.8333 17.4379 14.9379 18.3333 13.8333 18.3333H6.16663C5.06206 18.3333 4.16663 17.4379 4.16663 16.3333V6.66663ZM8.33329 8.41663C8.74751 8.41663 9.08329 8.75241 9.08329 9.16663V14.1666C9.08329 14.5808 8.74751 14.9166 8.33329 14.9166C7.91908 14.9166 7.58329 14.5808 7.58329 14.1666V9.16663C7.58329 8.75241 7.91908 8.41663 8.33329 8.41663ZM12.4166 9.16663C12.4166 8.75241 12.0808 8.41663 11.6666 8.41663C11.2524 8.41663 10.9166 8.75241 10.9166 9.16663V14.1666C10.9166 14.5808 11.2524 14.9166 11.6666 14.9166C12.0808 14.9166 12.4166 14.5808 12.4166 14.1666V9.16663Z" fill="currentColor"/>
          <path d="M7.5 2.66663C7.5 2.11434 7.94772 1.66663 8.5 1.66663H11.5C12.0523 1.66663 12.5 2.11434 12.5 2.66663V3.33329H7.5V2.66663Z" fill="currentColor"/>
          <path d="M2.5 4.99996C2.5 4.53972 2.8731 4.16663 3.33333 4.16663H16.6667C17.1269 4.16663 17.5 4.53972 17.5 4.99996C17.5 5.4602 17.1269 5.83329 16.6667 5.83329H3.33333C2.8731 5.83329 2.5 5.4602 2.5 4.99996Z" fill="currentColor"/>
        </svg>
      );
    case "search":
      return () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.5 17.4999L15 14.9999" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <ellipse cx="9.16663" cy="9.99996" rx="7.5" ry="7.49996" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
    case "filter":
      return () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.8513 2.5H4.99205C3.96346 2.5 3.37509 3.673 3.99014 4.49745L7.91367 9.75673C8.07475 9.97264 8.16176 10.2348 8.16176 10.5042V16.3793C8.16176 17.3175 9.33728 17.7393 9.9337 17.015L10.9649 15.7628C11.1492 15.539 11.25 15.2581 11.25 14.9682V10.5377C11.25 10.2478 11.3508 9.96691 11.5351 9.74311L15.8162 4.54463C16.4877 3.72917 15.9077 2.5 14.8513 2.5Z" fill="currentColor"/>
        </svg>
      );
    case "tree-vis":
      return () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 87">
          <path 
            fill="currentColor" 
            d="M60.1 57a1.6 1.6 0 0 1-1.1-.4l-5.5-5.4a1.6 1.6 0 0 1 1.2-2.8 1.6 1.6 0 0 1 1.1.5l4.5 4.4 4.1-4.4a1.6 1.6 0 0 1 2.3 2.3l-5.4 5.4a1.6 1.6 0 0 1-1.2.5Z"
          />
          <path 
            fill="currentColor" 
            d="M60.1 57a1.6 1.6 0 0 1-1.6-1.5V40.2a1.6 1.6 0 0 1 3.2 0v15.3a1.6 1.6 0 0 1-1.6 1.6ZM23.8 52a1.6 1.6 0 0 1-1.6-1.5v-7.7a1.6 1.6 0 1 1 3.2 0V49l6-.2a1.6 1.6 0 1 1 0 3.3Z"
          />
          <path 
            fill="currentColor" 
            d="M23.8 52a1.6 1.6 0 0 1-1.2-.4 1.6 1.6 0 0 1 0-2.3l10.8-10.8a1.6 1.6 0 0 1 2.8 1.2 1.6 1.6 0 0 1-.5 1.1L25 51.6a1.6 1.6 0 0 1-1.1.5ZM88.4 52a1.6 1.6 0 1 1 0-3.1h6.2l-.1-6.1a1.6 1.6 0 0 1 3.2 0v7.7a1.6 1.6 0 0 1-1.6 1.6Z"
          />
          <path 
            fill="currentColor" 
            d="M96 52a1.6 1.6 0 0 1-1-.4L84.1 40.8a1.6 1.6 0 0 1 0-2.3 1.6 1.6 0 0 1 1-.4 1.6 1.6 0 0 1 1.2.4l10.8 10.8a1.6 1.6 0 0 1 0 2.3 1.6 1.6 0 0 1-1.1.5ZM60.2 32.4a16.2 16.2 0 1 1 16.1-16.2 16.2 16.2 0 0 1-16.1 16.2Zm0-30.4a14.1 14.1 0 1 0 14 14.2A14.2 14.2 0 0 0 60.3 2Z"
          />
          <path 
            fill="currentColor" 
            d="M60.2 22.7a6.5 6.5 0 1 1 6.4-6.5 6.5 6.5 0 0 1-6.4 6.5Zm0-11a4.5 4.5 0 1 0 4.4 4.4 4.5 4.5 0 0 0-4.4-4.4Z"
          />
          <path 
            fill="currentColor"
            stroke="currentColor"
            strokeMiterlimit="10"
            strokeWidth="6"
            d="M14.1 77.7a11.1 11.1 0 1 1 11.2-11.1A11.2 11.2 0 0 1 14 77.7Zm0-20.8a9.7 9.7 0 1 0 9.8 9.7 9.7 9.7 0 0 0-9.8-9.7ZM60.1 84a11.1 11.1 0 1 1 11.1-11.2A11.2 11.2 0 0 1 60.1 84Zm0-20.9a9.7 9.7 0 1 0 9.7 9.7 9.8 9.8 0 0 0-9.7-9.7ZM105.9 77.7A11.1 11.1 0 1 1 117 66.6a11.1 11.1 0 0 1-11.1 11.1Zm0-20.8a9.7 9.7 0 1 0 9.7 9.7 9.7 9.7 0 0 0-9.7-9.7Z"
          />
        </svg>
      );
    case "swap-sort":
      return () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.16663 6.66667L6.22373 2.98804C6.02356 2.73784 5.64302 2.73784 5.44286 2.98804L2.49996 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M5.83337 15L5.83337 3.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M17.5 13.3333L14.5571 17.012C14.3569 17.2622 13.9764 17.2622 13.7762 17.012L10.8333 13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14.1667 5L14.1667 16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
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
    case "list":
      return () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="3" height="3" rx="1" fill="currentColor"/>
          <rect x="2" y="8" width="3" height="3" rx="1" fill="currentColor"/>
          <rect x="2" y="13" width="3" height="3" rx="1" fill="currentColor"/>
          <rect x="7" y="3" width="11" height="3" rx="1" fill="currentColor"/>
          <rect x="7" y="8" width="11" height="3" rx="1" fill="currentColor"/>
          <rect x="7" y="13" width="11" height="3" rx="1" fill="currentColor"/>
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
        <svg width="18" height="18" viewBox="0 0 12 12" style={{marginTop: '2px'}} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
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
          <path d="M8 9V7C8 4.79086 9.79086 3 12 3V3C14.2091 3 16 4.79086 16 7V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path fillRule="evenodd" clipRule="evenodd" d="M3 11C3 9.89543 3.89543 9 5 9H19C20.1046 9 21 9.89543 21 11V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V11ZM12.75 15.1007C13.1012 14.8609 13.3318 14.4574 13.3318 14C13.3318 13.2645 12.7355 12.6682 12 12.6682C11.2645 12.6682 10.6682 13.2645 10.6682 14C10.6682 14.4574 10.8988 14.8609 11.25 15.1007V17C11.25 17.4142 11.5858 17.75 12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V15.1007Z" fill="currentColor" />
        </svg>
      );
    case "info":
      return () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M18.3334 9.99996C18.3334 14.6023 14.6025 18.3333 10.0001 18.3333C5.39771 18.3333 1.66675 14.6023 1.66675 9.99996C1.66675 5.39759 5.39771 1.66663 10.0001 1.66663C14.6025 1.66663 18.3334 5.39759 18.3334 9.99996ZM9.16675 6.66663C9.16675 6.20639 9.53984 5.83329 10.0001 5.83329C10.4603 5.83329 10.8334 6.20639 10.8334 6.66663C10.8334 7.12686 10.4603 7.49996 10.0001 7.49996C9.53984 7.49996 9.16675 7.12686 9.16675 6.66663ZM9.25008 14.1666C9.25008 14.5808 9.58587 14.9166 10.0001 14.9166C10.4143 14.9166 10.7501 14.5808 10.7501 14.1666V9.16663C10.7501 8.75241 10.4143 8.41663 10.0001 8.41663C9.58587 8.41663 9.25008 8.75241 9.25008 9.16663L9.25008 14.1666Z" fill="currentColor" />
        </svg>
      );
    case "settings":
      return () => (
        <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M2.2102 3.4237C1.16548 3.92119 0.5 4.97516 0.5 6.13228V11.8677C0.5 13.0248 1.16548 14.0788 2.2102 14.5763L6.7102 16.7191C7.52617 17.1077 8.47383 17.1077 9.2898 16.7191L13.7898 14.5763C14.8345 14.0788 15.5 13.0248 15.5 11.8677V6.13228C15.5 4.97516 14.8345 3.92119 13.7898 3.4237L9.2898 1.28084C8.47383 0.892286 7.52617 0.892286 6.7102 1.28084L2.2102 3.4237ZM6.25 8.99999C6.25 8.03349 7.0335 7.24999 8 7.24999C8.9665 7.24999 9.75 8.03349 9.75 8.99999C9.75 9.96649 8.9665 10.75 8 10.75C7.0335 10.75 6.25 9.96649 6.25 8.99999ZM8 5.74999C6.20507 5.74999 4.75 7.20506 4.75 8.99999C4.75 10.7949 6.20507 12.25 8 12.25C9.79493 12.25 11.25 10.7949 11.25 8.99999C11.25 7.20506 9.79493 5.74999 8 5.74999Z" fill="currentColor"/>
        </svg>
      );
    case "user":
      return () => (
        <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.99972 17.3333C4.70457 17.3333 2.3187 17.3333 0.769747 15.2121C-0.779204 13.0909 4.70459 11.5 7.99974 11.5C11.2949 11.5 16.7795 13.0909 15.2302 15.2121C13.6808 17.3332 11.2949 17.3333 7.99972 17.3333Z" fill="currentColor"/>
          <ellipse cx="8.00004" cy="4.83332" rx="4.16667" ry="4.16667" fill="currentColor"/>
        </svg>
      );
    default:
      return () => <svg></svg>;
  }
}
