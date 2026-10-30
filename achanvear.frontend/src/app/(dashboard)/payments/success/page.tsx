"use client";
import Link from "next/link";
export default function PaymentSuccessPage() {
  return <div className="mx-auto max-w-md p-8 text-center">
    <h1 className="text-xl font-semibold">Consulta el estado de tu pago</h1>
    <p className="my-4 text-slate-600">El pago se confirma con el proveedor. Revisa el estado actualizado en tu historial de pagos.</p>
    <Link href="/payments" className="underline">Ir a mis pagos</Link>
  </div>;
}
