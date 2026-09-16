"use client";

import { Button } from "@/components/ui/button";

type Props = {
  href: string;
  projectId: string;
  type: "purchase" | "customization";
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
};

export function WhatsAppTrackButton({
  href,
  projectId,
  type,
  children,
  className,
  variant = "default",
}: Props) {
  const handleClick = () => {
    fetch("/api/analytics/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, type }),
    }).catch(() => {});
  };

  return (
    <Button variant={variant} className={className} asChild>
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        {children}
      </a>
    </Button>
  );
}
