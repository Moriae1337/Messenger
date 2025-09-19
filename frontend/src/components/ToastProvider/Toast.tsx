import type { ToastType } from "./toastTypes";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white cursor-pointer transition-all duration-300 ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
      onClick={onClose}
    >
      {message}
    </div>
  );
}
