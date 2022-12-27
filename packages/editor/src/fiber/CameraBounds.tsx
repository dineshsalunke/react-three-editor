import { Bounds, useBounds } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { ReactNode } from "react"
import { useEditor } from "../editable"
import { ThreeEditor } from "./ThreeEditor"

export function CameraBounds({ children }: { children: ReactNode }) {
  return (
    <Bounds margin={2}>
      <AssignBounds />
      {children}
    </Bounds>
  )
}
function AssignBounds() {
  const editor = useEditor<ThreeEditor>()
  const size = useThree((s) => s.size)
  const raycaster = useThree((s) => s.raycaster)
  const scene = useThree((s) => s.scene)
  const bounds = useBounds()
  editor.canvasSize = size
  editor.raycaster = raycaster
  editor.bounds = bounds
  editor.scene = scene

  return null
}
