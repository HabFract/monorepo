import { winDataPerOrbitNodeAtom, winDataArrayToWinRecord } from "../../state/win";
import { useCreateWinRecordMutation as useCreateOrUpdateWinRecordMutationGenerated } from "../../graphql/generated";
import { useAtom } from "jotai";
import { useCallback, useMemo } from "react";
import { getOrbitIdFromEh, store } from "../../state";

export const useCreateOrUpdateWinRecord = (opts?) => {
  const orbitEh = opts?.variables?.winRecord?.orbitEh;
  const [_, setWinRecord] = useAtom(
    useMemo(() => winDataPerOrbitNodeAtom(store.get(getOrbitIdFromEh(orbitEh))), [orbitEh])
  );

  const [createOrUpdateWinRecordMutation] =
    useCreateOrUpdateWinRecordMutationGenerated();

  const executeMutation = useCallback((opts) => {
    createOrUpdateWinRecordMutation({
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
  }, [orbitEh, createOrUpdateWinRecordMutation]);

  return executeMutation;
};
