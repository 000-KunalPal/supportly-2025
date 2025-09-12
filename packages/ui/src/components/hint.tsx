"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

interface HintProps {
  children: React.ReactNode;
  text: string;
  side?: "left" | "right" | "top" | "bottom";
  align?: "start" | "center" | "end";
}

import React from "react";

export const Hint = ({
  children,
  text,
  align = "center",
  side = "top",
}: HintProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
