import { useState } from "react"

// ─── Tipos ────────────────────────────────────────────────
interface Servico {
  id: string
  nome: string
  preco: number
  descricao: string
}

interface Barbeiro {
  id: string
  nome: string
  especialidade: string
  avatar: string
}

interface FormData {
  nome: string
  telefone: string
  servicos: string[]
  barbeiro: string
  data: string
  horario: string
}

interface DiaMes {
  iso: string
  numero: number
  disponivel: boolean
  passado: boolean
}

// ─── Dados estáticos ──────────────────────────────────────
// TODO: substituir por chamadas à API quando o backend estiver pronto
const SERVICOS: Servico[] = [
  { id: "corte",       nome: "Corte",        preco: 35, descricao: "Corte masculino com finalização" },
  { id: "barba",       nome: "Barba",         preco: 15, descricao: "Aparar e modelar a barba" },
  { id: "combo",       nome: "Corte + Barba", preco: 45, descricao: "Corte completo com barba" },
  { id: "sobrancelha", nome: "Sobrancelha",   preco: 10, descricao: "Design de sobrancelha" },
  { id: "pigmentacao", nome: "Pigmentação",   preco: 15, descricao: "Pigmentação capilar" },
  { id: "reflexo",     nome: "Reflexo",       preco: 10, descricao: "Reflexo e tingimento" },
]

const BARBEIROS: Barbeiro[] = [
  { id: "david",   nome: "David",   especialidade: "Cortes modernos", avatar: "DA" },
  { id: "henry",   nome: "Henry",   especialidade: "Barba e bigode",  avatar: "HE" },
  { id: "matheus", nome: "Matheus", especialidade: "Pigmentação",     avatar: "MA" },
]

// ─── Helpers ──────────────────────────────────────────────

/**
 * Simula horários já ocupados usando a data como seed determinística.
 * TODO: remover quando o backend expor GET /slots?data=&barbeiro=
 */
function gerarHorariosIndisponiveis(data: string, horarios: string[]): string[] {
  const seed = data.split("-").join("")
  let random = Number(seed)
  const indisponiveis: string[] = []
  const quantidade = (random % 4) + 3

  for (let i = 0; i < quantidade; i++) {
    random = (random * 9301 + 49297) % 233280
    const h = horarios[random % horarios.length]
    if (!indisponiveis.includes(h)) indisponiveis.push(h)
  }

  return indisponiveis
}

/**
 * Retorna todos os dias do mês com metadados de disponibilidade.
 * Janela aberta: hoje até +10 dias (regra de negócio da barbearia).
 * Células `null` preenchem o início da grade para alinhar o dia da semana correto.
 */
function getDiasDoMes(ano: number, mes: number): (DiaMes | null)[] {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const limiteMax = new Date(hoje)
  limiteMax.setDate(hoje.getDate() + 10)

  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia   = new Date(ano, mes + 1, 0)
  const dias: (DiaMes | null)[] = []

  for (let i = 0; i < primeiroDia.getDay(); i++) dias.push(null)

  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    const data = new Date(ano, mes, d)
    dias.push({
      iso: data.toISOString().split("T")[0],
      numero: d,
      disponivel: data >= hoje && data <= limiteMax,
      passado: data < hoje,
    })
  }

  return dias
}

