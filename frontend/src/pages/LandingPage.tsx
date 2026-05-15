import {
  Droplets,
  Shirt,
  Clock,
  Leaf,
  Heart,
  Sparkles,
  Truck,
} from "lucide-react";
import NavbarMain from "../components/NavbarMain";
import HeroSection from "../components/HeroSection";
import {Link} from "react-router-dom";

const commitments = [
  {
    icon: Droplets,
    title: "Lavado Premium",
    description: "Tecnología de punta para el mejor cuidado",
  },
  {
    icon: Shirt,
    title: "Todo tipo de ropa",
    description: "Desde ropa casual hasta prendas delicadas",
  },
  {
    icon: Clock,
    title: "Servicio rápido",
    description: "Listo en 24-48 horas",
  },
  {
    icon: Leaf,
    title: "Eco-friendly",
    description: "Productos biodegradables y sostenibles",
  },
  {
    icon: Heart,
    title: "Con amor",
    description: "Tratamos tu ropa como si fuera nuestra",
  },
];

const benefits = [
  {
    icon: Sparkles,
    title: "Calidad garantizada",
    description:
      "Utilizamos los mejores productos y técnicas para cuidar tus prendas",
  },
  {
    icon: Leaf,
    title: "Compromiso ambiental",
    description:
      "Productos ecológicos y procesos sostenibles que cuidan el planeta",
  },
  {
    icon: Truck,
    title: "Servicio express",
    description: "Recogemos y entregamos en tu domicilio para tu comodidad",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full bg-[#F5EEDC] text-white">
      {/* Navbar */}
      <NavbarMain></NavbarMain>
      {/* Hero */}
      <HeroSection></HeroSection>

      {/* Compromisos */}
      <section id="servicios" className="bg-[#6B4F3E] px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">Nuestros compromisos</h2>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#F8EFD8]" />

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {commitments.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F8EFD8] text-[#6B4F3E] shadow-lg">
                  <Icon size={36} strokeWidth={2.2} />
                </div>

                <h3 className="mt-5 text-base font-bold">{item.title}</h3>

                <p className="mt-2 max-w-[180px] text-xs leading-relaxed text-[#E7D9C2]">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Por qué elegir LavaClean */}
      <section id="nosotros" className="bg-[#F5EEDC] px-6 py-20 text-[#6B4F3E]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">
              ¿Por qué elegir LavaClean?
            </h2>

            <div className="mt-8 space-y-7">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#6B4F3E] text-[#F8EFD8]">
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3 className="text-base font-bold">{benefit.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#8A7161]">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-[#8A6A53] to-[#6B4F3E] p-8 text-white shadow-2xl">
            <h3 className="text-3xl font-bold">¡Obtén 20% de descuento!</h3>

            <p className="mt-4 text-sm text-[#F5EEDC]">
              En tu primer servicio al registrarte hoy
            </p>

            <button className="mt-6 w-full rounded-full bg-[#F8EFD8] py-3 text-sm font-bold text-[#6B4F3E] transition hover:bg-white">
              Obtener descuento
            </button>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-gradient-to-br from-[#7B5E48] to-[#5A4334] px-6 py-20 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          ¿Listo para disfrutar de ropa impecable?
        </h2>

        <p className="mt-5 mb-5 text-sm text-[#F5EEDC] md:text-base">
          Únete a miles de clientes satisfechos que confían en LavaClean
        </p>

        <Link
          to="/agendar"
          className="inline-flex items-center justify-center rounded-full bg-[#F8EFD8] px-9 py-3 text-sm font-bold text-[#6B4F3E] shadow-xl transition hover:-translate-y-1 hover:bg-white"
        >
          Agenda tu servicio
        </Link>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-[#6B4F3E] px-6 py-12 text-[#F5EEDC]">
        <div className="mx-auto grid max-w-6xl gap-10 border-b border-[#8A7161] pb-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span>🧺</span>
              <span className="text-lg font-bold text-white">LavaClean</span>
            </div>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#E7D9C2]">
              Lavandería ecológica con servicio premium para el cuidado de tu
              ropa.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white">Servicios</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#E7D9C2]">
              <li>Lavado y planchado</li>
              <li>Tintorería</li>
              <li>Lavado express</li>
              <li>Servicio a domicilio</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white">Compañía</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#E7D9C2]">
              <li>Nosotros</li>
              <li>Blog</li>
              <li>Sucursales</li>
              <li>Trabaja con nosotros</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white">Contacto</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#E7D9C2]">
              <li>contacto@lavaclean.com</li>
              <li>+52 123 456 7890</li>
              <li>Lun - Sáb: 8am - 8pm</li>
              <li>Dom: 9am - 5pm</li>
            </ul>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[#D8C7AF]">
          © 2026 LavaClean. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}
