// components/ui/BilingualDisplay.jsx
"use client";

export function BilingualDisplay({ text }) {
  return (
    <div className="space-y-1">
      <div className="font-medium text-tacir-darkblue">{text.fr || "N/A"}</div>
      {text.ar && (
        <div className="text-sm text-muted-foreground" dir="rtl">
          {text.ar}
        </div>
      )}
    </div>
  );
}
