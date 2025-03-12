import { AlertCircle } from "lucide-react";
import React from "react";

interface FormErrorProps {
  message: string;
}

const FormError: React.FC<FormErrorProps> = ({ message }) => {
  return (
    <div
      className={`rounded-md border flex items-center justify-start p-2 gap-4 w-full bg-[#FD404626] border-[#FD4046] text-[#242424]`}
    >
      <AlertCircle className="text-[#FD4046]" />
      <div className="flex flex-col text-left">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default FormError;