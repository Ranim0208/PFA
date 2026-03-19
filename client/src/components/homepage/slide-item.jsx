import Image from "next/image";

export default function SlideItem({ alt, src, title }) {
  return (
    <div className="relative w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0 group">
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden">
        <Image
          alt={alt}
          src={src}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="brightness-50 object-cover transition-transform duration-500 group-hover:brightness-75 group-hover:scale-110"
          quality={85}
          priority={false}
        />
      </div>

      {/* Title - Centered and responsive */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <h2 className="text-white font-bold uppercase text-center drop-shadow-lg tracking-wide text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl transition-transform duration-300 group-hover:scale-105">
          {title}
        </h2>
      </div>
    </div>
  );
}