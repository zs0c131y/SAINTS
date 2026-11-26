import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

/**
 * shadcn/ui Button, mapped onto the SAINTS button styles (`.btn-*` in styles/main.css):
 * gold primary, navy, ghost and outline-on-dark. Use `asChild` to render a Next.js <Link>.
 */
const buttonVariants = cva("btn", {
  variants: {
    variant: {
      default: "btn-primary",
      navy: "btn-navy",
      ghost: "btn-ghost",
      outline: "btn-outline-light",
    },
    size: {
      default: "",
      lg: "btn-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
