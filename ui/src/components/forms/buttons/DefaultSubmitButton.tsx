import { Button } from "habit-fract-design-system";

const DefaultSubmitBtn = ({
  loading,
  errors,
  touched,
  editMode,
}: {
  loading: boolean;
  errors: object;
  touched: object;
  editMode: boolean;
}) => {
  return (
    <Button
      type="submit"
      isLoading={loading}
      variant={editMode ? "warn" : "primary"}
      isDisabled={
        loading ||
        !!Object.values(errors).length ||
        !!(Object.values(touched).filter((value) => value).length < 1)
      }
    >
      { editMode ? (
        "Update"
      ) : (
        "Create"
      )}
    </Button>
  );
};

export default DefaultSubmitBtn;
