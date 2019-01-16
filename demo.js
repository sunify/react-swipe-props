import React, { useState } from 'react';
import RSWP from './swipeProps';

export default function Demo() {
  const [pos, setPos] = useState(0);

  const next = () => {
    setPos(pos + 1);
  };

  const prev = () => {
    setPos(pos - 1);
  };

  const go = (i) => {
    setPos(i);
  };

  return (<div>
    <h1>Swipe demo</h1>

    <RSWP pos={pos} min={0} max={5} transitionEnd={go}>
      {(pos) => {
        return (
          <div className="swipeableRoot">
            <div className="swipeable" style={{
              left: `${-pos * 100}%`
            }}>
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
              <div>5</div>
              <div>6</div>
            </div>
          </div>
        );
      }}
    </RSWP>
    <button onClick={prev}>←</button>
    <button onClick={next}>→</button>
  </div>);
}
