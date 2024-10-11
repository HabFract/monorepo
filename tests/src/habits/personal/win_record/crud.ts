import { decode } from '@msgpack/msgpack';
import {
  encodeHashToBase64,
} from "@holochain/client";

import { pause, runScenario } from "@holochain/tryorama";
import pkg from "tape-promise/tape";
import { setUpAliceandBob } from "../../../../utils-backend";
import { anOrbit, setupSphere } from '../../personal/orbits/utils';
import { aWinRecord } from '../../../../../ui/src/graphql/generated/mocks';
import { Orbit, WinRecord } from "../../../../../ui/src/graphql/generated";
import { EntryRecord } from "@holochain-open-dev/utils";
import { sortWinRecordEntryArrayByWinRecordDateIndex } from './utils';

const { test } = pkg;

export default () => {
  test("Win Record CRUD - Happy path", async (t) => {
    await runScenario(async (scenario) => {
      const {
        alice,
        bob,
        cleanup,
        alice_agent_key,
        bob_agent_key,
        habits_cell_alice,
        habits_cell_bob,
      } = await setUpAliceandBob();

      const callZomeAlice = async (zome_name, fn_name, payload) => {
        return await alice.callZome({
          cap_secret: null,
          cell_id: habits_cell_alice,
          zome_name,
          fn_name,
          payload,
          provenance: alice_agent_key,
        });
      };
      try {
        const pauseDuration = 1000;
        await scenario.shareAllAgents();
        await pause(pauseDuration);

        // 1. Given a Sphere has been created and we know its hash
        // And an Orbit has been created and we know its hash
        const hash1 = await setupSphere(callZomeAlice);
        const createOrbitResponse = await callZomeAlice(
          "personal",
          "create_my_orbit",
          anOrbit({sphereHash: encodeHashToBase64(hash1)})
        );
        const hash2 =  new EntryRecord<Orbit>(createOrbitResponse)?.entryHash;
        t.ok(hash1 && hash2, "A sphere was created with an orbit linked to it,");

        // When Alice then creates a single WinRecord with otherwise valid input, using the hash as an OrbitId 
        const winData = {"01/01/2021": {single: true}};
        const createWinRecordResponse = await callZomeAlice(
          "personal",
          "create_or_update_win_record",
          {orbitId: encodeHashToBase64(hash2), winData: winData}
        );
        t.ok(createWinRecordResponse, 'a single win record was created,');
        // Then the WinRecord was created

        // 2. When Alice then creates a multiple WinRecord with otherwise valid input, using the hash as an OrbitId 
        const winData2 = {"02/01/2021": {multiple: [true, false, true]}};
        const createWinRecordResponse2 = await callZomeAlice(
          "personal",
          "create_or_update_win_record",
          {orbitId: encodeHashToBase64(hash2), winData: winData2}
        );
        t.ok(createWinRecordResponse2, 'and a multiple win record was created,');
        // Then the WinRecord was created


        // 3. When Alice then gets all WinRecords for an orbit for a given year/month, giving the orbit hash as input 
        const getOrbitWinRecordForYearMonthResponse = await callZomeAlice(
          "personal",
          "get_an_orbits_win_record_for_month",
          {orbitId: encodeHashToBase64(hash2), yearDotMonth: "2021.01"}
        );
        t.ok(getOrbitWinRecordForYearMonthResponse, 'A query was made to get win records for an orbit in a particular YYYY.MM,');
        t.equal(getOrbitWinRecordForYearMonthResponse.length, 2, 'and the response was an array of the correct length.');
        // Then the WinRecords were returned


        // 4. When Alice creates a WinRecord for two months (over a year end) with otherwise valid input, with mixed month datestrings as indexes, using the hash as an OrbitId
        const unbucketedWinData = {"31/12/2020": {multiple: [true, false, true]}, "02/01/2021": {multiple: [false, true, false]}};
        const createWinRecordsResponse = await callZomeAlice(
          "personal",
          "create_or_update_win_records",
          {orbitId: encodeHashToBase64(hash2), winData: unbucketedWinData}
        );
        t.ok(createWinRecordsResponse, 'and multiple bucketed win records were created,');
        t.equal(createWinRecordsResponse?.length, 2, 'and they were returned in an array of records of the correct length,');
        const createdWinRecordEntryRecords = createWinRecordsResponse
          .map(record => new EntryRecord<WinRecord>(record))
          .sort(sortWinRecordEntryArrayByWinRecordDateIndex);

        t.equal(createdWinRecordEntryRecords[0].entry.winData["31/12/2020"].multiple[0], true, 'and they returned the correct win records 1,');
        t.equal(createdWinRecordEntryRecords[1].entry.winData["02/01/2021"].multiple[1], true, 'and they returned the correct win records 2,');
        t.equal(createdWinRecordEntryRecords[0].entry.winData["02/01/2021"], undefined, 'and they returned a win record without the other bucketed record 1,');
        t.equal(createdWinRecordEntryRecords[1].entry.winData["31/12/2020"], undefined, 'and they returned a win record without the other bucketed record 2,');
        // Then the WinRecords were separately created


        // 5. When Alice then gets all WinRecords for an orbit for each created bucketed year/month, giving the orbit hash as input 
        const getOrbitWinRecordForYearMonthResponseDec20 = await callZomeAlice(
          "personal",
          "get_an_orbits_win_record_for_month",
          {orbitId: encodeHashToBase64(hash2), yearDotMonth: "2020.12"}
        );
        t.ok(getOrbitWinRecordForYearMonthResponseDec20, 'A query was made to get win records for an orbit in the first bucketed YYYY.MM,');
        t.equal(getOrbitWinRecordForYearMonthResponseDec20.length, 1, 'and the response was an array of the correct length.');
        const getOrbitWinRecordForYearMonthResponseJan21 = await callZomeAlice(
          "personal",
          "get_an_orbits_win_record_for_month",
          {orbitId: encodeHashToBase64(hash2), yearDotMonth: "2021.01"}
        );
        t.ok(getOrbitWinRecordForYearMonthResponseJan21, 'A query was made to get win records for an orbit in the first bucketed YYYY.MM,');
        t.equal(getOrbitWinRecordForYearMonthResponseJan21.length, 3, 'and the response was an array of the correct length (given earlier test results).');
        // Then the WinRecords were returned
      } catch (e) {
        t.ok(null);
      }
      await cleanup();
    });
  });
};

