import * as React from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import {
  FormFieldContext,
  FormItemContext,
} from "@/components/ui/form-context";

export function useFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext<TFieldValues>();

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const fieldState = getFieldState(fieldContext.name as FieldPath<TFieldValues>, formState);

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

