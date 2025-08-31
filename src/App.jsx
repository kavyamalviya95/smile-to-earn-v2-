import React, { useEffect, useRef, useState } from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs";

export default function App() {
  const videoRef = useRef(null);
  const [coins, setCoins] = useState(
    parseInt(localStorage.getItem("coins") || "0")
  );

  useEffect(() => {
    async function setupCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
    }
    setupCamera();

    async function detectSmile() {
      const model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
      );

      setInterval(async () => {
        if (videoRef.current) {
          const predictions = await model.estimateFaces({
            input: videoRef.current,
          });

          if (predictions.length > 0) {
            const keypoints = predictions[0].keypoints;
            // simple smile detection: distance between mouth corners
            const left = keypoints[61];
            const right = keypoints[291];
            const smileWidth = Math.abs(right.x - left.x);

            if (smileWidth > 50) {
              setCoins((prev) => {
                const newCoins = prev + 10;
                localStorage.setItem("coins", newCoins);
                return newCoins;
              });
            }
          }
        }
      }, 2000);
    }

    detectSmile();
  }, []);

  return (
    <div>
      <h1>😁 Smile to Earn</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="300"
        height="200"
      />
      <h2>Coins: {coins}</h2>
      <button onClick={() => { setCoins(0); localStorage.setItem("coins", 0); }}>
        Reset Coins
      </button>
    </div>
  );
}
                                              
