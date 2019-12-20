import * as THREE from '../node_modules/three/build/three.module.js'
import { OBJLoader } from '../node_modules/three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from '../node_modules/three/examples/jsm/loaders/MTLLoader.js'
import * as Utils from './utils.js'

const Scene = {
  vars: {
    scene: null,
    camera: null,
    renderer: null,
    // List of arrow keys currently being pressed
    keydowns: [],
    cameraLocked: false,
    // frametime & lastFrame are used to get the same animation speed on any refresh rate
    lastFrame: Date.now(),
    // keep the last 10 frame times to get a smoother animation
    frametimes: [],
    // used as the current frame time, mean value of the array frametimes
    frametime: null
  },

  init: () => {
    const vars = Scene.vars

    vars.scene = new THREE.Scene()
    vars.scene.background = new THREE.Color(0x72bce1)

    vars.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
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

    document.getElementById('loader').style.display = 'none'

    Scene.animate()
  },

  animate: () => {
    requestAnimationFrame(Scene.animate)
    Scene.render()
  },

  render: () => {
    const vars = Scene.vars

    // Get the correct animation speed
    const time = Date.now()
    // frametime represent the ms gap between each render
    vars.frametime = time - vars.lastFrame

    // Add the current frame time to the array
    vars.frametimes.push(vars.frametime)
    /**
     * Once the array has reached 10 it is shifted
     * in order to only keep the last 10 frame times
     */
    if (vars.frametimes.length > 10) {
      vars.frametimes.shift()
    }
    // Set the current frame time to the average of the array
    vars.frametime = Utils.getMeanArray(vars.frametimes)
    vars.lastFrame = time

    if (vars.car !== undefined) {
      if (vars.keydowns.length > 0) {
        Scene.moveCar()
      }

      if (vars.cameraLocked) {
        vars.camera.position.copy(
          vars.car.localToWorld(new THREE.Vector3(0, 0, 200))
        )
        vars.camera.lookAt(vars.car.position)
      } else {
        vars.camera.position.set(0, 0, 200)
        vars.camera.rotation.set(0, 0, 0)
      }
    }
    if (vars.ufo !== undefined) {
      Scene.moveUFO()
    }

    // Makes the sphere rotate slowly on it's local x, y axis
    vars.sphere.rotateOnAxis(
      new THREE.Vector3(1, 0, 0),
      vars.frametime * 0.00005
    )
    vars.sphere.rotateOnAxis(
      new THREE.Vector3(0, 1, 0),
      vars.frametime * 0.000025
    )

    vars.renderer.render(vars.scene, vars.camera)
  },

  // Adding the meshes
  addMeshes: () => {
    const vars = Scene.vars
    const sphereTexture = new THREE.TextureLoader().load(
      '../assets/sphereMaterial.jpg'
    )
    const sphereRoughness = new THREE.TextureLoader().load(
      '../assets/sphereRoughness.jpg'
    )
    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(95, 64, 64)
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xededed,
      map: sphereTexture,
      roughness: 1,
      roughnessMap: sphereRoughness,
      bumpMap: sphereRoughness,
      flatShading: true
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.radius = 95
    sphere.name = 'sphere'
    sphere.castShadow = true
    sphere.receiveShadow = true
    sphere.position.set(0, 0, 0)
    vars.sphere = sphere
    vars.scene.add(sphere)

    Scene.generateStars()
  },

  // Adding the external objects
  addObjects: () => {
    const vars = Scene.vars

    // Load the car
    Scene.loadOBJ(
      'car',
      '../assets/car/car.obj', // The car obj
      '../assets/car/car.mtl', // The car material properties
      0.05, // Scale down the car by a lot (the default model was really big)
      new THREE.Vector3(
        vars.sphere.position.x,
        vars.sphere.position.y,
        vars.sphere.position.z + vars.sphere.radius - 0.2
      ), // Position the car on the middle of the sphere, on top of it
      new THREE.Vector3(Math.PI / 2, Math.PI, 0), // Rotate the car in order to drive on the wheels (it's safer)
      vars.sphere.position, // Set the pivot to the center of the sphere (for easier rotation around it)
      // Callback (once the car has loaded)
      () => {
        // Create the headlights pointing direction
        const headlightsTarget = new THREE.Object3D()
        headlightsTarget.position.set(
          vars.car.children[0].position.x,
          vars.car.children[0].position.y + 150,
          vars.car.children[0].position.z - 10
        )
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
        vars.sphere.add(vars.car)
      }
    )

    // Load the UFO
    Scene.loadOBJ(
      'ufo',
      '../assets/ufo/ufo.obj',
      '../assets/ufo/ufo.mtl',
      0.3,
      new THREE.Vector3(
        vars.sphere.position.x,
        vars.sphere.position.y,
        vars.sphere.position.z + vars.sphere.radius + 25
      ), // Position the car on the middle of the sphere, at a reasonable distance
      new THREE.Vector3(Math.PI / 2, Math.PI, 0),
      vars.sphere.position, // Set the pivot to the center of the sphere (for easier rotation around it)
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
    const directionalLightIntensity = 1
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

  generateStars: () => {
    /**
     * Stars generation
     * Randomly create 1000 emissive sphere
     * at a random distance min +-2000, max +-5000
     */
    const vars = Scene.vars
    const stars = new THREE.Mesh()
    let sphere, sphereGeometry, sphereMaterial
    for (let i = 0; i < 2000; i++) {
      sphereGeometry = new THREE.SphereGeometry(3, 6, 6)
      sphereMaterial = new THREE.MeshStandardMaterial({
        emissive: 0xffffff
      })
      sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.position.set(
        Utils.getRandomArbitrary(-5000, 5000),
        Utils.getRandomArbitrary(-5000, 5000),
        Math.random() > 0.5
          ? Utils.getRandomArbitrary(-5000, -200)
          : Utils.getRandomArbitrary(200, 5000)
      )
      stars.add(sphere)
    }
    vars.scene.add(stars)
    vars.stars = stars
    stars.visible = false
  },

  moveCar: () => {
    const vars = Scene.vars

    let speed = 0.0 // Speed of the car in radian (because the car actually doesn't move, it just rotates with a displaced pivot)
    let angle = 0.0 // Speed at which the car rotates on itself in radian
    // left arrow pressed && right arrow not pressed
    if (vars.keydowns.indexOf(37) > -1 && vars.keydowns.indexOf(39) === -1) {
      angle = 0.005
    }
    // up arrow pressed && down arrow not pressed
    if (vars.keydowns.indexOf(38) > -1 && vars.keydowns.indexOf(40) === -1) {
      speed = 0.0015
    }
    // right arrow pressed && left arrow not pressed
    if (vars.keydowns.indexOf(39) > -1 && vars.keydowns.indexOf(37) === -1) {
      angle = -0.005
    }
    // down arrow pressed && up arrow not pressed
    if (vars.keydowns.indexOf(40) > -1 && vars.keydowns.indexOf(38) === -1) {
      speed = -0.0015
    }
    // if the car has no speed, it can't rotate
    if (speed === 0.0) {
      angle = 0.0
    }

    // Inverse the direction of rotation when the car moves in reverse
    if (speed < 0.0) {
      angle *= -1
    }

    speed = vars.frametime * speed
    angle = vars.frametime * angle

    // rotate on the z axis to make the car rotate on itself
    vars.car.rotation.z += angle
    // rotate on the x axis using rotateOnAxis with the pivot set to the center of the sphere to turn around the sphere
    vars.car.rotateOnAxis(new THREE.Vector3(-1, 0, 0), speed)
  },

  moveUFO: () => {
    const vars = Scene.vars
    const angle = vars.frametime * 0.003
    const speed = vars.frametime * 0.0003
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
      // Toggle stars visibility
      vars.stars.visible = !vars.stars.visible
      e.target.innerHTML = e.target.innerHTML === 'day' ? 'night' : 'day'
    },

    toggleCamera: e => {
      const vars = Scene.vars

      vars.cameraLocked = !vars.cameraLocked
      e.target.innerHTML = e.target.innerHTML === 'locked' ? 'free' : 'locked'
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
