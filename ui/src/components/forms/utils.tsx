import { useFormikContext } from "formik";
import { useGetOrbitQuery } from "../../graphql/generated";
import { useEffect } from "react";

export const OrbitFetcher = ({ orbitToEditId }) => {
  const { setValues } = useFormikContext();
  if (!orbitToEditId) return;

  const {
    data: getData,
    error: getError,
    loading: getLoading,
  } = useGetOrbitQuery({
    variables: {
      id: orbitToEditId as string,
    },
  });
  useEffect(() => {
    console.log('getData for OrbitFetcher :>> ', getData);
    if (typeof getData == "undefined") return;
    const {
      name,
      frequency,
      scale,
      metadata: {
        description,
        timeframe: { startTime, endTime },
      },
    } = getData!.orbit as any;
    setValues({
      id: orbitToEditId,
      name,
      description,
      startTime,
      endTime: endTime || undefined,
      frequency,
      scale,
      archival: !!endTime,
      parentHash: getData.orbit?.parentHash,
      eH: getData.orbit.eH,
    });
  }, [getData]);
  return null;
};
