import React from "react";

export default function LoadingOverlay({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-purple-500 mx-auto mb-4" />
        <p className="text-white text-lg font-semibold">{message}</p>
      </div>
    </div>
  );
}
