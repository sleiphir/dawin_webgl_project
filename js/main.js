import * as THREE from '../node_modules/three/build/three.module.js'

const Scene = {
  vars: {
    scene: null,
    camera: null,
    renderer: null
  },

  init: () => {
    const vars = Scene.vars

    vars.scene = new THREE.Scene()
    vars.scene.background = new THREE.Color(0x72bce1)

    vars.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    vars.renderer = new THREE.WebGLRenderer({
      antialias: true
    })
    vars.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(vars.renderer.domElement)

    Scene.addMeshes()
    Scene.addObjects()
    Scene.addLights()
    Scene.addEventListeners()

    Scene.animate()
  },

  animate: () => {
    const vars = Scene.vars

    requestAnimationFrame(Scene.animate)
    vars.renderer.render(vars.scene, vars.camera)
  },

  render: () => {
    const vars = Scene.vars

    vars.renderer.render(vars.scene, vars.camera)
    vars.stats.update()
  },

  // Adding the meshes
  addMeshes: () => {},

  // Adding the external objects
  addObjects: () => {},

  // Adding the lights
  addLights: () => {
    const vars = Scene.vars

    const lightIntensityHemisphere = 0.7
    const light = new THREE.HemisphereLight(
      0xffffff,
      0x444444,
      lightIntensityHemisphere
    )
    vars.scene.add(light)
  },

  // Adding the EventListeners
  addEventListeners: () => {
    window.addEventListener('resize', Scene.events.onWindowResize, false)
  },

  // List of all the events
  events: {
    onWindowResize: () => {
      const vars = Scene.vars

      vars.camera.aspect = window.innerWidth / window.innerHeight
      vars.camera.updateProjectionMatrix()
      vars.renderer.setSize(window.innerWidth, window.innerHeight)
    }
  }
}

Scene.init()
