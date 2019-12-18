import * as THREE from '../node_modules/three/build/three.module.js'
import { OBJLoader } from '../node_modules/three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from '../node_modules/three/examples/jsm/loaders/MTLLoader.js'

const Scene = {
  vars: {
    scene: null,
    camera: null,
    renderer: null,
    keydowns: [], // List of arrow keys currently being pressed
    cameraLocked: false
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
    vars.scene.add(vars.camera)

    vars.renderer = new THREE.WebGLRenderer({
      antialias: true
    })
    vars.renderer.shadowMap.enabled = true
    vars.renderer.shadowMap.type = THREE.PCFSoftShadowMap // Softer edges for the shadows
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
    if (vars.car !== undefined) {
      if (vars.keydowns.length > 0) {
        Scene.moveCar()
      }

      if (vars.cameraLocked) {
        vars.camera.position.copy(
          vars.car.localToWorld(new THREE.Vector3(10, 10, 200))
        )
        vars.camera.lookAt(vars.car.position)
        vars.camera.rotation.z = vars.car.rotation.z
      } else {
        vars.camera.position.set(0, 0, 200)
        vars.camera.rotation.set(0, 0, 0)
      }
    }
    if (vars.ufo !== undefined) {
      Scene.moveUFO()
    }

    vars.renderer.render(vars.scene, vars.camera)
  },

  // Adding the meshes
  addMeshes: () => {
    const vars = Scene.vars
    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(95, 64, 64)
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xededed,
      flatShading: true
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.radius = 95
    sphere.name = 'sphere'
    sphere.castShadow = true
    sphere.receiveShadow = true
    sphere.position.set(0, 0, 0)
    vars.scene.add(sphere)
  },

  // Adding the external objects
  addObjects: () => {
    const vars = Scene.vars
    const sphere = vars.scene.getObjectByName('sphere')
    // Load the car
    Scene.loadOBJ(
      'car',
      '../assets/car/car.obj', // The car obj
      '../assets/car/car_material.mtl', // The car material (that also contains its diffuse)
      0.05, // Scale down the car by a lot (the default model was really big)
      new THREE.Vector3(
        sphere.position.x,
        sphere.position.y,
        sphere.position.z + sphere.radius
      ), // Position the car on the middle of the sphere, on top of it
      new THREE.Vector3(Math.PI / 2, Math.PI, 0), // Rotate the car in order to drive on the wheels (it's safer)
      sphere.position, // Set the pivot to the center of the sphere (for easier rotation around it)
      // Callback (once the car has loaded)
      () => {
        // Create the headlights pointing direction
        const headlightsTarget = new THREE.Object3D()
        headlightsTarget.position.set(
          vars.car.children[0].position.x,
          vars.car.children[0].position.y + 150,
          vars.car.children[0].position.z - 10
        )
        console.log(headlightsTarget.position)
        vars.car.add(headlightsTarget)
        // Create the headlights of the car as a SpotLight
        const headlights = new THREE.SpotLight(
          0xfcf1b1,
          1,
          100,
          Math.PI / 2,
          0.4
        )
        headlights.position.set(
          vars.car.children[0].position.x,
          vars.car.children[0].position.y + 5,
          vars.car.children[0].position.z + 10
        )
        // Make the headlights target the Object3d created earlier
        headlights.target = headlightsTarget
        headlights.shadow.mapSize.width = 4096
        headlights.shadow.mapSize.height = 4096
        headlights.castShadow = true
        // Add the headlights to the car group
        vars.car.add(headlights)
        vars.carHeadlights = headlights
        // make it invisible as the scene start during the day
        vars.carHeadlights.visible = false
      }
    )

    // Load the UFO
    Scene.loadOBJ(
      'ufo',
      '../assets/ufo/ufo.obj',
      '../assets/ufo/ufo_diffuse.mtl',
      0.3,
      new THREE.Vector3(
        sphere.position.x,
        sphere.position.y,
        sphere.position.z + sphere.radius + 25
      ), // Position the car on the middle of the sphere, at a reasonable distance
      new THREE.Vector3(Math.PI / 2, Math.PI, 0),
      sphere.position, // Set the pivot to the center of the sphere (for easier rotation around it)
      // Callback (once the car has loaded)
      () => {
        const ufoSpotLight = new THREE.SpotLight(
          0xb3f542,
          0.4,
          100,
          Math.PI / 4,
          0.1
        )
        ufoSpotLight.position.set(
          vars.ufo.children[0].position.x,
          vars.ufo.children[0].position.y,
          vars.ufo.children[0].position.z
        )
        ufoSpotLight.shadow.mapSize.width = 4096
        ufoSpotLight.shadow.mapSize.height = 4096
        ufoSpotLight.castShadow = true
        vars.ufo.add(ufoSpotLight)
        vars.ufo.visible = false
      }
    )
  },

  // Adding the lights
  addLights: () => {
    const vars = Scene.vars

    // Ambient light
    const ambientLightIntensity = 0.4
    const ambientLight = new THREE.PointLight(
      0xaaaaaa,
      ambientLightIntensity,
      0.0
    )
    ambientLight.position.set(0, 0, 200)
    ambientLight.name = 'ambientLight'
    // Add the PointLight to the camera so it sticks to it
    vars.camera.add(ambientLight)

    // directional light (pointed at the sphere)
    const directionalLightIntensity = 0.7
    const d = 100
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      directionalLightIntensity
    )
    directionalLight.name = 'directionalLight'
    directionalLight.position.set(-50, 50, 200)
    // Tell the light to cast shadows and set the parameters
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

    let speed = 0.0 // Speed of the car in radian (because the car actually doesn't move, it just rotates with a displaced pivot)
    let angle = 0.0 // Speed at which the car rotates on itself in radian
    // left arrow pressed && right arrow not pressed
    if (vars.keydowns.indexOf(37) > -1 && vars.keydowns.indexOf(39) === -1) {
      angle = 0.08
    }
    // up arrow pressed && down arrow not pressed
    if (vars.keydowns.indexOf(38) > -1 && vars.keydowns.indexOf(40) === -1) {
      speed = 0.04
    }
    // right arrow pressed && left arrow not pressed
    if (vars.keydowns.indexOf(39) > -1 && vars.keydowns.indexOf(37) === -1) {
      angle = -0.08
    }
    // down arrow pressed && up arrow not pressed
    if (vars.keydowns.indexOf(40) > -1 && vars.keydowns.indexOf(38) === -1) {
      speed = -0.04
    }
    // if the car has no speed, it can't rotate
    if (speed === 0.0) {
      angle = 0.0
    }

    // Inverse the direction of rotation when the car moves in reverse
    if (speed < 0.0) {
      angle *= -1
    }

    // rotate on the z axis to make the car rotate on itself
    vars.car.rotation.z += angle
    // rotate on the x axis using rotateOnAxis with the pivot set to the center of the sphere to turn around the sphere
    vars.car.rotateOnAxis(new THREE.Vector3(-1, 0, 0), speed)
  },

  moveUFO: () => {
    const vars = Scene.vars
    const angle = 0.03
    const speed = 0.005
    vars.ufo.rotation.z += angle
    vars.ufo.rotation.y += speed
    vars.ufo.rotation.x += speed
  },

  // Adding the EventListeners
  addEventListeners: () => {
    window.addEventListener('resize', Scene.events.onWindowResize, false)
    window.addEventListener('keydown', Scene.events.onKeyDown, false)
    window.addEventListener('keyup', Scene.events.onKeyUp, false)
    document
      .getElementById('lightSwitch')
      .addEventListener('click', Scene.events.toggleLights, false)
    document
      .getElementById('cameraSwitch')
      .addEventListener('click', Scene.events.toggleCamera, false)
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
    },

    toggleLights: e => {
      const vars = Scene.vars

      vars.scene.traverse(child => {
        if (child.name === 'directionalLight') {
          // Toggle the visibility of the main source of ligthing
          child.visible = !child.visible
        }
      })
      // Toggle the background color between blue & black
      vars.scene.background = vars.scene.background.equals(
        new THREE.Color(0x72bce1)
      )
        ? new THREE.Color(0x000000)
        : new THREE.Color(0x72bce1)
      // Toggle car's headlights
      vars.carHeadlights.visible = !vars.carHeadlights.visible
      // Toggle the UFO's visibility
      vars.ufo.visible = !vars.ufo.visible
      e.target.innerHTML = e.target.innerHTML === 'DAY' ? 'NIGHT' : 'DAY'
    },

    toggleCamera: e => {
      const vars = Scene.vars

      vars.cameraLocked = !vars.cameraLocked
      e.target.innerHTML = e.target.innerHTML === 'free' ? 'locked' : 'free'
    }
  },

  loadOBJ: (
    name,
    path,
    material,
    scale,
    position,
    rotation,
    pivot = undefined,
    callback = undefined
  ) => {
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
        object.scale.set(scale, scale, scale)
        object.position.set(position.x, position.y, position.z)
        object.rotation.set(rotation.x, rotation.y, rotation.z)
        object.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        /**
         * Set the point of rotation of the object
         * By default the point of rotation is at the center of the object
         */
        if (pivot !== undefined) {
          const mesh = new THREE.Mesh()
          mesh.position.set(pivot.x, pivot.y, pivot.z)
          mesh.add(object)
          mesh.name = name
          vars[name] = mesh
          vars.scene.add(mesh)
        } else {
          object.name = name
          vars[name] = object
          vars.scene.add(object)
        }
        if (callback !== undefined) {
          callback()
        }
      },
      undefined,
      error => {
        console.error(error)
      }
    )
  }
}

Scene.init()
