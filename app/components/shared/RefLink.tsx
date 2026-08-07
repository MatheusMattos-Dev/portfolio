import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { HTMLAttributeAnchorTarget } from "react";
import { site } from "@/lib/site";

export default function RefLink({
  href,
  children,
  className,
  target = "_blank",
}: {
  href: Url;
  children?: React.ReactNode;
  className?: string;
  target?: HTMLAttributeAnchorTarget;
}) {
  return (
    <Link
      href={href + `?ref=${site.shortName}`}
      rel="noopener"
      target={target}
      className={className}
    >
      {children}
    </Link>
  );
}
