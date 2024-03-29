import {
  reactExtension,
  TextField,
  useApplyShippingAddressChange,
  useBuyerJourneyIntercept,
  useExtensionCapability,
  useShippingAddress,
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";

export default reactExtension(
  "purchase.checkout.delivery-address.render-before",
  () => <RequireInfoExtension />,
);

function RequireInfoExtension() {
  const changeShippingAddress = useApplyShippingAddressChange();
  const [validationError, setValidationError] = useState("");
  const shippingAddress = useShippingAddress();
  const canBlockProgress = useExtensionCapability("block_progress");

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    // Validate that the age of the buyer is known, and that they're old enough to complete the purchase
    if (
      canBlockProgress &&
      (!shippingAddress.company || shippingAddress.company.length === 0)
    ) {
      return {
        behavior: "block",
        reason: "Company name is required",
        perform: (result) => {
          // If progress can be blocked, then set a validation error on the custom field
          if (result.behavior === "block") {
            setValidationError("Enter your company name");
          }
        },
      };
    }

    return {
      behavior: "allow",
      perform: () => {
        // Ensure any errors are hidden
        setValidationError("");
      },
    };
  });

  return (
    <TextField
      type="text"
      label={"Company Name"}
      value={shippingAddress.company}
      required={canBlockProgress}
      onInput={() => setValidationError("")}
      onChange={(name) => {
        changeShippingAddress({
          type: "updateShippingAddress",
          address: { company: name },
        });
      }}
      error={validationError}
    />
  );
}
