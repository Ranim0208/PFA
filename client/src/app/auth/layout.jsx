import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full">
   
      <div className="hidden md:block">
        <Image
          alt="Tacir Background image"
          src="/images/tacir-bg.jpg"
          fill
          className="absolute inset-0 -z-10 object-cover"
          priority
        />
      </div>

      <div className="md:hidden absolute inset-0 -z-10 bg-gray-50" />

      <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6">
        <div className="flex w-full max-w-md md:max-w-3xl justify-center bg-white md:bg-opacity-10 p-6 md:p-8 rounded-lg shadow-lg md:backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}