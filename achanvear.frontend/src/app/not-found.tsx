import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[calc(100vh-76px)] place-items-center px-4 py-20 text-center">
      <div className="max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-900/5">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Pagina no encontrada</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Lo sentimos, no existe esta ruta.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Regresa al inicio para continuar con los procesos de login, registro o recuperacion.
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
