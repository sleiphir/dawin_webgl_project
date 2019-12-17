import * as THREE from '../node_modules/three/build/three.module.js'
import { OBJLoader } from '../node_modules/three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from '../node_modules/three/examples/jsm/loaders/MTLLoader.js'

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
    vars.camera.position.set(0, 0, 200)

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
    requestAnimationFrame(Scene.animate)
    Scene.render()
  },

  render: () => {
    const vars = Scene.vars

    vars.renderer.render(vars.scene, vars.camera)
  },

  // Adding the meshes
  addMeshes: () => {
    const vars = Scene.vars
    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(80, 64, 64)
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xffdc82,
      shading: THREE.FlatShading
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.castShadow = true
    sphere.receiveShadow = false
    sphere.position.set(0, 0, 0)
    vars.scene.add(sphere)
  },

  // Adding the external objects
  addObjects: () => {
    // Load the car
    Scene.loadOBJ(
      'car',
      '../assets/car.obj',
      '../assets/car_material.mtl',
      0.05,
      new THREE.Vector3(0, 0, 80),
      new THREE.Vector3(Math.PI / 2, 0, 0)
    )
  },

  // Adding the lights
  addLights: () => {
    const vars = Scene.vars

    // hemisphere light
    const lightIntensityHemisphere = 0.7
    const light = new THREE.HemisphereLight(
      0xffffff,
      0xffffff,
      lightIntensityHemisphere
    )
    vars.scene.add(light)

    // directional light (lighting the sphere)
    const directionalLightIntensity = 0.4
    const d = 1000
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      directionalLightIntensity
    )
    directionalLight.position.set(-100, 100, 200)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.left = -d
    directionalLight.shadow.camera.right = d
    directionalLight.shadow.camera.top = d
    directionalLight.shadow.camera.bottom = -d
    directionalLight.shadow.camera.far = 2000
    directionalLight.shadow.mapSize.width = 4096
    directionalLight.shadow.mapSize.height = 4096
    vars.scene.add(directionalLight)
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
  },

  loadOBJ: (name, path, material, scale, position, rotation) => {
    const vars = Scene.vars

    const loader = new OBJLoader()
    if (material !== undefined) {
      new MTLLoader().load(material, materials => {
        loader.setMaterials(materials)
      })
    }
    loader.load(
      path,
      object => {
        object.name = name
        object.scale.set(scale, scale, scale)
        object.position.set(position.x, position.y, position.z)
        object.rotation.set(rotation.x, rotation.y, rotation.z)
        object.castShadow = true
        object.receiveShadow = true
        vars[name] = object
        vars.scene.add(object)
      },
      undefined,
      error => {
        console.error(error)
      }
    )
  }
}

Scene.init()
