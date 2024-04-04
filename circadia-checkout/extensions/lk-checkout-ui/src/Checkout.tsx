import {
  reactExtension,
  useBuyerJourneyIntercept,
  useShippingAddress,
  Banner,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

export default reactExtension(
  "purchase.checkout.delivery-address.render-before",
  () => <RequireInfoExtension />,
);

function RequireInfoExtension() {
  const [validationError, setValidationError] = useState("");
  const shippingAddress = useShippingAddress();

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    const errors = [];
    // Validate that the age of the buyer is known, and that they're old enough to complete the purchase
    if (
      canBlockProgress &&
      (!shippingAddress.company || shippingAddress.company.length === 0)
    ) {
      errors.push("Company name");
    }

    if (
      canBlockProgress &&
      (!shippingAddress.phone || shippingAddress.phone.length === 0)
    ) {
      errors.push("Phone Number");
    }

    if (errors.length > 0) {
      return {
        behavior: "block",
        reason: "Missing Required Information",
        perform: (result) => {
          // If progress can be blocked, then set a validation error on the custom field
          if (result.behavior === "block") {
            setValidationError(errors.join(", "));
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

  useEffect(() => {
    setValidationError("");
  }, [shippingAddress.phone, shippingAddress.company]);

  return (
    <>
      {validationError && (
        <Banner title="Missing Required Information" status="critical">
          {`The following information needs to be entered: ${validationError}`}
        </Banner>
      )}
    </>
  );
}
