import { useState } from "react"

// ─── Tipos ────────────────────────────────────────────────
interface DiaAgenda {
  iso: string
  label: string
  bloqueado: boolean
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

// TODO: substituir por GET /barbeiro/:id/agenda quando backend estiver pronto
const AGENDAMENTOS_MOCK: Agendamento[] = [
  { id: "1", cliente: "João Silva",   telefone: "(81) 99999-1111", servicos: ["Corte"],        horario: "08:00", status: "confirmado" },
  { id: "2", cliente: "Pedro Souza",  telefone: "(81) 99999-2222", servicos: ["Barba"],         horario: "09:00", status: "confirmado" },
  { id: "3", cliente: "Lucas Lima",   telefone: "(81) 99999-3333", servicos: ["Corte + Barba"], horario: "10:00", status: "pendente"   },
  { id: "4", cliente: "Marcos Costa", telefone: "(81) 99999-4444", servicos: ["Corte"],        horario: "11:00", status: "confirmado" },
  { id: "5", cliente: "Bruno Alves",  telefone: "(81) 99999-5555", servicos: ["Pigmentação"],   horario: "14:00", status: "cancelado"  },
  { id: "6", cliente: "Rafael Dias",  telefone: "(81) 99999-6666", servicos: ["Corte"],        horario: "15:30", status: "confirmado" },
]

const PRECOS: Record<string, number> = {
  "Corte": 35, "Barba": 15, "Corte + Barba": 45,
  "Sobrancelha": 10, "Pigmentação": 15, "Reflexo": 10,
}

// ─── Dados estáticos ──────────────────────────────────────
// TODO: substituir por dados do barbeiro logado
const BARBEIRO = { nome: "David", especialidade: "Cortes modernos", avatar: "DA" }

const NAV_ITEMS = [
  { label: "Agenda"   },
  { label: "Clientes" },
  { label: "Serviços" },
  { label: "Sair"     },
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
      agendamentos: i === 0 ? AGENDAMENTOS_MOCK : [],
    }
  })
}

// ─── Componente principal ──────────────────────────────────
export default function BarberSchedulePage() {
  const [navAtivo, setNavAtivo]             = useState("Agenda")
  const [semana, setSemana]                 = useState<DiaAgenda[]>(gerarSemana)
  const [diaSelecionado, setDiaSelecionado] = useState(0)
  const dia         = semana[diaSelecionado]
  const ativos      = dia.agendamentos.filter(a => a.status !== "cancelado")
  const proximo     = dia.agendamentos.find(a => a.status === "confirmado")
  const faturamento = ativos.reduce((acc, a) =>
    acc + a.servicos.reduce((s, sv) => s + (PRECOS[sv] ?? 0), 0), 0
  )

  return (
    <div className="min-h-screen bg-stone-900 flex">

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
          {NAV_ITEMS.map(item => (
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
              {item.label}
            </button>
          ))}
        </nav>

        <p className="text-stone-600 text-xs text-center">v0.1.0</p>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Header mobile */}
          <div className="flex md:hidden items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center text-stone-900 font-bold text-sm">✂</div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Minha Agenda</h1>
              <p className="text-stone-400 text-sm">BarberPro</p>
            </div>
          </div>

          <h1 className="hidden md:block text-white font-bold text-xl">Agenda</h1>

          {/* Navegação da semana */}
          <div className="flex gap-2 overflow-x-auto pb-1">
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
              </button>
            ))}
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-stone-800 rounded-xl p-4">
              <p className="text-stone-400 text-xs mb-1">Agendamentos</p>
              <p className="text-white font-bold text-2xl">{ativos.length}</p>
            </div>
            <div className="bg-stone-800 rounded-xl p-4">
              <p className="text-stone-400 text-xs mb-1">Faturamento</p>
              <p className="text-amber-400 font-bold text-2xl">R${faturamento}</p>
            </div>
            <div className="bg-stone-800 rounded-xl p-4">
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

            {dia.agendamentos.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-stone-400 text-sm">Nenhum agendamento</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-700">
                {dia.agendamentos.map(ag => (
                  <div key={ag.id} className="px-5 py-4 flex items-center gap-4">
                    <span className="text-amber-400 font-bold text-sm w-12 flex-shrink-0">
                      {ag.horario}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{ag.cliente}</p>
                      <p className="text-stone-400 text-xs">{ag.servicos.join(", ")}</p>
                    </div>
                    <span className={`
                      text-xs font-medium px-3 py-1 rounded-md border flex-shrink-0 bg-zinc-700
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

        </div>
      </main>

    </div>
  )
}