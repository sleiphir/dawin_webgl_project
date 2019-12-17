import * as THREE from '../node_modules/three/build/three.module.js'
import { OBJLoader } from '../node_modules/three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from '../node_modules/three/examples/jsm/loaders/MTLLoader.js'

const Scene = {
  vars: {
    scene: null,
    camera: null,
    renderer: null,
    keydowns: [] // List of arrow keys currently being pressed
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
    if (vars.car !== undefined && vars.keydowns.length > 0) {
      Scene.moveCar()
    }

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
      0.04,
      new THREE.Vector3(0, 0, 80),
      new THREE.Vector3(Math.PI / 2, Math.PI, 0)
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

  moveCar: () => {
    const vars = Scene.vars

    let speed = 0.0
    let angle = 0.0
    // left arrow pressed && right arrow not pressed
    if (vars.keydowns.indexOf(37) > -1 && vars.keydowns.indexOf(39) === -1) {
      angle = Math.PI / 60
    }
    // up arrow pressed && down arrow not pressed
    if (vars.keydowns.indexOf(38) > -1 && vars.keydowns.indexOf(40) === -1) {
      speed = 1
    }
    // right arrow pressed && left arrow not pressed
    if (vars.keydowns.indexOf(39) > -1 && vars.keydowns.indexOf(37) === -1) {
      angle = -Math.PI / 60
    }
    // down arrow pressed && up arrow not pressed
    if (vars.keydowns.indexOf(40) > -1 && vars.keydowns.indexOf(38) === -1) {
      speed = -1
    }
    // if the car has no speed, it can't rotate
    if (speed === 0.0) {
      angle = 0.0
    }

    vars.car.rotation.y += angle
    vars.car.translateZ(speed)
  },

  // Adding the EventListeners
  addEventListeners: () => {
    window.addEventListener('resize', Scene.events.onWindowResize, false)
    window.addEventListener('keydown', Scene.events.onKeyDown, false)
    window.addEventListener('keyup', Scene.events.onKeyUp, false)
  },

  // List of all the events
  events: {
    onWindowResize: () => {
      const vars = Scene.vars

      vars.camera.aspect = window.innerWidth / window.innerHeight
      vars.camera.updateProjectionMatrix()
      vars.renderer.setSize(window.innerWidth, window.innerHeight)
    },

    onKeyDown: event => {
      const vars = Scene.vars
      /** List of arrow key codes
       * Left:  37
       * Up:    38
       * Right: 39
       * Down:  40
       */
      // The key being pressed is an arrow
      if ([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        if (vars.keydowns.indexOf(event.keyCode) === -1) {
          vars.keydowns.push(event.keyCode)
        }
      }
    },

    onKeyUp: () => {
      const vars = Scene.vars
      // The key being pressed is an arrow
      if ([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        vars.keydowns = vars.keydowns.filter(value => {
          return value !== event.keyCode
        })
      }
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