/** Slots de 30 em 30 minutos das 08:00 às 18:30. */
function getHorarios(): string[] {
  const slots: string[] = []
  for (let h = 8; h < 19; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`)
    slots.push(`${String(h).padStart(2, "0")}:30`)
  }
  return slots
}

// ─── Componente principal ──────────────────────────────────
export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    telefone: "",
    servicos: [],
    barbeiro: "",
    data: "",
    horario: "",
  })

  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(hoje.getMonth())
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear())

  const dias      = getDiasDoMes(anoAtual, mesAtual)
  const horarios  = getHorarios()
  const hojeIso   = hoje.toISOString().split("T")[0]
  const nomeMes   = new Date(anoAtual, mesAtual).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  const horariosIndisponiveis = formData.data
    ? gerarHorariosIndisponiveis(formData.data, horarios)
    : []

  const total = formData.servicos.reduce((acc, id) => {
    return acc + (SERVICOS.find(s => s.id === id)?.preco ?? 0)
  }, 0)

  // ── Handlers ────────────────────────────────────────────

  const toggleServico = (id: string) => {
    const jatem = formData.servicos.includes(id)
    setFormData({
      ...formData,
      servicos: jatem
        ? formData.servicos.filter(s => s !== id)
        : [...formData.servicos, id],
    })
  }

  /** Aplica máscara (11) 99999-9999 em tempo real. */
  const handleTelefone = (valor: string) => {
    const d = valor.replace(/\D/g, "").slice(0, 11)
    let masked = d
    if (d.length > 2) masked = `(${d.slice(0,2)}) ${d.slice(2)}`
    if (d.length > 7) masked = `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
    setFormData({ ...formData, telefone: masked })
  }

  const mesAnterior = () => {
    if (mesAtual === 0) { setMesAtual(11); setAnoAtual(anoAtual - 1) }
    else setMesAtual(mesAtual - 1)
  }

  const proximoMes = () => {
    if (mesAtual === 11) { setMesAtual(0); setAnoAtual(anoAtual + 1) }
    else setMesAtual(mesAtual + 1)
  }

  const podeAvancar = () => {
    if (step === 1) return formData.nome.trim() !== "" && formData.telefone.length >= 14
    if (step === 2) return formData.servicos.length > 0
    if (step === 3) return formData.barbeiro !== ""
    if (step === 4) return formData.data !== "" && formData.horario !== ""
    return true
  }

  // ── Sub-componentes ──────────────────────────────────────

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1,2,3,4,5].map(n => (
        <div key={n} className="flex items-center gap-2">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
            transition-all duration-300
            ${n < step   ? "bg-amber-500 text-stone-900" : ""}
            ${n === step ? "bg-stone-900 text-amber-400 ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-50" : ""}
            ${n > step   ? "bg-stone-200 text-stone-400" : ""}
          `}>
            {n < step ? "✓" : n}
          </div>
          {n < 5 && (
            <div className={`w-8 h-0.5 transition-all duration-300 ${n < step ? "bg-amber-500" : "bg-stone-200"}`} />
          )}
        </div>
      ))}
    </div>
  )

  const NavButtons = ({ labelNext = "Próximo" }: { labelNext?: string }) => (
    <div className="flex gap-3 mt-8">
      {step > 1 && (
        <button
          onClick={() => setStep(step - 1)}
          className="flex-1 py-3 px-6 rounded-xl border border-stone-300 text-stone-600 font-medium hover:bg-stone-100 transition-colors"
        >
          ← Voltar
        </button>
      )}
      <button
        onClick={() => step < 5 ? setStep(step + 1) : undefined}
        disabled={!podeAvancar()}
        className={`
          flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200
          ${podeAvancar()
            ? "bg-stone-900 text-amber-400 hover:bg-stone-800 active:scale-95"
            : "bg-stone-200 text-stone-400 cursor-not-allowed"
          }
        `}
      >
        {labelNext} →
      </button>
    </div>
  )

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-stone-50 rounded-2xl shadow-2xl overflow-hidden">

        <div className="bg-stone-900 px-8 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-stone-900 font-bold text-sm">
            ✂
          </div>
          <span className="text-white font-semibold tracking-wide">Barber-SaaS</span>
          <span className="ml-auto text-stone-400 text-sm">Agendamento online</span>
        </div>

        <div className="px-8 py-8">
          <StepIndicator />

          {/* Etapa 1 — Dados do cliente */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-1">Olá! 👋</h2>
              <p className="text-stone-500 mb-6">Digite seus dados para começar</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Seu nome</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: João Silva"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={e => handleTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-stone-900 placeholder-stone-400 transition-all"
                  />
                </div>
              </div>

              <NavButtons />
            </div>
          )}

          {/* Etapa 2 — Seleção de serviços (múltipla escolha) */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-1">Serviços</h2>
              <p className="text-stone-500 mb-6">Selecione um ou mais serviços</p>

              <div className="grid grid-cols-2 gap-3">
                {SERVICOS.map(servico => {
                  const selecionado = formData.servicos.includes(servico.id)
                  return (
                    <button
                      key={servico.id}
                      onClick={() => toggleServico(servico.id)}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-95
                        ${selecionado ? "border-amber-400 bg-amber-50" : "border-stone-200 hover:border-stone-300 bg-white"}
                      `}
                    >
                      <p className={`font-semibold text-sm ${selecionado ? "text-stone-900" : "text-stone-700"}`}>
                        {servico.nome}
                      </p>
                      <p className={`font-bold mt-2 ${selecionado ? "text-amber-600" : "text-stone-900"}`}>
                        R$ {servico.preco}
                      </p>
                    </button>
                  )
                })}
              </div>

              {formData.servicos.length > 0 && (
                <div className="mt-4 p-4 bg-stone-900 rounded-xl flex justify-between items-center">
                  <span className="text-stone-400 text-sm">{formData.servicos.length} serviço(s)</span>
                  <span className="text-amber-400 font-bold text-lg">R$ {total}</span>
                </div>
              )}

              <NavButtons />
            </div>
          )}

          {/* Etapa 3 — Escolha do barbeiro */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-1">Barbeiro</h2>
              <p className="text-stone-500 mb-6">Escolha seu profissional</p>

              <div className="space-y-3">
                {BARBEIROS.map(barbeiro => {
                  const selecionado = formData.barbeiro === barbeiro.id
                  return (
                    <button
                      key={barbeiro.id}
                      onClick={() => setFormData({ ...formData, barbeiro: barbeiro.id })}
                      className={`
                        w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-200
                        ${selecionado ? "border-amber-400 bg-amber-50" : "border-stone-200 hover:border-stone-300 bg-white"}
                      `}
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                        ${selecionado ? "bg-stone-900 text-amber-400" : "bg-stone-100 text-stone-600"}
                      `}>
                        {barbeiro.avatar}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-stone-900">{barbeiro.nome}</p>
                        <p className="text-stone-400 text-sm">{barbeiro.especialidade}</p>
                      </div>
                      {selecionado && <span className="ml-auto text-amber-500 text-xl">✓</span>}
                    </button>
                  )
                })}
              </div>

              <NavButtons />
            </div>
          )}

          {/* Etapa 4 — Calendário + horários */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-1">Data e horário</h2>
              <p className="text-stone-500 mb-5">Escolha quando prefere ser atendido</p>

              <div className="flex items-center justify-between mb-3">
                <button onClick={mesAnterior} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-200 text-stone-600 transition-colors text-lg">‹</button>
                <span className="text-sm font-semibold text-stone-700 capitalize">{nomeMes}</span>
                <button onClick={proximoMes}  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-200 text-stone-600 transition-colors text-lg">›</button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {["D","S","T","Q","Q","S","S"].map((d, i) => (
                  <div key={i} className="text-center text-xs font-medium text-stone-400 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 mb-6">
                {dias.map((dia, i) => {
                  if (!dia) return <div key={`empty-${i}`} />

                  const selecionado = formData.data === dia.iso
                  const ehHoje = dia.iso === hojeIso

                  return (
                    <button
                      key={dia.iso}
                      disabled={!dia.disponivel}
                      onClick={() => dia.disponivel && setFormData({ ...formData, data: dia.iso, horario: "" })}
                      className={`
                        aspect-square rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center
                        ${selecionado                          ? "bg-stone-900 text-amber-400 font-bold" : ""}
                        ${ehHoje && !selecionado              ? "ring-2 ring-amber-400 text-stone-900 font-bold" : ""}
                        ${dia.disponivel && !selecionado      ? "hover:bg-amber-50 text-stone-700 cursor-pointer" : ""}
                        ${dia.passado                         ? "text-stone-300 cursor-not-allowed" : ""}
                        ${!dia.disponivel && !dia.passado     ? "text-stone-300 cursor-not-allowed" : ""}
                      `}
                    >
                      {dia.numero}
                    </button>
                  )
                })}
              </div>

              {/* Horários — renderiza só após o usuário escolher uma data */}
              {formData.data && (
                <>
                  <p className="text-sm font-medium text-stone-700 mb-2">Horário disponível</p>
                  <div className="grid grid-cols-4 gap-2">
                    {horarios.map(h => {
                      const indisponivel = horariosIndisponiveis.includes(h)
                      const selecionado  = formData.horario === h
                      return (
                        <button
                          key={h}
                          disabled={indisponivel}
                          onClick={() => !indisponivel && setFormData({ ...formData, horario: h })}
                          className={`
                            py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${indisponivel              ? "bg-stone-100 text-stone-300 cursor-not-allowed line-through" : ""}
                            ${selecionado              ? "bg-stone-900 text-amber-400 font-bold" : ""}
                            ${!indisponivel && !selecionado ? "bg-white border border-stone-200 text-stone-700 hover:border-amber-400" : ""}
                          `}
                        >
                          {h}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              <NavButtons />
            </div>
          )}

          {/* Etapa 5 — Resumo e confirmação */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-1">Confirmar</h2>
              <p className="text-stone-500 mb-6">Revise os detalhes do seu agendamento</p>

              <div className="bg-stone-900 rounded-2xl p-6 space-y-4 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-stone-400">Cliente</span>
                  <div className="text-right">
                    <p className="text-white font-medium">{formData.nome}</p>
                    <p className="text-stone-400">{formData.telefone}</p>
                  </div>
                </div>

                <div className="border-t border-stone-800" />

                <div className="flex justify-between items-start">
                  <span className="text-stone-400">Serviços</span>
                  <div className="text-right">
                    {formData.servicos.map(id => {
                      const s = SERVICOS.find(sv => sv.id === id)
                      return <p key={id} className="text-white">{s?.nome}</p>
                    })}
                  </div>
                </div>

                <div className="border-t border-stone-800" />

                <div className="flex justify-between">
                  <span className="text-stone-400">Barbeiro</span>
                  <span className="text-white">{BARBEIROS.find(b => b.id === formData.barbeiro)?.nome}</span>
                </div>

                <div className="border-t border-stone-800" />

                <div className="flex justify-between">
                  <span className="text-stone-400">Data</span>
                  <span className="text-white">
                    {formData.data
                      ? new Date(formData.data + "T12:00:00").toLocaleDateString("pt-BR", {
                          weekday: "long", day: "2-digit", month: "long"
                        })
                      : "—"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-400">Horário</span>
                  <span className="text-white">{formData.horario}</span>
                </div>

                <div className="border-t border-stone-700 pt-3 flex justify-between items-center">
                  <span className="text-stone-300 font-medium">Total</span>
                  <span className="text-amber-400 font-bold text-xl">R$ {total}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 px-6 rounded-xl border border-stone-300 text-stone-600 font-medium hover:bg-stone-100 transition-colors"
                >
                  ← Voltar
                </button>
                {/* TODO: chamar POST /agendamentos e redirecionar para página de sucesso */}
                <button
                  onClick={() => alert("Agendamento confirmado! (conectar ao backend)")}
                  className="flex-1 py-3 px-6 rounded-xl bg-amber-400 text-stone-900 font-bold hover:bg-amber-300 active:scale-95 transition-all duration-200"
                >
                  Confirmar ✓
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}