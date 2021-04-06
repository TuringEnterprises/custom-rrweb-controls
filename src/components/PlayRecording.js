import React, { useEffect, useRef, useState } from "react";
export const PlayRecording = (props) => {
    const replayerRef = useRef();
    const [player, setPlayer] = useState();
//   document.addEventListener("DOMContentLoaded", function (event) {
//     //do work
//     const eventsArr =
//       (window.localStorage.getItem("eventArr") &&
//         JSON.parse(window.localStorage.getItem("eventArr"))) ||
//       [];
//     console.log("print ev", eventsArr);
//     if (eventsArr.length > 2) {
//       // alert(eventsArr.length);

    //   new window.rrwebPlayer({
    //     target: document.querySelector("#testing-rr"),
    //     props: {
    //       eventsArr,
    //     },
    //   });
//     }
//   });

  useEffect(() => {

    const events =
      (window.localStorage.getItem("eventArr") &&
        JSON.parse(window.localStorage.getItem("eventArr"))) ||
      [];
    // const pl = new window.rrweb.Replayer(events, {
    //     root: replayerRef.current,
    //     unpackFn: window.rrweb.unpack
    //   });
    const pl = new window.rrwebPlayer({
        target: replayerRef.current,
        props: {
            events,
        },
      });
      setPlayer(pl);

  }, []);

  return (
    <div>
      <div ref={replayerRef}></div>
      <h1>Play Recording</h1>
      <button onClick={() => player.play(0)}>Play</button>
    </div>
  );
};
