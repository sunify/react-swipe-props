import React, { useState, useEffect, useRef } from 'react';
import runWithFps from 'run-with-fps';
import { Motion, spring } from 'react-motion';

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
  }, 30);

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

export default function ReactSwipeProps({
  children,
  pos: propsPos = 0,
  min,
  max,
  transitionEnd,
  slideDuration = 300,
  ...props
}) {
  const [pos, setPos] = useState(min);
  const [interacting, setInteracting] = useState(false);
  const root = useRef(null);
  const rect = useBoundingClientRect(root);

  const go = (pos) => {
    setPos(pos);
  };

  useEffect(() => {
    const nextPos = Math.min(Math.max(Math.round(propsPos), min), max);
    if (nextPos !== pos) {
      setPos(nextPos);
    }

    if (nextPos !== propsPos && transitionEnd) {
      transitionEnd(nextPos);
    }
  }, [propsPos]);

  const limitPos = (n) => Math.min(Math.max(Math.round(n), min), max)

  useEffect(() => {
    const handlerOptions = { passive: false };
    const handleDragStart = (e) => {
      if (!e.touches && e.button !== 0) {
        return;
      }
      const { pageX, pageY } = e.touches ? e.touches[0] : e;
      const state = { x: pageX, y: pageY, dragging: false, delta: 0 };
      const startTime = Date.now();

      const calcSpeed = (delta) => {
        const currentPos = pos + state.delta;
        if (currentPos <= min && delta < 0) {
          return Math.max(0, 0.3 + state.delta / 2);
        } else if(currentPos >= max && delta > 0) {
          return Math.max(0, 0.3 - state.delta / 2);
        }

        return 1;
      }

      const removeListeners = () => {
        document.removeEventListener('touchmove', handleMove, handlerOptions);
        document.removeEventListener('touchend', handleEnd, handlerOptions);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
      }

      const handleMove = (e) => {
        const { pageX, pageY } = e.touches ? e.touches[0] : e;
        const deltaX = (state.x - pageX);
        const deltaY = (state.y - pageY);
        if (state.dragging) {
          e.preventDefault();
          const deltaPos = deltaX / rect.width;
          const speed = calcSpeed(deltaPos);
          state.delta += deltaPos * speed;
          state.x = pageX;
          state.y = pageY;

          setPos(pos + state.delta);
        } else {
          if (e.touches) {
            if (!(e.touches.length > 1 || (e.scale && e.scale !== 1)) && Math.abs(deltaX) > Math.abs(deltaY)) {
              e.preventDefault();
              state.dragging = true;
              setInteracting(true);
            } else {
              removeListeners();
            }
          } else {
            setInteracting(true);
            state.dragging = true;
          }
        }
      }

      const handleEnd = () => {
        if (state.dragging) {
          const final = limitPos(Math.round(pos + state.delta));

          setInteracting(false);
          setTimeout(() => {
            if (final === pos && Date.now() - startTime < 250 && Math.abs(state.delta * rect.width) > 30) {
              setPos(limitPos(final + Math.sign(state.delta)));
            } else {
              setPos(final);
            }
          });
        }
        removeListeners();
      }

      document.addEventListener('touchmove', handleMove, handlerOptions);
      document.addEventListener('touchend', handleEnd, handlerOptions);
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    };

    if (root.current && !interacting) {
      root.current.addEventListener('touchstart', handleDragStart, handlerOptions);
      root.current.addEventListener('touchforcechange', () => undefined, false);
      root.current.addEventListener('mousedown', handleDragStart);

      return () => {
        if (root.current) {
          root.current.removeEventListener('touchstart', handleDragStart, handlerOptions);
          root.current.removeEventListener('touchforcechange', () => undefined, false);
          root.current.removeEventListener('mousedown', handleDragStart);
        }
      }
    }
  });

  const style = {
    pos: interacting ? pos : spring(pos),
  };

  return (
    <div ref={root} {...props}>
      <Motion style={style}>
        {style => children && children(style.pos, go)}
      </Motion>
    </div>
  );
};