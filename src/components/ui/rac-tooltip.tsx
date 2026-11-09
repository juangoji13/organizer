'use client';

import React from 'react';
import {
  TooltipTrigger,
  Tooltip as RACTooltip,
  type TooltipProps as RACTooltipProps,
} from '@animate-ui/react/primitives/react-aria';

interface AppTooltipProps extends Omit<RACTooltipProps, 'children'> {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function AppTooltip({
  content,
  children,
  placement = 'top',
  delay = 250,
  ...props
}: AppTooltipProps) {
  return (
    <TooltipTrigger delay={delay}>
      {children}
      <RACTooltip
        placement={placement}
        offset={6}
        className="z-50 px-2.5 py-1 text-[11px] font-medium text-white dark:text-zinc-900 bg-zinc-900 dark:bg-white rounded-md shadow-md border border-zinc-800 dark:border-zinc-200 pointer-events-none select-none max-w-xs transition-opacity duration-150"
        {...props}
      >
        {content}
      </RACTooltip>
    </TooltipTrigger>
  );
}
