'use client';

import React, { useState } from 'react';
import {
  DialogTrigger,
  Button,
  Popover,
  Dialog,
  OverlayArrow,
} from '@animate-ui/react/primitives/react-aria';
import { motion } from 'motion/react';
import { KeyRound, Copy, Check, Eye, EyeOff, ShieldCheck, ExternalLink } from 'lucide-react';
import { useWorkspace } from '@/context/workspace-context';

interface CredentialsPopoverProps {
  platform: string;
  platformUser: string;
  platformPass: string;
}

export function CredentialsPopover({
  platform,
  platformUser,
  platformPass,
}: CredentialsPopoverProps) {
  const { showToast } = useWorkspace();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'user' | 'pass' | null>(null);

  const copyToClipboard = async (text: string, type: 'user' | 'pass', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedField(type);
      showToast({
        message: type === 'user' ? 'Usuario copiado' : 'Contraseña copiada',
        type: 'success',
      });
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      showToast({
        message: 'No se pudo copiar al portapapeles',
        type: 'info',
      });
    }
  };

  return (
    <DialogTrigger>
      {/* Accessible RAC Button Trigger with Tactile Micro-Press */}
      <Button
        className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60 border border-zinc-200/60 dark:border-white/10 text-[11px] text-zinc-700 dark:text-zinc-300 transition-all outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 cursor-pointer select-none"
        aria-label={`Ver credenciales de acceso para ${platform}`}
      >
        <KeyRound className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors shrink-0" />
        <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-900 dark:text-zinc-100 shrink-0">
          {platform}
        </span>
        <span className="text-zinc-300 dark:text-zinc-600">•</span>
        <span className="font-mono text-zinc-500 dark:text-zinc-400 truncate max-w-[110px] sm:max-w-[150px]">
          {platformUser}
        </span>
        <span className="text-[10px] font-semibold text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 ml-0.5">
          Ver ▾
        </span>
      </Button>

      {/* RAC Popover with Fluid Spring Entrance & Native WAI-ARIA Focus Trapping */}
      <Popover
        offset={8}
        className="z-50 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200/90 dark:border-white/15 shadow-xl shadow-zinc-950/10 dark:shadow-black/50 p-4 text-xs outline-none backdrop-blur-md"
      >
        <OverlayArrow className="fill-white dark:fill-[#151518] stroke-zinc-200 dark:stroke-white/10">
          <svg width={12} height={12} viewBox="0 0 12 12">
            <path d="M0 0 L6 6 L12 0" />
          </svg>
        </OverlayArrow>

        <Dialog className="outline-none">
          {({ close }) => (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-950 dark:text-zinc-100 text-xs">
                      {platform}
                    </h4>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      Credenciales de acceso
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Seguro</span>
                </div>
              </div>

              {/* Credential Rows */}
              <div className="space-y-2.5">
                {/* Username */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Usuario / Correo
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-white/10">
                    <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100 select-all truncate">
                      {platformUser}
                    </span>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => copyToClipboard(platformUser, 'user', e)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-white/10 shadow-2xs hover:bg-zinc-100 transition-all shrink-0 cursor-pointer"
                      title="Copiar usuario"
                    >
                      {copiedField === 'user' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Listo</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-400" />
                          <span>Copiar</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Contraseña
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-white/10">
                    <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100 select-all truncate">
                      {showPassword ? platformPass : '••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </motion.button>

                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => copyToClipboard(platformPass, 'pass', e)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-white/10 shadow-2xs hover:bg-zinc-100 transition-all cursor-pointer"
                        title="Copiar contraseña"
                      >
                        {copiedField === 'pass' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Listo</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-zinc-400" />
                            <span>Copiar</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer hint */}
              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-white/10 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
                <span>Presiona ESC para cerrar</span>
                <button
                  type="button"
                  onClick={close}
                  className="font-medium text-zinc-700 dark:text-zinc-300 hover:underline cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
