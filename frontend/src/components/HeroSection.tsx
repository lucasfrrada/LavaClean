import {useEffect, useMemo, useState} from "react";

// Ejemplo: importa tus imágenes reales
import hero1 from "../assets/imgs/HeroSection/hero1.jpg";
import hero2 from "../assets/imgs/HeroSection/hero1.jpg";
import hero3 from "../assets/imgs/HeroSection/hero1.jpg";
import hero4 from "../assets/imgs/HeroSection/hero1.jpg";
import hero5 from "../assets/imgs/HeroSection/hero1.jpg";
import hero6 from "../assets/imgs/HeroSection/hero1.jpg";

type Slide = {
  id: number;
  title: string;
  description: string;
  image: string;
};

const slides: Slide[] = [
  {
    id: 1,
    title: "Siempre hay una tienda LavaClean cerca de ti",
    description:
      "Servicio de lavandería ecológico y profesional para toda tu ropa.",
    image: hero1,
  },
  {
    id: 2,
    title: "Lavado premium para todo tipo de prendas",
    description:
      "Cuidamos desde ropa diaria hasta prendas delicadas con productos de alta calidad.",
    image: hero2,
  },
  {
    id: 3,
    title: "Eco-friendly y comprometidos contigo",
    description:
      "Usamos procesos sostenibles y productos biodegradables que cuidan tu ropa y el planeta.",
    image: hero3,
  },
  {
    id: 4,
    title: "Servicio rápido y confiable",
    description:
      "Tu ropa lista en tiempo récord, con el mejor cuidado y dedicación.",
    image: hero4,
  },
  {
    id: 5,
    title: "Tu ropa impecable, sin complicaciones",
    description:
      "Agenda tu servicio fácilmente y deja tu ropa en manos expertas.",
    image: hero5,
  },
  {
    id: 6,
    title: "Atención pensada para tu comodidad",
    description:
      "Queremos que lavar tu ropa sea una experiencia simple, rápida y segura.",
    image: hero6,
  },
];

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const activeSlide = slides[activeIndex];

  const visibleSlides = useMemo(() => {
    const ordered = [
      slides[activeIndex],
      slides[(activeIndex + 1) % slides.length],
      slides[(activeIndex + 2) % slides.length],
      slides[(activeIndex + 3) % slides.length],
      slides[(activeIndex + 4) % slides.length],
    ];

    return ordered;
  }, [activeIndex]);

  return (
    <section
      id="inicio"
      className="bg-[#F5EEDC] px-6 pt-28 pb-16 text-[#2E2018]"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        {/* Lado izquierdo */}
        <div className="max-w-xl">
          <span className="inline-block rounded-full bg-[#E9DDC6] px-4 py-1 text-sm font-medium text-[#6B4F3E]">
            Lavandería ecológica
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl">
            {activeSlide.title}
          </h1>

          <p className="mt-5 text-base leading-7 text-[#6E5A4C] md:text-lg">
            {activeSlide.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-full bg-[#6B4F3E] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#5a4133]">
              Encuentra tu tienda
            </button>

            <button className="rounded-full border border-[#6B4F3E] px-6 py-3 text-sm font-semibold text-[#6B4F3E] transition hover:bg-[#6B4F3E] hover:text-white">
              Ver servicios
            </button>
          </div>

          {/* Indicadores */}
          <div className="mt-8 flex items-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-3 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-8 bg-[#6B4F3E]"
                    : "w-3 bg-[#C8B8A3]"
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Lado derecho: collage/carrusel visual */}
        <div className="grid grid-cols-2 gap-4">
          {/* Columna izquierda */}
          <div className="grid gap-4">
            <ImageCard
              slide={visibleSlides[0]}
              isActive
              onClick={() =>
                setActiveIndex(
                  slides.findIndex((s) => s.id === visibleSlides[0].id),
                )
              }
              className="h-36 md:h-40"
            />
            <ImageCard
              slide={visibleSlides[1]}
              onClick={() =>
                setActiveIndex(
                  slides.findIndex((s) => s.id === visibleSlides[1].id),
                )
              }
              className="h-52 md:h-56"
            />
            <ImageCard
              slide={visibleSlides[2]}
              onClick={() =>
                setActiveIndex(
                  slides.findIndex((s) => s.id === visibleSlides[2].id),
                )
              }
              className="h-36 md:h-40"
            />
          </div>

          {/* Columna derecha */}
          <div className="grid gap-4 pt-8">
            <ImageCard
              slide={visibleSlides[3]}
              onClick={() =>
                setActiveIndex(
                  slides.findIndex((s) => s.id === visibleSlides[3].id),
                )
              }
              className="h-52 md:h-56"
            />
            <ImageCard
              slide={visibleSlides[4]}
              onClick={() =>
                setActiveIndex(
                  slides.findIndex((s) => s.id === visibleSlides[4].id),
                )
              }
              className="h-36 md:h-40"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

type ImageCardProps = {
  slide: Slide;
  className?: string;
  isActive?: boolean;
  onClick: () => void;
};

function ImageCard({
  slide,
  className = "",
  isActive = false,
  onClick,
}: ImageCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl shadow-md transition duration-300 hover:scale-[1.02] ${
        isActive ? "ring-4 ring-[#6B4F3E]/40" : ""
      } ${className}`}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#2E2018]/55 via-[#2E2018]/10 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
        <p className="line-clamp-2 text-sm font-semibold text-white">
          {slide.title}
        </p>
      </div>
    </button>
  );
}
