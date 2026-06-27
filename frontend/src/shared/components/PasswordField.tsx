import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Field, FieldProps } from "@/shared/components";

type PasswordFieldProps = Omit<FieldProps, "type" | "trailing">;

export function PasswordField({
  autoComplete = "current-password",
  required = true,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      {...props}
      required={required}
      autoComplete={autoComplete}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition-all hover:bg-cyan/10 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40"
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  );
}
