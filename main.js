import {loadGLTF, loadAudio, loadVideo, loadTexture} from "./libs/loader.js";
import {createChromaMaterial} from "./libs/chroma-video.js";

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
    const gltf = await loadGLTF('./assets/Scene.glb');
    gltf.scene.scale.set(0.4, 0.4, 0.4);
    gltf.scene.position.set(0, 0, 0);

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(gltf.scene);

    //video1
    const video1 = await loadVideo("./assets/Water_Final_Chroma.mp4");
    video1.setAttribute('loop', true);
    const v1texture = new THREE.VideoTexture(video1);

    const v1geometry = new THREE.PlaneGeometry(1, 0.5);
    const v1material = createChromaMaterial(v1texture, 0x00ff00);
    const v1plane = new THREE.Mesh(v1geometry,v1material);
    v1plane.position.set(0,-0.15,0.05);
    anchor.group.add(v1plane);
    
//video2 

const video2 = await loadVideo("./assets/Nebula4.mp4");
    video2.setAttribute('loop', true);
    const v2texture = new THREE.VideoTexture(video2);

    const v2geometry = new THREE.PlaneGeometry(1, 1);
    const v2material = createChromaMaterial(v2texture, 0x00ff00);
    const v2plane = new THREE.Mesh(v2geometry,v2material);
    v2plane.position.set(0,0.2,-0.4);
    v2plane.scale.multiplyScalar(1.5);
    anchor.group.add(v2plane);

    //audio
    const audioClip = await loadAudio('./assets/Dreamy-Short.mp3');
    const listener = new THREE.AudioListener();
    const audio = new THREE.PositionalAudio(listener);
    camera.add(listener);
    anchor.group.add(audio);
    audio.setRefDistance(2000);
    audio.setBuffer(audioClip);
    audio.setLoop(true);
    
anchor.onTargetFound = () =>{
  audio.play();
  video1.play();
  video2.play();
}
anchor.onTargetLost = () => {
  audio.pause();
  video1.pause();
  video2.play();
}


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




