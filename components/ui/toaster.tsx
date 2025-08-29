"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAction,
} from "@/components/ui/toast"
import { CircleCheckBig, CircleX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, actions, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-center gap-3">
              {variant !== "destructive" && (
                <CircleCheckBig className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              )}
              {variant === "destructive" && (
                <CircleX className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            {actions && actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {actions.map((actionItem, index) => (
                  <Button
                    key={index}
                    variant={actionItem.variant || "default"}
                    size="sm"
                    onClick={actionItem.onClick}
                    className="text-xs"
                  >
                    {actionItem.label}
                  </Button>
                ))}
              </div>
            )}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
