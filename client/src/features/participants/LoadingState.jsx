export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-tacir-lightgray rounded-full animate-spin"></div>
        <div className="w-20 h-20 border-4 border-tacir-pink border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-tacir-darkblue mb-2">
          Chargement des participants...
        </p>
        <p className="text-tacir-darkgray">
          Veuillez patienter pendant que nous chargeons les données
        </p>
      </div>
    </div>
  );
}
