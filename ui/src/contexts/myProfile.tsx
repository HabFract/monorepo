import { useState, useMemo, createContext } from "react";
//@ts-ignore
import { Profile } from "../graphql/generated";

export const MyProfileContext = createContext(null);

export const MyProfileProvider = (props: any) => {
  const [profile, setProfile] = useState<Omit<Profile, "__typename">>(
    props?.value,
  );
  const value = useMemo(() => [profile, setProfile], [profile]);

  return <MyProfileContext.Provider {...props} value={value} />;
};
