import React, { useState, useEffect, useRef } from 'react';
import runWithFps from 'run-with-fps';

function easeInOutQuad (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t }

function tween(from, to, duration, cb) {
  let stopped = false;
  const start = Date.now();
  const stop = runWithFps(() => {
    const spent = Math.min((Date.now() - start), duration);
    cb(from + (to - from) * easeInOutQuad(spent / duration));
    if (spent === duration || stopped) {
      stop();
    }
  }, 60);

  return () => {
    stopped = true;
  };
}

const useBoundingClientRect = (ref) => {
  const [rect, setRect] = useState(null);

  useEffect(
    () => {
      const updateRect = () => {
        if (ref.current) {
          setRect(ref.current.getBoundingClientRect());
        }
      };

      updateRect();
      window.addEventListener('resize', updateRect);

      return () => {
        window.removeEventListener('resize', updateRect);
      };
    },
    [ref.current]
  );

  return rect;
};

export default function ReactSwipeProps({ children, pos: propsPos, min, max, transitionEnd }) {
  const [pos, setPos] = useState(min);
  const [dst, setDst] = useState(min);
  const root = useRef(null);
  const rect = useBoundingClientRect(root);
  console.log(dst, pos);

  const go = (i) => {
    const n = Math.min(Math.max(Math.round(i), min), max);
    return tween(pos, n, 300, (v) => {
      setPos(v);
      setDst(v);

      if (v === n) {
        transitionEnd(n);
      }
    });
  }

  const slide = (from, to) => {
    return tween(from, to, 200, (v) => {
      setPos(v);

      if (v === to) {
        transitionEnd(to);
      }
    });
  }

  useEffect(() => {
    if (propsPos !== pos) {
      const stop = go(propsPos);

      return stop;
    }
  }, [propsPos]);

  useEffect(() => {
    console.log('useEffect', dst, pos);
    if (dst !== pos) {
      const stop = slide(pos, dst);

      return stop;
    }
  }, [dst, propsPos]);

  useEffect(() => {
    const state = { x: 0, y: 0, dragging: false, delta: 0 };
    const handleDragStart = (e) => {
      e.preventDefault();
      state.x = e.pageX;
      state.y = e.pageY;
      state.delta = 0;
      state.dragging = true;
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    };

    const calcSpeed = (delta) => {
      const currentPos = pos + state.delta;
      if (currentPos <= min && delta < 0) {
        return Math.max(0, 0.3 + state.delta / 2);
      } else if(currentPos >= max && delta > 0) {
        return Math.max(0, 0.3 - state.delta / 2);
      }

      return 1.5;
    }

    const handleMove = (e) => {
      if (state.dragging) {
        e.preventDefault();
        const delta = (state.x - e.pageX) / rect.width;
        const speed = calcSpeed(delta);
        state.delta += delta * speed;
        state.x = e.pageX;
        state.y = e.pageY;

        setPos(pos + state.delta);
        setDst(pos + state.delta);
      }
    }

    const handleEnd = (e) => {
      state.dragging = false;
      setDst(Math.min(Math.max(Math.round(pos + state.delta), min), max));
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
    }

    if (root.current) {
      root.current.addEventListener('mousedown', handleDragStart);

      return () => {
        root.current.removeEventListener('mousedown', handleDragStart);
      }
    }
  });

  return (
    <div className="swipeRoot" ref={root}>
      {children(pos)}
    </div>
  );
}