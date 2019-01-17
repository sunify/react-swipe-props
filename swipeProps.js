import React, { useState, useEffect, useRef } from 'react';
import runWithFps from 'run-with-fps';

function easeInOutQuad (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t }

const slideDuration = 300;

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

export default function ReactSwipeProps({ children, pos: propsPos, min, max, transitionEnd, ...props }) {
  const [pos, setPos] = useState(min);
  const [dst, setDst] = useState(min);
  const root = useRef(null);
  const rect = useBoundingClientRect(root);

  const slide = (from, to) => {
    return tween(from, to, Math.max(0.5, Math.min(2, Math.abs(from - to))) * slideDuration, (v) => {
      setPos(v);

      if (v === to) {
        transitionEnd(to);
      }
    });
  }

  useEffect(() => {
    const nextPos = Math.min(Math.max(Math.round(propsPos), min), max);
    if (nextPos !== pos) {
      setDst(nextPos);
    }

    if (nextPos !== propsPos) {
      transitionEnd(nextPos);
    }
  }, [propsPos]);

  useEffect(() => {
    if (dst !== pos) {
      const stop = slide(pos, dst);

      return stop;
    }
  }, [dst, propsPos]);

  const handleDragStart = (e) => {
    const { pageX, pageY } = e.touches ? e.touches[0] : e;
    const state = { x: pageX, y: pageY, dragging: true, delta: 0 };
    e.preventDefault();

    const calcSpeed = (delta) => {
      const currentPos = pos + state.delta;
      if (currentPos <= min && delta < 0) {
        return Math.max(0, 0.3 + state.delta / 2);
      } else if(currentPos >= max && delta > 0) {
        return Math.max(0, 0.3 - state.delta / 2);
      }

      return 0.8;
    }

    const handleMove = (e) => {
      if (state.dragging) {
        e.preventDefault();
        const { pageX, pageY } = e.touches ? e.touches[0] : e;
        const delta = (state.x - pageX) / rect.width;
        const speed = calcSpeed(delta);
        state.delta += delta * speed;
        state.x = pageX;
        state.y = pageY;

        setPos(pos + state.delta);
        setDst(pos + state.delta);
      }
    }

    const handleEnd = () => {
      state.dragging = false;
      setDst(Math.min(Math.max(Math.round(pos + state.delta), min), max));
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
    }
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
  };

  return (
    <div className="swipeRoot" ref={root} onMouseDown={handleDragStart} onTouchStart={handleDragStart} {...props}>
      {children(pos)}
    </div>
  );
}