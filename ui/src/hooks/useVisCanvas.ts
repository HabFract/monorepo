// useVisCanvas.ts
import { useState, useEffect } from "react";
import { appendSvg } from "../components/vis/helpers";
import { SphereHashes } from "../state";

export const useVisCanvas = (selectedSphere: SphereHashes) => {
  const [appendedSvg, setAppendedSvg] = useState<boolean>(false);

  useEffect(() => {
    if (document.querySelector(`#vis-root #vis`)) return;
    const appended = !!appendSvg("vis-root", "vis");
    setAppendedSvg(appended);
  }, [selectedSphere?.actionHash]);

  return { appendedSvg };
};
