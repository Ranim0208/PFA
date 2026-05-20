import SlideItem from "./slide-item"

export default function HeroSectionSlide() {
  const slides = [
    {
      src: "/images/slide/art.jpg",
      alt: "Arts",
      title: "Arts",
    },
    {
      src: "/images/slide/talents.jpg",
      alt: "Talents",
      title: "Talents",
    },
    {
      src: "/images/slide/creation.jpg",
      alt: "Créations",
      title: "Créations",
    },
    {
      src: "/images/slide/inclusion.jpg",
      alt: "Inclusion",
      title: "Inclusion",
    },
    {
      src: "/images/slide/recherche.jpg",
      alt: "Recherche",
      title: "Recherche",
    },
  ]

  return (
    <div className="z-30 flex w-full overflow-hidden bg-tacir-orange group relative">
      {/* Mobile: Show 3 items, Tablet: Show 4 items, Desktop: Show all 5 with duplication */}
      <div
        className="flex shrink-0 animate-[scroll_30s_linear_infinite] md:animate-[scroll_25s_linear_infinite] lg:animate-[scroll_20s_linear_infinite] whitespace-nowrap group-hover:[animation-play-state:paused]"
        aria-hidden="false"
      >
        {/* For mobile and tablet, we'll use media queries to show different numbers of items */}
        <div className="flex md:hidden">
          {/* Mobile: Show 3 items */}
          {slides.slice(0, 3).map((slide, i) => (
            <SlideItem key={`mobile-${i}`} {...slide} />
          ))}
        </div>
        
        <div className="hidden md:flex lg:hidden">
          {/* Tablet: Show 4 items */}
          {slides.slice(0, 4).map((slide, i) => (
            <SlideItem key={`tablet-${i}`} {...slide} />
          ))}
        </div>
        
        <div className="hidden lg:flex">
          {/* Desktop: Show all 5 items */}
          {slides.map((slide, i) => (
            <SlideItem key={`desktop-${i}`} {...slide} />
          ))}
        </div>
      </div>

      {/* Duplicated set for seamless animation */}
      <div
        className="flex shrink-0 animate-[scroll_30s_linear_infinite] md:animate-[scroll_25s_linear_infinite] lg:animate-[scroll_20s_linear_infinite] whitespace-nowrap group-hover:[animation-play-state:paused]"
        aria-hidden="true"
      >
        <div className="flex md:hidden">
          {/* Mobile: Show 3 items */}
          {slides.slice(0, 3).map((slide, i) => (
            <SlideItem key={`mobile-dup-${i}`} {...slide} />
          ))}
        </div>
        
        <div className="hidden md:flex lg:hidden">
          {/* Tablet: Show 4 items */}
          {slides.slice(0, 4).map((slide, i) => (
            <SlideItem key={`tablet-dup-${i}`} {...slide} />
          ))}
        </div>
        
        <div className="hidden lg:flex">
          {/* Desktop: Show all 5 items */}
          {slides.map((slide, i) => (
            <SlideItem key={`desktop-dup-${i}`} {...slide} />
          ))}
        </div>
      </div>

      {/* Gradient overlays for better UX */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 md:w-16 lg:w-20 bg-gradient-to-r from-tacir-orange to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 md:w-16 lg:w-20 bg-gradient-to-l from-tacir-orange to-transparent z-10 pointer-events-none" />
    </div>
  )
}