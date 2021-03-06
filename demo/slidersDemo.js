import React, { useState } from 'react';
import RSWP from '../src/swipeProps';

const range = (from, to) =>
  Array.from(new Array(to - from), (_, i) => i + from);

export default function SlidersDemo() {
  const count = 6;

  const swipeRef = React.useRef(null);
  const progressRef = React.useRef(null);
  const [pos, setPos] = useState(0);

  const numRefs = [];
  for (let i = 0; i < count; i += 1) {
    numRefs.push(React.useRef(null));
  }

  const next = () => {
    setPos(pos + 1);
  };

  const prev = () => {
    setPos(pos - 1);
  };

  const updateRefs = pos => {
    if (swipeRef.current) {
      swipeRef.current.style.left = `${-pos * 100}%`;
    }
    if (progressRef.current) {
      progressRef.current.style.width = `calc(${100 -
        Math.min(100, (pos / (count - 1)) * 100)}% - 30px)`;
    }
    numRefs.forEach((numRef, i) => {
      if (numRef.current) {
        numRef.current.style.transform = `scale(${((count - Math.abs(i - pos)) /
          count) **
          8 *
          1.3})`;
        numRef.current.style.opacity = 1 - Math.abs(i - pos) / count ** 0.2;
      }
    });
  };

  const go = i => {
    setPos(i);
    updateRefs(i);
  };

  return (
    <div className="demo">
      <h1>Swipe demo</h1>

      <h2>Continuous</h2>
      <RSWP
        className="userSwipeClass"
        pos={pos}
        min={0}
        max={count - 1}
        transitionEnd={go}
      >
        {pos => {
          return (
            <div className="swipeableRoot">
              <button className="prev" onClick={prev}>
                ←
              </button>
              <button className="next" onClick={next}>
                →
              </button>
              <div className="dots">
                {range(0, count).map(i => (
                  <div
                    className="dot"
                    key={i}
                    onClick={() => {
                      go(i);
                    }}
                  />
                ))}
                <div
                  className="dot dot-active"
                  style={{
                    left: `${Math.max(0, Math.min(100, (pos / count) * 100))}%`
                  }}
                />
              </div>
              <div
                className="progress"
                style={{
                  width: `calc(${100 -
                    Math.min(100, (pos / (count - 1)) * 100)}% - 30px)`
                }}
              />
              <div
                className="swipeable"
                style={{
                  left: `${-pos * 100}%`
                }}
              >
                {range(0, count).map(i => {
                  return (
                    <div key={i}>
                      <span
                        style={{
                          transform: `scale(${((count - Math.abs(i - pos)) /
                            count) **
                            8 *
                            1.3})`,
                          opacity: 1 - Math.abs(i - pos) / count ** 0.2
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      </RSWP>

      <h2>Discrete</h2>
      <RSWP
        className="userSwipeClass"
        discrete
        pos={pos}
        min={0}
        max={count - 1}
        transitionEnd={go}
        swiping={updateRefs}
      >
        {(pos, _, dragging) => {
          return (
            <div className={`swipeableRoot`}>
              <button className="prev" onClick={prev}>
                ←
              </button>
              <button className="next" onClick={next}>
                →
              </button>
              <div className="dots">
                {range(0, count).map(i => (
                  <div
                    className="dot"
                    key={i}
                    onClick={() => {
                      go(i);
                    }}
                  />
                ))}
                <div
                  className="dot dot-active"
                  style={{
                    left: `${Math.max(0, Math.min(100, (pos / count) * 100))}%`
                  }}
                />
              </div>
              <div
                className="progress"
                ref={progressRef}
                style={{
                  transition:
                    !dragging &&
                    'width 0.3s cubic-bezier(0.455, 0.03, 0.515, 0.955)',
                  width: `calc(${100 -
                    Math.min(100, (pos / (count - 1)) * 100)}% - 30px)`
                }}
              />
              <div
                className="swipeable"
                ref={swipeRef}
                style={{
                  transition:
                    !dragging &&
                    'left 0.3s cubic-bezier(0.455, 0.03, 0.515, 0.955)',
                  left: `${-pos * 100}%`
                }}
              >
                {range(0, count).map(i => {
                  return (
                    <div key={i}>
                      <span
                        ref={numRefs[i]}
                        style={{
                          transition:
                            !dragging &&
                            'transform 0.3s, opacity 0.3s cubic-bezier(0.455, 0.03, 0.515, 0.955)',
                          transform: `scale(${((count - Math.abs(i - pos)) /
                            count) **
                            8 *
                            1.3})`,
                          opacity: 1 - Math.abs(i - pos) / count ** 0.2
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      </RSWP>
    </div>
  );
}
