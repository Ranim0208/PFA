"use client";
import { useStack } from "../../../contexts/stack";

export default function StackRenderer() {
  const { items, pop } = useStack();
  const currentComponent = items[items.length - 1];

  if (!currentComponent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="relative p-6">
          <button
            onClick={pop}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          {currentComponent}
        </div>
      </div>
    </div>
  );
}
