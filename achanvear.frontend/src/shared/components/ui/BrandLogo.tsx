"use client";

// src/shared/components/ui/BrandLogo.tsx
import Link from "next/link";
import Image from "next/image";

type BrandLogoSize = "sm" | "md" | "lg";

interface BrandLogoProps {
  /** Link target. Pass `null` to render without a surrounding Link. */
  href?: string | null;
  /** Size preset controlling the logo mark and text dimensions. */
  size?: BrandLogoSize;
  /** Show the "Achanvear" wordmark next to the logo mark. */
  showText?: boolean;
  /** Text color for the wordmark (also drives dark/light variants). */
  textClassName?: string;
  /** Extra classes for the wrapping element. */
  className?: string;
}

const SIZE_MAP: Record<
  BrandLogoSize,
  { mark: string; text: string; gap: string }
> = {
  sm: { mark: "h-8 w-8", text: "text-base", gap: "gap-2" },
  md: { mark: "h-10 w-10", text: "text-xl", gap: "gap-2.5" },
  lg: { mark: "h-12 w-12", text: "text-2xl", gap: "gap-3" },
};

/**
 * Marca de Achanvear: usa el logo oficial en `public/logo/logo-512.png`
 * junto con el wordmark opcional. Reemplaza la antigua caja con la letra "A".
 */
export function BrandLogo({
  href = "/",
  size = "md",
  showText = true,
  textClassName = "text-[#1B3A6B]",
  className = "",
}: BrandLogoProps) {
  const dims = SIZE_MAP[size];

  const content = (
    <>
      <span className="sr-only">Achanvear</span>
      <span
        className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl ${dims.mark}`}
      >
        <Image
          src="/logo/logo-512.png"
          alt="Achanvear"
          fill
          sizes="64px"
          className="object-contain"
          priority
        />
      </span>
      {showText && (
        <span className={`font-bold ${dims.text} ${textClassName}`}>
          Achanvear
        </span>
      )}
    </>
  );

  const baseClassName = `flex items-center ${dims.gap} ${className}`;

  if (href === null) {
    return <span className={baseClassName}>{content}</span>;
  }

  return (
    <Link href={href} className={baseClassName}>
      {content}
    </Link>
  );
}
