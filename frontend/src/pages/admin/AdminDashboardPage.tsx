import {ClipboardList, Users, Shirt, DollarSign} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <section>
      <div>
        <h1 className="text-3xl font-bold text-[#6B4F3E]">
          Dashboard administrativo
        </h1>
        <p className="mt-2 text-sm text-[#9A7C5F]">
          Resumen general de la operación de LavaClean.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Pedidos activos"
          value="12"
          icon={ClipboardList}
        />
        <DashboardCard title="Clientes registrados" value="48" icon={Users} />
        <DashboardCard title="Servicios disponibles" value="6" icon={Shirt} />
        <DashboardCard
          title="Ingresos del mes"
          value="$340.000"
          icon={DollarSign}
        />
      </div>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[#6B4F3E]">Actividad reciente</h2>

        <div className="mt-5 space-y-4">
          <ActivityItem
            title="Nuevo pedido creado"
            description="Juan Pérez agendó un servicio de lavado y planchado."
          />
          <ActivityItem
            title="Pedido completado"
            description="El pedido #1002 fue marcado como completado."
          />
          <ActivityItem
            title="Pago recibido"
            description="Se registró el pago del pedido #1003."
          />
        </div>
      </section>
    </section>
  );
}

type DashboardCardProps = {
  title: string;
  value: string;
  icon: React.ElementType;
};

function DashboardCard({title, value, icon: Icon}: DashboardCardProps) {
  return (
    <article className="rounded-3xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#9A7C5F]">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-[#6B4F3E]">{value}</h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5EEDC] text-[#6B4F3E]">
          <Icon size={25} />
        </div>
      </div>
    </article>
  );
}

type ActivityItemProps = {
  title: string;
  description: string;
};

function ActivityItem({title, description}: ActivityItemProps) {
  return (
    <article className="rounded-2xl border border-[#E5D8C5] bg-[#F8F5EE] p-4">
      <h3 className="font-bold text-[#6B4F3E]">{title}</h3>
      <p className="mt-1 text-sm text-[#9A7C5F]">{description}</p>
    </article>
  );
}
