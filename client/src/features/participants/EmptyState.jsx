import { Users } from "lucide-react";

export default function EmptyState({ title, description }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-tacir-lightgray/30">
      <div className="max-w-md mx-auto">
        <div className="p-6 bg-tacir-lightgray/20 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
          <Users className="w-16 h-16 text-tacir-darkgray" />
        </div>
        <h3 className="text-xl font-bold text-tacir-darkblue mb-4">{title}</h3>
        <p className="text-tacir-darkgray mb-6">{description}</p>
      </div>
    </div>
  );
}
