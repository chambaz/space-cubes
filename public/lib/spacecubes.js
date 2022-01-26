function bg() {
  // create a renderer
  const canvas = document.querySelector('#bg')
  const renderer = new THREE.WebGLRenderer({ canvas })

  // webGL background color
  renderer.setClearColor('#000', 1)
  renderer.outputEncoding = THREE.sRGBEncoding

  // setup your scene
  const scene = new THREE.Scene()

  scene.fog = new THREE.Fog(0x000000, 50, 100)

  // setup a camera
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    100
  )
  camera.position.set(0, 0, 1)

  // create orbit controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement)
  controls.enableZoom = false

  // create particle system for stars
  const particleGeom = new THREE.Geometry()
  const particleMaterial = new THREE.PointsMaterial({
    color: 'rgb(255, 255, 255)',
    size: 0.3,
    map: new THREE.TextureLoader().load(
      'https://assets.codepen.io/123063/light_PNG14430.png'
    ),
    transparent: true,
    blending: THREE.AdditiveBlending,
  })

  // add individual particles
  let particleCount = 1000
  let particleDistance = 100

  for (let i = 0; i < particleCount; i++) {
    const posX = (Math.random() - 0.5) * particleDistance
    const posY = (Math.random() - 0.5) * particleDistance
    const posZ = (Math.random() - 0.5) * particleDistance
    const particle = new THREE.Vector3(posX, posY, posZ)
    particleGeom.vertices.push(particle)
  }

  let particleSys = new THREE.Points(particleGeom, particleMaterial)
  particleSys.name = 'starSystem'

  scene.add(particleSys)

  // rezie canvas / state
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const needResize = canvas.width !== width || canvas.height !== height
    if (needResize) {
      renderer.setSize(width, height, false)
    }
    return needResize
  }

  // render 🚀
  function render(time) {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
    }

    const particleSys = scene.getObjectByName('starSystem')
    particleSys.geometry.vertices.forEach((particle) => {
      particle.z += 0.3
      if (particle.z > 10) {
        particle.z = Math.floor(Math.random() * (-80 - -120 + 1) + -120)
      }
    })
    particleSys.geometry.verticesNeedUpdate = true

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
}

