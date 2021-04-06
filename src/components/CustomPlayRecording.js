import React, { useEffect, useRef, useState } from "react";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
export function formatTime(ms) {
  if (ms <= 0) {
    return "00:00";
  }
  const hour = Math.floor(ms / HOUR);
  ms = ms % HOUR;
  const minute = Math.floor(ms / MINUTE);
  ms = ms % MINUTE;
  const second = Math.floor(ms / SECOND);
  if (hour) {
    return `${padZero(hour)}:${padZero(minute)}:${padZero(second)}`;
  }
  return `${padZero(minute)}:${padZero(second)}`;
}

function padZero(num, len = 2) {
  let str = String(num);
  const threshold = Math.pow(10, len - 1);
  if (num < threshold) {
    while (String(threshold).length > str.length) {
      str = "0" + num;
    }
  }
  return str;
}

export function openFullscreen(el) {
  if (el.requestFullscreen) {
    return el.requestFullscreen();
  } else if (el.mozRequestFullScreen) {
    /* Firefox */
    return el.mozRequestFullScreen();
  } else if (el.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    return el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    /* IE/Edge */
    return el.msRequestFullscreen();
  }
}

export const CustomPlayRecording = (props) => {
  const replayerRef = useRef();
  const progress = useRef();
  const step = useRef();
  const [player, setPlayer] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [meta, setMeta] = useState();
  const [playerState, setPlayerState] = useState();
  const [speedState, setSpeedState] = useState();
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState();
  const [percentage, setPercentage] = useState("");
  const [finished, setFinished] = useState(false);

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
    const pl = new window.rrweb.Replayer(events, {
      root: replayerRef.current,
      unpackFn: window.rrweb.unpack,
    });

    setPlayerState(pl.service.state.value);
    setSpeedState(pl.speedService.state.value);


    const metaData = pl.getMetaData();
    setMeta(pl.getMetaData());
    setPlayer(pl);

    const percent = Math.min(1, currentTime / metaData?.totalTime || 0);
    setPercentage(`${100 * percent}%`);

    let plState;
    // let currentTime = pl.getCurrentTime();
    pl.on("state-change", (states) => {
      const { player, speed } = states;
      let currentTimeOffset = pl.getCurrentTime();

      if (currentTimeOffset > 0) {
        setCurrentTime(pl.getCurrentTime());
      }

      const percent = Math.min(
        1,
        pl.getCurrentTime() / metaData?.totalTime || 0
      );
      setPercentage(`${100 * percent}%`);
      // setCurrentTime(pl.getCurrentTime());

      if (player?.value && plState !== player.value) {
        plState = player.value;
        setPlayerState(player.value);

        switch (player.value) {
          case "playing":
            loopTimer();
            break;
          case "paused":
            stopTimer();
            break;
          default:
            break;
        }
      }
      if (speed?.value && speedState !== speed.value) {
        setSpeedState(speed.value);
      }
    });

    pl.on("finish", () => {
      setFinished(true);
    });
  }, []);

  let timer;

  const play = () => {
    if (playerState !== "paused") {
      return;
    }
    if (finished) {
      player.play(0);
      setFinished(false);
    } else {
      player.play(currentTime);
    }
  };

  const pause = () => {
    if (playerState !== "playing") {
      return;
    }
    player.pause();
  };

  const loopTimer = () => {
    stopTimer();
    function update() {
      // console.log("print player?.getCurrentTime()", player?.getCurrentTime());
      // setCurrentTime(player?.getCurrentTime());
      if (currentTime < meta?.totalTime) {
        console.log("inside play swtich");
        timer = requestAnimationFrame(update);
      }
    }
    timer = requestAnimationFrame(update);
  };

  const stopTimer = () => {
    if (timer) {
      cancelAnimationFrame(timer);
      timer = null;
    }
  };

  const goto = (timeOffset) => {
    setCurrentTime(timeOffset);
    const isPlaying = playerState === "playing";
    player.pause();
    player.play(timeOffset);
    if (!isPlaying) {
      player.pause();
    }
  };

  const handleProgressClick = (event) => {
    if (speedState === "skipping") {
      return;
    }
    const progressRect = progress.current.getBoundingClientRect();
    const x = event.clientX - progressRect.left;
    let percent = x / progressRect.width;
    if (percent < 0) {
      percent = 0;
    } else if (percent > 1) {
      percent = 1;
    }
    setPercentage(`${100 * percent}%`);
    const timeOffset = meta?.totalTime * percent;
    goto(timeOffset);
  };

  const toggle = () => {
    switch (playerState) {
      case "playing":
        pause();
        break;
      case "paused":
        play();
        break;
      default:
        break;
    }
  };

  const setXSpeed = (newSpeed) => {
    let needFreeze = playerState === "playing";
    setSpeed(newSpeed);
    if (needFreeze) {
      player.pause();
    }
    player.setConfig({ speed });
    if (needFreeze) {
      player.play(currentTime);
    }
  };

  return (
    <div>
      <div ref={replayerRef}></div>
      <h1>Custom Play Recording</h1>

      <div className="rr-controller">
        <div className="rr-timeline">
          <span className="rr-timeline__time">{formatTime(currentTime)}</span>
          <div
            className="rr-progress"
            disabled={speedState === "skipping"}
            ref={progress}
            onClick={(event) => handleProgressClick(event)}
          >
            <div
              className="rr-progress__step"
              ref={step}
              style={{ width: percentage }}
            />
            {/* {#each customEvents as event}
          <div
            title={event.name}
            style="width: 10px;height: 5px;position: absolute;top:
            2px;transform: translate(-50%, -50%);background: {event.background};left:
            {event.position};" />
        {/each} */}
            <div
              className="rr-progress__handler"
              style={{ left: percentage }}
            />
          </div>
          <span className="rr-timeline__time">
            {formatTime(meta?.totalTime)}
          </span>
        </div>
        <div className="rr-controller__btns">
          <button onClick={toggle}>
            {playerState === "playing" && (
              <svg
                className="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
              >
                <path
                  d="M682.65984 128q53.00224 0 90.50112 37.49888t37.49888 90.50112l0
              512q0 53.00224-37.49888 90.50112t-90.50112
              37.49888-90.50112-37.49888-37.49888-90.50112l0-512q0-53.00224
              37.49888-90.50112t90.50112-37.49888zM341.34016 128q53.00224 0
              90.50112 37.49888t37.49888 90.50112l0 512q0 53.00224-37.49888
              90.50112t-90.50112
              37.49888-90.50112-37.49888-37.49888-90.50112l0-512q0-53.00224
              37.49888-90.50112t90.50112-37.49888zM341.34016 213.34016q-17.67424
              0-30.16704 12.4928t-12.4928 30.16704l0 512q0 17.67424 12.4928
              30.16704t30.16704 12.4928 30.16704-12.4928
              12.4928-30.16704l0-512q0-17.67424-12.4928-30.16704t-30.16704-12.4928zM682.65984
              213.34016q-17.67424 0-30.16704 12.4928t-12.4928 30.16704l0 512q0
              17.67424 12.4928 30.16704t30.16704 12.4928 30.16704-12.4928
              12.4928-30.16704l0-512q0-17.67424-12.4928-30.16704t-30.16704-12.4928z"
                />
              </svg>
            )}
            {playerState !== "playing" && (
              <svg
                className="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
              >
                <path
                  d="M170.65984 896l0-768 640 384zM644.66944
              512l-388.66944-233.32864 0 466.65728z"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => setXSpeed(1)}
          >
            1x
          </button>
          <button
            onClick={() => setXSpeed(2)}
          >
            2x
          </button>
          <button
            onClick={() => setXSpeed(4)}
          >
            4x
          </button>
          <button
            onClick={() => setXSpeed(8)}
          >
            8x
          </button>
          <button onClick={() => openFullscreen(replayerRef.current)}>
            [ ]
          </button>
          {/* {#each speedOption as s}
        <button
          class:active={s === speed && speedState !== 'skipping'}
          on:click={() => setSpeed(s)}
          disabled={speedState === 'skipping'}>
          {s}x
        </button>
      {/each} */}
          {/* <Switch
        id="skip"
        bind:checked={skipInactive}
        disabled={speedState === 'skipping'}
        label="skip inactive" /> */}
          {/* <button on:click={() => dispatch('fullscreen')}>
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="16"
          height="16">
          <defs>
            <style type="text/css">
            </style>
          </defs>
          <path
            d="M916 380c-26.4 0-48-21.6-48-48L868 223.2 613.6 477.6c-18.4
            18.4-48.8 18.4-68 0-18.4-18.4-18.4-48.8 0-68L800 156 692 156c-26.4
            0-48-21.6-48-48 0-26.4 21.6-48 48-48l224 0c26.4 0 48 21.6 48 48l0
            224C964 358.4 942.4 380 916 380zM231.2 860l108.8 0c26.4 0 48 21.6 48
            48s-21.6 48-48 48l-224 0c-26.4 0-48-21.6-48-48l0-224c0-26.4 21.6-48
            48-48 26.4 0 48 21.6 48 48L164 792l253.6-253.6c18.4-18.4 48.8-18.4
            68 0 18.4 18.4 18.4 48.8 0 68L231.2 860z"
            p-id="1286" />
        </svg>
      </button> */}
        </div>
      </div>

      {/* <div className="w3-light-grey">
        <div class="w3-green"></div>
      </div> */}

      {/* <progress id="file" value="32" max="100">
        {" "}
        32%{" "}
      </progress>

      <button
        onClick={() => {
          player.play(0);
        }}
      >
        Play
      </button>
      <button onClick={() => player.pause(0)}>Pause</button> */}
    </div>
  );
};
