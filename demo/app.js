import React, { useState } from 'react';
import RSWP from 'react-swipe-props';

const range = (from, to) => Array.from(new Array(to - from), (_, i) => i + from);

export default function App() {
  const [pos, setPos] = useState(0);
  const count = 6;

  const next = () => {
    setPos(pos + 1);
  };

  const prev = () => {
    setPos(pos - 1);
  };

  const go = (i) => {
    setPos(i);
  };

  return (<div className="demo">
    <h1>Swipe demo</h1>

    <RSWP className="userSwipeClass" pos={pos} min={0} max={count - 1} transitionEnd={go}>
      {(pos) => {
        return (
          <div className="swipeableRoot">
            <button className="prev" onClick={prev}>←</button>
            <button className="next" onClick={next}>→</button>
            <div className="dots">
              {range(0, count).map(i => <div className="dot" key={i} onClick={() => {
                go(i)
              }} />)}
              <div className="dot dot-active" style={{
                left: `${Math.max(0, Math.min(100, pos / count * 100))}%`
              }} />
            </div>
            <div className="progress" style={{
              width: `calc(${100 - Math.min(100, pos / (count - 1) * 100)}% - 30px)`,
            }}></div>
            <div className="swipeable" style={{
              left: `${-pos * 100}%`
            }}>
              {range(0, count).map(i => {
                return <div key={i}><span style={{
                  transform: `scale(${((count - Math.abs(i - pos)) / count) ** 8 * 1.3})`,
                  opacity: 1 - Math.abs(i - pos) / count ** 0.2
                }}>{i + 1}</span></div>;
              })}
            </div>
          </div>
        );
      }}
    </RSWP>
  </div>);
}
