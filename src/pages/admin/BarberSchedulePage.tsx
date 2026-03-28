import { useState } from "react"
import { Calendar, Users, Scissors, LogOut } from "lucide-react"

// ─── Tipos ────────────────────────────────────────────────
interface DiaAgenda {
  iso: string
  label: string
  bloqueado: boolean
  motivoBloqueio?: "falta" | "folga" | "feriado"
  agendamentos: Agendamento[]
}

interface Agendamento {
  id: string
  cliente: string
  telefone: string
  servicos: string[]
  horario: string
  status: "confirmado" | "pendente" | "cancelado"
}

// ─── Dados estáticos ──────────────────────────────────────
// TODO: substituir por GET /barbeiro/:id/agenda quando backend estiver pronto
const AGENDAMENTOS_DIA_0: Agendamento[] = [
  { id: "1", cliente: "João Silva",   telefone: "(81) 99999-1111", servicos: ["Corte"],        horario: "08:00", status: "confirmado" },
  { id: "2", cliente: "Pedro Souza",  telefone: "(81) 99999-2222", servicos: ["Barba"],         horario: "09:00", status: "confirmado" },
  { id: "3", cliente: "Lucas Lima",   telefone: "(81) 99999-3333", servicos: ["Corte + Barba"], horario: "10:00", status: "pendente"   },
  { id: "4", cliente: "Marcos Costa", telefone: "(81) 99999-4444", servicos: ["Corte"],        horario: "11:00", status: "confirmado" },
  { id: "5", cliente: "Bruno Alves",  telefone: "(81) 99999-5555", servicos: ["Pigmentação"],   horario: "14:00", status: "cancelado"  },
  { id: "6", cliente: "Rafael Dias",  telefone: "(81) 99999-6666", servicos: ["Corte"],        horario: "15:30", status: "confirmado" },
]

const AGENDAMENTOS_DIA_1: Agendamento[] = [
  { id: "7",  cliente: "Felipe Nunes",    telefone: "(81) 99999-7777", servicos: ["Corte"],        horario: "09:00", status: "confirmado" },
  { id: "8",  cliente: "Gabriel Melo",    telefone: "(81) 99999-8888", servicos: ["Barba"],         horario: "10:30", status: "confirmado" },
  { id: "9",  cliente: "Thiago Ferreira", telefone: "(81) 99999-9999", servicos: ["Corte + Barba"], horario: "13:00", status: "pendente"   },
]

const AGENDAMENTOS_DIA_2: Agendamento[] = [
  { id: "10", cliente: "André Lopes",  telefone: "(81) 98888-1111", servicos: ["Sobrancelha"],   horario: "08:30", status: "confirmado" },
  { id: "11", cliente: "Carlos Rocha", telefone: "(81) 98888-2222", servicos: ["Corte"],         horario: "10:00", status: "confirmado" },
  { id: "12", cliente: "Diego Santos", telefone: "(81) 98888-3333", servicos: ["Pigmentação"],   horario: "11:30", status: "cancelado"  },
  { id: "13", cliente: "Eduardo Lima", telefone: "(81) 98888-4444", servicos: ["Corte + Barba"], horario: "14:30", status: "confirmado" },
]

const AGENDAMENTOS_DIA_3: Agendamento[] = [
  { id: "14", cliente: "Fábio Carvalho", telefone: "(81) 98888-5555", servicos: ["Barba"],  horario: "09:30", status: "confirmado" },
  { id: "15", cliente: "Gustavo Pires",  telefone: "(81) 98888-6666", servicos: ["Corte"],  horario: "11:00", status: "pendente"   },
]

const AGENDAMENTOS_POR_DIA: Record<number, Agendamento[]> = {
  0: AGENDAMENTOS_DIA_0,
  1: AGENDAMENTOS_DIA_1,
  2: AGENDAMENTOS_DIA_2,
  3: AGENDAMENTOS_DIA_3,
}

const PRECOS: Record<string, number> = {
  "Corte": 35, "Barba": 15, "Corte + Barba": 45,
  "Sobrancelha": 10, "Pigmentação": 15, "Reflexo": 10,
}

