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
    });
    
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    // 3d object
    const gltf = await loadGLTF('./assets/Scene_Final.glb');
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
}
anchor.onTargetLost = () => {
  audio.pause();
  video1.pause();
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

// Bottom buttons functionality

document.addEventListener("DOMContentLoaded", function() {

    let currentStream;

    function stopMediaTracks(stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
    }

    // Swap Camera
    document.getElementById('swap-camera').addEventListener('click', function() {
        if (typeof currentStream !== 'undefined') {
            stopMediaTracks(currentStream);
        }

        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            let videoDeviceId;
            let found = false;

            for (let device of devices) {
                if (device.kind === 'videoinput') {
                    if (videoDeviceId && videoDeviceId !== device.deviceId) {
                        found = true;
                        videoDeviceId = device.deviceId;
                        break;
                    } else if (!videoDeviceId) {
                        videoDeviceId = device.deviceId;
                    }
                }
            }

            if (!found) {
                videoDeviceId = undefined;
            }

            return navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined
                }
            });
        }).then(function(stream) {
            currentStream = stream;
            // Set the stream to any video element you want
            const videoElement = document.getElementById('your-video-element-id');
            videoElement.srcObject = stream;
        }).catch(function(error) {
            console.error(error);
        });
    });

    // Take Picture
    document.getElementById('take-picture').addEventListener('click', function() {
        const videoElement = document.getElementById('your-video-element-id');
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext('2d').drawImage(videoElement, 0, 0);

        // Get the image
        const imageUrl = canvas.toDataURL('image/png');

        // Do something with the image (e.g., save, display, etc.)
    });

    // Record Video
    let mediaRecorder;
    let recordedChunks = [];

    document.getElementById('record-video').addEventListener('click', function() {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            navigator.mediaDevices.getDisplayMedia({ video: true }).then(function(stream) {
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = function(event) {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = function() {
                    const blob = new Blob(recordedChunks, {
                        type: 'video/webm'
                    });
                    const url = URL.createObjectURL(blob);
                    // Do something with the video blob (e.g., save, display, etc.)
                };

                mediaRecorder.start();
                this.textContent = 'Stop Recording';
            }).catch(function(error) {
                console.error(error);
            });
        } else if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            this.textContent = 'Start Recording';
        }
    });
});



