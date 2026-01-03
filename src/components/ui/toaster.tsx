import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <>
      {/* ARIA Live Region für Screenreader */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="toast-announcements"
      />
      <ToastProvider>
        {toasts.map(function ({ id, title, description, action, ...props }) {
          return (
            <Toast 
              key={id} 
              {...props}
              aria-live={props.variant === "destructive" ? "assertive" : "polite"}
              aria-atomic="true"
            >
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose aria-label="Benachrichtigung schließen" />
            </Toast>
          )
        })}
        <ToastViewport />
      </ToastProvider>
    </>
  )
}