// TODO: substituir por dados do barbeiro logado
const BARBEIRO = { nome: "David", especialidade: "Cortes modernos", avatar: "DA" }

const NAV_ITEMS = [
  { label: "Agenda", icon: Calendar },
  { label: "Clientes", icon: Users },
  { label: "Serviços", icon: Scissors },
  { label: "Sair", icon: LogOut },
]

/** Gera os próximos 7 dias para navegação da semana. */
function gerarSemana(): DiaAgenda[] {
  const hoje = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const data = new Date(hoje)
    data.setDate(hoje.getDate() + i)
    return {
      iso: data.toISOString().split("T")[0],
      label: data.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }),
      bloqueado: false,
      agendamentos: AGENDAMENTOS_POR_DIA[i] ?? [],
    }
  })
}

// ─── Componente principal ──────────────────────────────────
export default function BarberSchedulePage() {
  const [navAtivo, setNavAtivo]             = useState("Agenda")
  const [semana, setSemana]                 = useState<DiaAgenda[]>(gerarSemana)
  const [diaSelecionado, setDiaSelecionado] = useState(0)
  const [bloqueioMotivo, setBloqueioMotivo] = useState<"falta" | "folga" | "feriado">("folga")

  const dia         = semana[diaSelecionado]
  const ativos      = dia.agendamentos.filter(a => a.status !== "cancelado")
  const proximo     = dia.agendamentos.find(a => a.status === "confirmado")
  const faturamento = ativos.reduce((acc, a) =>
    acc + a.servicos.reduce((s, sv) => s + (PRECOS[sv] ?? 0), 0), 0
  )

  const toggleBloqueio = () => {
    setSemana(prev => prev.map((d, i) => {
      if (i !== diaSelecionado) return d
      return d.bloqueado
        ? { ...d, bloqueado: false, motivoBloqueio: undefined }
        : { ...d, bloqueado: true,  motivoBloqueio: bloqueioMotivo }
    }))
  }

  return (
    <div className="min-h-screen bg-stone-900 flex overflow-x-hidden">

      {/* Sidebar — oculta em mobile */}
      <aside className="hidden md:flex flex-col w-56 bg-stone-950 p-5 gap-6 flex-shrink-0">

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-stone-900 font-bold text-sm">✂</div>
          <span className="text-white font-bold tracking-wide">BarberPro</span>
        </div>

        <div className="flex flex-col items-center gap-2 py-4 border-y border-stone-800">
          <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-stone-900 font-bold text-lg">
            {BARBEIRO.avatar}
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">{BARBEIRO.nome}</p>
            <p className="text-stone-400 text-xs">{BARBEIRO.especialidade}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(item => {
          const Icon = item.icon

          return (
            <button
              key={item.label}
              onClick={() => setNavAtivo(item.label)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                ${navAtivo === item.label
                  ? "bg-amber-400 text-stone-900"
                  : "text-stone-400 hover:bg-stone-800 hover:text-white"
                }
              `}
            >
              <Icon size={18} />
              {item.label}
            </button>
            )
          })}
        </nav>

        <p className="text-stone-600 text-xs text-center">v0.1.0</p>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 min-w-0 p-4 pb-20 md:pb-8 md:p-8">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Header mobile */}
          <div className="flex md:hidden items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center text-stone-900 font-bold text-sm">✂</div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Minha Agenda</h1>
              <p className="text-stone-400 text-sm">BarberPro</p>
            </div>
          </div>

          <h1 className="hidden md:block text-white font-bold text-xl">Agenda</h1>

          {/* Navegação da semana */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            {semana.map((d, i) => (
              <button
                key={d.iso}
                onClick={() => setDiaSelecionado(i)}
                className={`
                  flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs font-medium transition-all
                  ${diaSelecionado === i
                    ? "bg-amber-400 text-stone-900"
                    : d.bloqueado
                      ? "bg-stone-800 text-stone-500 line-through"
                      : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                  }
                `}
              >
                <span className="capitalize">{d.label.split(",")[0]}</span>
                <span className="font-bold text-sm">{d.label.split(",")[1]?.trim()}</span>
                {d.agendamentos.length > 0 && !d.bloqueado && (
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full ${diaSelecionado === i ? "bg-stone-900" : "bg-amber-400"}`} />
                )}
              </button>
            ))}
          </div>

          {/* Cards de resumo — empilha em mobile, 3 colunas no desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-stone-800 rounded-xl p-4">
              <p className="text-stone-400 text-xs mb-1">Agendamentos</p>
              <p className="text-white font-bold text-2xl">{ativos.length}</p>
            </div>
            <div className="bg-stone-800 rounded-xl p-4">
              <p className="text-stone-400 text-xs mb-1">Faturamento</p>
              <p className="text-amber-400 font-bold text-2xl">R${faturamento}</p>
            </div>
            <div className="bg-stone-800 rounded-xl p-4 col-span-2 md:col-span-1">
              <p className="text-stone-400 text-xs mb-1">Próximo</p>
              <p className="text-white font-bold text-sm leading-tight">
                {proximo ? `${proximo.horario} · ${proximo.cliente.split(" ")[0]}` : "—"}
              </p>
            </div>
          </div>

          {/* Lista de agendamentos */}
          <div className="bg-stone-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-700 flex items-center justify-between">
              <h2 className="text-white font-semibold">
                {diaSelecionado === 0 ? "Hoje" : semana[diaSelecionado].label}
              </h2>
              <span className="text-stone-400 text-sm">{ativos.length} agendamento(s)</span>
            </div>

            {dia.bloqueado ? (
              <div className="px-5 py-10 text-center">
                <p className="text-stone-400 text-sm">Dia bloqueado</p>
                <p className="text-stone-500 text-xs mt-1 capitalize">{dia.motivoBloqueio}</p>
              </div>
            ) : dia.agendamentos.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-stone-400 text-sm">Nenhum agendamento</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-700">
                {dia.agendamentos.map(ag => (
                  <div key={ag.id} className="px-5 py-4 flex items-center gap-3">
                    <span className="text-amber-400 font-bold text-sm w-12 flex-shrink-0">
                      {ag.horario}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{ag.cliente}</p>
                      <p className="text-stone-400 text-xs truncate">{ag.servicos.join(", ")}</p>
                    </div>
                    <span className={`
                      text-xs font-medium px-2 py-1 rounded-md border flex-shrink-0 bg-zinc-700
                      ${ag.status === "confirmado" ? "border-emerald-500 text-emerald-400" : ""}
                      ${ag.status === "pendente"   ? "border-amber-500 text-amber-400"     : ""}
                      ${ag.status === "cancelado"  ? "border-red-500 text-red-400"         : ""}
                    `}>
                      {ag.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bloquear dia */}
          <div className="bg-stone-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-white font-semibold">Bloquear este dia</h2>

            <div className="flex gap-2">
              {(["falta", "folga", "feriado"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setBloqueioMotivo(m)}
                  className={`
                    flex-1 py-2 rounded-xl text-sm font-medium transition-all
                    ${bloqueioMotivo === m
                      ? "bg-amber-400 text-stone-900"
                      : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                    }
                  `}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={toggleBloqueio}
              className={`
                w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95
                ${dia.bloqueado
                  ? "bg-stone-600 text-stone-300 hover:bg-stone-500"
                  : "bg-red-500 text-white hover:bg-red-400"
                }
              `}
            >
              {dia.bloqueado ? "Desbloquear dia" : "Bloquear dia"}
            </button>
          </div>

        </div>
      </main>
      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-950 border-t border-stone-800 flex">
        {[
          { label: "Agenda", icon: Calendar },
          { label: "Clientes", icon: Users },
          { label: "Serviços", icon: Scissors },
          { label: "Sair", icon: LogOut },
        ].map(item => {
          const Icon = item.icon

          return (
            <button
              key={item.label}
              onClick={() => setNavAtivo(item.label)}
              className={`
                flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-all
                ${navAtivo === item.label ? "text-amber-400" : "text-stone-500"}
              `}
            >
              <Icon size={20} />
              {item.label}
            </button>
          )
        })}
      </nav>         
    </div>
  )
  
}