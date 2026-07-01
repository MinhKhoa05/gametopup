type FormDataValue = string | number | boolean | File | null | undefined;

export function appendFormValue(formData: FormData, key: string, value: FormDataValue) {
  if (value === undefined || value === null) {
    return;
  }

  formData.append(key, value instanceof File ? value : String(value));
}
