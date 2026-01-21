"use client";

import { useRef } from "react";

interface AutoSubmitCheckboxProps {
  name: string;
  defaultChecked: boolean;
}

/**
 * Client Component for auto-submitting checkbox on change.
 *
 * Server Components can't use onChange handlers, so we need
 * a Client Component for this interactivity.
 */
export function AutoSubmitCheckbox({
  name,
  defaultChecked,
}: AutoSubmitCheckboxProps) {
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <input
      type="checkbox"
      name={name}
      value="on"
      defaultChecked={defaultChecked}
      onChange={(e) => {
        // Find the parent form and submit it
        const form = e.target.closest("form");
        if (form) {
          form.requestSubmit();
        }
      }}
    />
  );
}
