import { useFormikContext } from "formik";
import { useGetOrbitQuery } from "../../graphql/generated";
import { useEffect } from "react";

export const OrbitFetcher = ({orbitToEditId}) => {
  const { setValues } = useFormikContext();
console.log('orbitToEditId :>> ', orbitToEditId);
  const {data: getData, error: getError, loading: getLoading } = useGetOrbitQuery({
    variables: {
      id: orbitToEditId as string
    },
  });

  useEffect(() => {
    console.log('getData :>> ', getData);
      if(typeof getData == "undefined") return;
      const {  name, sphereHash: parentHash, frequency, scale, metadata: {description, timeframe:  {startTime, endTime} }} = getData!.orbit as any;
      
      setValues({
        name, description, startTime, endTime: endTime || undefined, frequency, scale, archival: !!endTime, parentHash
      })
  }, [getData])
  return null;
};