import {loadGLTF} from "./libs/loader.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    //mockWithVideo('../../assets/mock-videos/musicband1.mp4');

    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.querySelector("#container"),
      imageTargetSrc: './assets/targets.mind',
      uiScanning: "#scanning",
      uiLoading: "no",
    });
    
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    // 3d object
    const gltf = await loadGLTF('./assets/musicband-raccoon/scene.gltf');
    gltf.scene.scale.set(0.1, 0.1, 0.1);
    gltf.scene.position.set(0, -0.4, 0);

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(gltf.scene);



const mixer = new THREE.AnimationMixer(gltf.scene);
const action = mixer.clipAction(gltf.animations[0]);
action.play();

const clock = new THREE.Clock();

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      const delta =clock.getDelta();
      mixer.update(delta);
      renderer.render(scene, camera);
    });
  }
  start();
});






