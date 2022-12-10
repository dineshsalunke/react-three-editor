import {
  GizmoHelper,
  GizmoViewcube,
  GizmoViewport,
  OrbitControls,
  PerspectiveCamera,
  useHelper
} from "@react-three/drei"
import { folder, Leva, levaStore, useControls } from "leva"
import React, { useEffect } from "react"
import * as THREE from "three"
import tunnel from "tunnel-rat"
import { useEditor } from "./useEditor"
import { EntityControl, EntityEditor, entityPanel } from "./EntityEditor"
import { EntityTransformControls } from "./EntityTransformControls"
import { In } from "./components"
import { createPlugin, useInputContext } from "leva/plugin"
import { useFrame, useThree } from "@react-three/fiber"
import { CameraHelper } from "three"
import { eq } from "./eq"
import { editable } from "."

export const SidebarTunnel = tunnel()

export function EditorCamera() {
  const props = useControls("editor", {
    camera: folder({
      enabled: true,
      position: {
        value: [-6.836465353768794, 3.1169378502902387, -2.747260436170274],
        step: 0.1
      },
      fov: { value: 75, min: 1, max: 180 },
      near: { value: 0.1, min: 0.1, max: 100 },
      far: { value: 1000, min: 0.1, max: 10000 }
    })
  })

  const camera = useThree((c) => c.camera)

  const ref = React.useRef()
  useEffect(() => {
    if (!ref.current) {
      ref.current = camera
    }
    // console.log(camera)
  }, [])

  useHelper(ref, CameraHelper)

  const controls = useThree((c) => c.controls)

  useEffect(() => {
    controls?.addEventListener("change", (e) => {
      console.log(e.target.object.position)
      levaStore.setValueAtPath(
        "editor.camera.position",
        e.target.object.position.toArray(),
        false
      )
    })

    // levaStore.useStore.subscribe((s) => s.data["editor.camera.position"], {

    // })
  }, [controls])

  return (
    <>
      {props.enabled && <PerspectiveCamera {...props} makeDefault />}
      {!controls && <OrbitControls onChange={console.log} />}
      <editable.primitive
        name="Camera"
        object={ref.current || camera}
        _source={{}}
      />
      {/* <PerspectiveCamera makeDefault /> */}
    </>
  )
}
export function EditorPanel() {
  return (
    <>
      <In>
        <Leva
          theme={
            {
              // space: {
              //   rowGap: "2px",
              //   md: "10px"
              // },
              // sizes: {
              //   titleBarHeight: "28px"
              // }
            }
          }
        />
      </In>
      {/* <TopLevelTransformControls /> */}
      {/* <TopLevelEntities /> */}
      <SceneGraph />
      <SelectedTransformControls />
      <SelectedEntityControls />
      <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
        <group scale={0.85}>
          <GizmoViewcube />
        </group>
        <group scale={1.75} position={[-30, -30, -30]}>
          <GizmoViewport
            labelColor="white"
            axisHeadScale={0.525}
            hideNegativeAxes
          />
        </group>
      </GizmoHelper>
      {/* <OrbitControls makeDefault /> */}
    </>
  )
}

function TopLevelEntities() {
  const p = useEditor((state) => Object.values(state.elements))
  return (
    <>
      {p.map((e) =>
        e.parentId == null ? <EntityEditor key={e.name} entity={e} /> : null
      )}
    </>
  )
}

function TopLevelTransformControls() {
  const p = useEditor((state) => Object.values(state.elements))
  return (
    <>
      {p.map((e) =>
        e.ref instanceof THREE.Object3D && e.parentId === null ? (
          <EntityTransformControls key={e.id} entity={e} />
        ) : null
      )}
    </>
  )
}

const sceneGraph = createPlugin({
  normalize({ items }, path, data) {
    return { settings: { items } }
  },
  component() {
    const context = useInputContext()
    console.log(context.settings.items)
    return (
      <>
        {Object.values(context.settings.items).map((v) => (
          <EntityControl
            selected={false}
            entity={v.entity}
            collapsed={false}
            setCollapsed={() => {}}
            showChildren={true}
            dirty={false}
            panel={false}
          />
        ))}
      </>
    )
  }
})

function SceneGraph() {
  const p = useEditor((state) => Object.values(state.elements))

  useControls(() => {
    const items = {}
    p.forEach((v) => {
      if (v.parentId == null)
        items[v.name] = {
          entity: v,
          panel: false,
          collapsed: false,
          children: true
        }
    })
    return {
      scene: folder({
        graph: sceneGraph({
          items
        })
      })
    }
  }, [p])
  return null
  // return (
  //   <>
  //     {p.map((e) =>
  //       e.parentId == null ? <EntityTree key={e.name} entity={e} /> : null
  //     )}
  //   </>
  // )
}

function SelectedTransformControls() {
  const p = useEditor((state) => state.selected)
  console.log(p)
  return p && p.ref instanceof THREE.Object3D ? (
    <EntityTransformControls key={p.id} entity={p} />
  ) : null
}

function SelectedEntityControls() {
  const p = useEditor((state) => state.selected)
  console.log(p)

  return p ? (
    <React.Fragment key={p.name}>
      <EntityEditor entity={p} />
      <EntityControls entity={p} />
    </React.Fragment>
  ) : null
}

function EntityControls({ entity }) {
  useControls("entity", {
    [entity.name]: entityPanel({
      entity,
      panel: true,
      collapsed: false,
      children: false
    })
  })
  return null
}
