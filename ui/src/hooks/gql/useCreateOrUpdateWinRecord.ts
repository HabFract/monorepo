import { winDataPerOrbitNodeAtom } from "../../state/win";
import { useCreateWinRecordMutation as useCreateOrUpdateWinRecordMutationGenerated } from "../../graphql/generated";
import { winDataArrayToWinRecord } from "../useWinData";
import { useAtom } from "jotai";
import { useMemo } from "react";

export const useCreateOrUpdateWinRecord = (opts?) => {
  if (!opts?.variables?.winRecord?.orbitEh)
    return console.error("Insufficient variables for hook");

  const orbitEh = opts.variables.winRecord.orbitEh;
  const [_winRecord, setWinRecord] = useAtom(
    useMemo(() => winDataPerOrbitNodeAtom(orbitEh), [orbitEh])
  );

  return useCreateOrUpdateWinRecordMutationGenerated({
    ...opts,
    update(_cache, { data }, { variables }) {
      const orbitHash = variables?.winRecord.orbitEh;
      if (!data?.createWinRecord || !orbitHash) return;

      const winDataArray = data.createWinRecord.winData;
      const winRecord = winDataArray.reduce(winDataArrayToWinRecord, {});
      setWinRecord(winRecord);

      opts?.update && opts.update();
    },
  });
};
