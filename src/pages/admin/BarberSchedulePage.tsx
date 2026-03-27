import { useState } from "react"

// ─── Tipos ────────────────────────────────────────────────
interface DiaAgenda {
  iso: string
  label: string
  bloqueado: boolean
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
    }
  })
}

// ─── Componente principal ──────────────────────────────────
export default function BarberSchedulePage() {
  const [navAtivo, setNavAtivo]             = useState("Agenda")
  const [semana, setSemana]                 = useState<DiaAgenda[]>(gerarSemana)
  const [diaSelecionado, setDiaSelecionado] = useState(0)

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

        </div>
      </main>

    </div>
  )
}