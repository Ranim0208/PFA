import { LoaderPinwheelIcon } from "lucide-react";
// Full-screen loader (default)
const Loader = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tacir-blue"></div>
    </div>
  );
};

// Inline version (named export)
export const InlineLoader = ({ text = "Chargement..." }) => {
  return (
    <div className="w-full flex items-center justify-center py-4">
      <div className="flex items-center gap-2">
        <LoaderPinwheelIcon className="h-6 w-6 text-tacir-darkblue animate-spin" />
        <span className="text-gray-600 text-sm">{text}</span>
      </div>
    </div>
  );
};

export default Loader;
