import { winDataPerOrbitNodeAtom } from "../../state/win";
import { useCreateWinRecordMutation as useCreateOrUpdateWinRecordMutationGenerated } from "../../graphql/generated";
import { winDataArrayToWinRecord } from "../useWinData";
import { useAtom } from "jotai";
import { useCallback, useMemo } from "react";

export const useCreateOrUpdateWinRecord = (opts?) => {
  const orbitEh = opts?.variables?.winRecord?.orbitEh;
  const [_, setWinRecord] = useAtom(
    useMemo(() => winDataPerOrbitNodeAtom(orbitEh), [orbitEh])
  );

  const [createOrUpdateWinRecordMutation] =
    useCreateOrUpdateWinRecordMutationGenerated({
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

  const executeMutation = useCallback(() => {
    if (!orbitEh) {
      console.error("Insufficient variables for hook");
      return;
    }
    createOrUpdateWinRecordMutation();
  }, [orbitEh, createOrUpdateWinRecordMutation]);

  return executeMutation;
};
