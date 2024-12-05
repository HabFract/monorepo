import { Button } from "habit-fract-design-system";

const DefaultSubmitBtn = ({
  loading,
  errors,
  touched,
  editMode,
  onClick,
}: {
  loading: boolean;
  errors: object;
  touched: object;
  editMode: boolean;
  onClick: () => void
}) => {
  return (
    <Button
      type="submit"
      isLoading={loading}
      variant={editMode ? "warn responsive" : "primary responsive"}
      isDisabled={
        loading ||
        !!Object.values(errors).length ||
        !!(Object.values(touched).filter((value) => value).length < 1)
      }
      onClick={onClick}
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
