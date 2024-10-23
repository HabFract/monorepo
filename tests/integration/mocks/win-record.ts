import { CreateWinRecordDocument } from "../../../ui/src/graphql/generated/index";

export const BASIC_DAILY_WIN_RECORD = [
  {
    request: {
      query: CreateWinRecordDocument,
      variables: {
        winRecord: {
          orbitEh: "aTestOrbitEh",
          winData: [
            { date: "24/10/2024", single: true },
            { date: "23/10/2024", single: true },
          ],
        },
      },
    },
    result: {
      data: {
        createWinRecord: {
          id: "uhCAkWR1Ye6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX6l-ncJWu",
          eH: "uhCEkWR1Ye6wTVt56vtr5pszKBHwjwh2cPYFv4ej5KvfX6l-ncJWu",
          winData: [
            {
              date: "24/10/2024",
              value: {
                single: true,
                __typename: "SingleWin",
              },
              __typename: "WinDateEntry",
            },
            {
              date: "23/10/2024",
              value: {
                single: true,
                __typename: "SingleWin",
              },
              __typename: "WinDateEntry",
            },
          ],
        },
      },
    },
  },
] as any;