function cube(id, logo = false) {
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const needResize = canvas.width !== width || canvas.height !== height
    if (needResize) {
      renderer.setSize(width, height, false)
    }
    return needResize
  }

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  const hue = logo ? '#d1c7e6' : 'purple'
  const cubesNum = logo ? 1 : 5

  const canvas = document.querySelector(id)
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
  renderer.setClearColor(0xffffff, 0)

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    1000
  )

  camera.position.set(0, 0, 10)

  const controls = new THREE.OrbitControls(camera, renderer.domElement)

  controls.autoRotate = !logo
  controls.enableDamping = true
  controls.enableZoom = false

  if (logo) {
    controls.minPolarAngle = Math.PI / 2
    controls.maxPolarAngle = Math.PI / 2
  }

  const randomCol = randomColor.bind(null, {
    hue,
    luminosity: 'light',
  })

  function randomColFunc() {
    return hue.charAt(0) === '#' ? hue : randomCol()
  }

  const cubeGroup = new THREE.Object3D()
  const cubes = []

  let z,
    h,
    v = 1
  const boxSize = 2.4
  const boxSizeOuter = 2.95
  const cubesLoop = cubesNum + 1
  let cameraZoom = 0

  switch (cubesNum) {
    case 1:
      camera.position.set(0, 0, 6)
      break
    case 2:
      camera.position.set(0, 0, 17)
      break
    case 3:
      camera.position.set(0, 0, 22)
      break
    case 4:
      camera.position.set(0, 0, 30)
      break
    case 5:
      camera.position.set(0, 0, 35)
      break
    case 6:
      camera.position.set(0, 0, 40)
      break
    case 7:
      camera.position.set(2, 0, 45)
      break
  }

  for (z = 1; z < cubesLoop; z++) {
    for (v = 1; v < cubesLoop; v++) {
      for (h = 1; h < cubesLoop; h++) {
        const cubeGeo = new THREE.BoxBufferGeometry(
          boxSize,
          boxSize,
          boxSize,
          2,
          2,
          2
        )
        const cube = new THREE.Mesh(cubeGeo, [
          new THREE.MeshLambertMaterial({
            color: randomColFunc(),
          }),
          new THREE.MeshLambertMaterial({
            color: randomColFunc(),
          }),
          new THREE.MeshLambertMaterial({
            color: randomColFunc(),
          }),
          new THREE.MeshLambertMaterial({
            color: randomColFunc(),
          }),
          new THREE.MeshLambertMaterial({
            color: randomColFunc(),
          }),
          new THREE.MeshLambertMaterial({
            color: randomColFunc(),
          }),
        ])
        cube.position.set(h * boxSizeOuter, v * boxSizeOuter, z * boxSizeOuter)

        cubeGroup.add(cube)
        cubes.push(cube)
      }
    }
  }

  const cubeGroupContainer = new THREE.Box3().setFromObject(cubeGroup)
  cubeGroupContainer.center(cubeGroup.position)
  cubeGroup.position.multiplyScalar(-1)

  const cubeGroupPivot = new THREE.Group()
  cubeGroupPivot.rotation.x = 0.5
  cubeGroupPivot.rotation.y = logo ? 0.87 : 0.97

  switch (cubesNum) {
    case 1:
      cubeGroupPivot.position.y = 0
      break
    case 2:
      cubeGroupPivot.position.y = 0.3
      break
    case 3:
      cubeGroupPivot.position.y = 0.7
      break
    case 4:
      cubeGroupPivot.position.y = 1
      break
    case 5:
      cubeGroupPivot.position.y = 1.3
      break
    case 6:
      cubeGroupPivot.position.y = 1.7
      break
    case 7:
      cubeGroupPivot.position.y = 2
      break
  }

  scene.add(cubeGroupPivot)
  cubeGroupPivot.add(cubeGroup)

  const lights = logo
    ? [
        new THREE.PointLight(randomColFunc(), 0.5),
        new THREE.PointLight(randomColFunc(), 0.3),
        new THREE.PointLight(randomColFunc(), 0.6),
        new THREE.PointLight(randomColFunc(), 0.2),
        new THREE.PointLight(randomColFunc(), 0.5),
        new THREE.PointLight(randomColFunc(), 0.4),
      ]
    : [
        new THREE.PointLight(randomColFunc(), 0.6),
        new THREE.PointLight(randomColFunc(), 0.6),
        new THREE.PointLight(randomColFunc(), 0.6),
        new THREE.PointLight(randomColFunc(), 0.6),
        new THREE.PointLight(randomColFunc(), 0.6),
        new THREE.PointLight(randomColFunc(), 0.6),
      ]

  const lightHelpers = [
    new THREE.PointLightHelper(lights[0]),
    new THREE.PointLightHelper(lights[1]),
    new THREE.PointLightHelper(lights[2]),
    new THREE.PointLightHelper(lights[3]),
    new THREE.PointLightHelper(lights[4]),
    new THREE.PointLightHelper(lights[5]),
  ]

  lights[0].position.set(8, 8, 0)
  lights[1].position.set(-8, 8, 0)
  lights[2].position.set(8, -8, 0)
  lights[3].position.set(-8, -8, 0)
  lights[4].position.set(0, 0, 10)
  lights[5].position.set(0, 0, -10)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)

  scene.add(ambientLight)

  lights.map((light) => {
    scene.add(light)
  })

  // lightHelpers.map((helper) => {
  //   scene.add(helper)
  // })

  // render 🚀
  function render(time) {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
    }

    if (logo) {
      cubeGroupPivot.rotation.y =
        document.documentElement.scrollTop / 250 + 0.65
    }
    document.querySelector(id).style.filter = `hue-rotate(${
      document.documentElement.scrollTop / 2
    }deg)`

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
}

bg()
cube('#cube')
cube('#logo', true)
