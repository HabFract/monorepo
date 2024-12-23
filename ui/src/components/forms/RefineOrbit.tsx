import React from "react";
import { Formik } from "formik";

import { Scale } from "../../graphql/generated";
import { OrbitSubdivisionList } from "../lists";
import { OrbitFetcher } from "./utils";
import { OrbitValidationSchema } from "./CreateOrbit";
import { ActionHashB64 } from "@holochain/client";
import { currentOrbitIdAtom, store } from "../../state";
import { MODEL_DISPLAY_VALUES } from "../../constants";

interface RefineOrbitProps {
  refiningOrbitAh: ActionHashB64;
  submitBtn?: React.ReactNode;
  headerDiv?: React.ReactNode;
}

export enum Refinement {
  Update = "update",
  Split = "split",
  AddList = "add-list",
}

const RefineOrbitOnboarding: React.FC<RefineOrbitProps> = ({
  refiningOrbitAh,
  headerDiv,
  submitBtn,
}: RefineOrbitProps) => {
  // Occasionally due to some kind of race condition, this prop doesn't get set properly so here we use a fallback
  refiningOrbitAh ||= store.get(currentOrbitIdAtom)?.id;

  return (
    <Formik
      style="max-width: 28rem;"
      initialValues={{} as any}
      validationSchema={OrbitValidationSchema}
      onSubmit={async (_values, { setSubmitting }) => {
        // This doesn't actually need submitting, just using the context to use the Orbit Fetcher.
      }}
    >
      {({ values, errors, touched }) => {
        return (
          <section>
            {refiningOrbitAh! && (
              <OrbitFetcher orbitToEditId={refiningOrbitAh} />
            )}
            {headerDiv}

            <div className="content">
              <div className="form-description">
                This is your chance to divide a large scale {MODEL_DISPLAY_VALUES['orbit'].toLowerCase()} into several smaller <em>agreements or actions</em> that will simplify carrying out your plan.
              </div>
            <OrbitSubdivisionList
              submitBtn={submitBtn}
              currentOrbitValues={values}
              refinementType={
                values.scale == Scale.Atom
                  ? Refinement.Update
                  : Refinement.Split
              }
            ></OrbitSubdivisionList>
            </div>
          </section>
        );
      }}
    </Formik>
  );
};

export default RefineOrbitOnboarding;
