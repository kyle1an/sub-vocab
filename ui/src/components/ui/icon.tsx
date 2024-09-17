import { Slot } from '@radix-ui/react-slot'

export interface SlotProps extends React.AllHTMLAttributes<SVGSVGElement> {
  children?: React.ReactNode
}

export const SVGSlot = Slot as React.ForwardRefExoticComponent<SlotProps & React.RefAttributes<SVGSVGElement>>

export interface SVGProps extends
  React.SVGAttributes<SVGSVGElement>,
  React.RefAttributes<SVGSVGElement> {
}
