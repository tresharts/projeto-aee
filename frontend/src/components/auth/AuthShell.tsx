import { BarChart3, BookOpen, LockKeyhole, Pencil, UsersRound } from 'lucide-react'

export function AuthShell({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <main className="min-h-screen bg-[#eaf1fd] p-0 md:p-7 lg:p-10">
      <div className="mx-auto grid min-h-screen max-w-[1440px] overflow-hidden bg-white shadow-xl md:min-h-[calc(100vh-56px)] md:grid-cols-[0.95fr_1.05fr] lg:min-h-[calc(100vh-80px)]">
        <aside className="relative hidden flex-col overflow-hidden bg-gradient-to-br from-[#c7d8f5] via-[#eedbf7] to-[#e8cdf3] md:flex">
          <div className="absolute -left-28 top-[48%] h-80 w-80 rounded-full bg-blue-300/35" />
          <div className="absolute -bottom-28 left-20 h-80 w-80 rounded-full bg-indigo-300/30" />
          <div className="absolute right-[-5rem] top-8 h-72 w-72 rounded-full bg-fuchsia-300/20" />
          <div className="relative flex flex-1 flex-col items-center justify-center px-10 pb-10 pt-8 text-center lg:px-16">
            <img src="/aee-conecta-logo.png" alt="AEE Conecta — Inclusão que conecta" className="mb-8 w-64 max-w-full object-contain lg:w-72" />
            <p className="max-w-md text-2xl font-medium leading-snug text-[#292d80] lg:text-[1.75rem]">
              Juntos por uma educação<br />mais acessível e significativa.
            </p>
            <div className="mt-16 flex h-40 w-full max-w-lg items-end justify-center gap-8 text-[#5e67a0] lg:mt-20">
              <BookOpen className="h-20 w-20 stroke-[1.2]" />
              <Pencil className="mb-2 h-16 w-16 stroke-[1.3]" />
              <BarChart3 className="h-20 w-20 stroke-[1.2]" />
            </div>
          </div>
          <div className="relative grid grid-cols-3 border-t border-white/60 bg-[#d9e6fb]/75 px-3 py-6 text-center text-sm leading-tight text-[#515b91] lg:px-8">
            <div className="flex items-center justify-center gap-2 border-r border-[#aab7da]"><UsersRound className="h-7 w-7 shrink-0" /><span>Atendimento<br />individualizado</span></div>
            <div className="flex items-center justify-center gap-2 border-r border-[#aab7da]"><Pencil className="h-7 w-7 shrink-0" /><span>Planejamento<br />pedagógico</span></div>
            <div className="flex items-center justify-center gap-2"><BarChart3 className="h-7 w-7 shrink-0" /><span>Evolução do<br />aluno</span></div>
          </div>
        </aside>
        <section className={`relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-12 md:min-h-0 md:px-14 lg:px-20 xl:px-24 ${compact ? 'md:py-5 lg:py-6' : ''}`}>
          <div className="w-full max-w-[500px]">
            <div className="mb-8 flex justify-center md:hidden"><img src="/aee-conecta-logo.png" alt="AEE Conecta" className="w-48" /></div>
            {children}
            <div className={`flex items-center justify-center gap-3 text-xs text-[#a5aec2] md:justify-start ${compact ? 'mt-5' : 'mt-14'}`}>
              <LockKeyhole className="h-6 w-6 shrink-0" />
              <span>Seus dados são tratados com cuidado e responsabilidade.</span>
            </div>
          </div>
        </section>
      </div>
      <div className="pointer-events-none fixed -right-10 -top-14 hidden h-40 w-40 rounded-full bg-gradient-to-br from-blue-300/60 to-fuchsia-400/60 blur-[1px] md:block" />
      <div className="pointer-events-none fixed -bottom-16 -left-12 hidden h-40 w-40 rounded-full bg-gradient-to-br from-fuchsia-300/60 to-blue-300/60 md:block" />
    </main>
  )
}
