import React, { useState, useEffect, useRef } from 'react';
import tween from 'tweeen';

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export default function ReactSwipeProps({
  children,
  pos: propsPos = 0,
  min,
  max,
  transitionEnd,
  slideDuration = 300,
  discrete = false,
  swiping,
  direction = 'horizontal',
  easing = easeInOutQuad,
  ...props
}) {
  const [pos, setPos] = useState(min);
  const [interacting, setInteracting] = useState(false);
  const [dst, setDst] = useState(min);
  const root = useRef(null);

  const slide = (from, to) => {
    if (discrete) {
      setPos(to);
      if (transitionEnd) {
        transitionEnd(to);
      }
    } else {
      return tween(
        from,
        to,
        v => {
          setPos(v);

          if (v === to) {
            if (transitionEnd) {
              transitionEnd(to);
            }
          }
        },
        {
          duration: slideDuration,
          easing
        }
      );
    }
  };

  const go = pos => {
    setDst(pos);
    if (discrete) {
      setPos(pos);
    }
  };

  useEffect(
    () => {
      const nextPos = Math.min(Math.max(Math.round(propsPos), min), max);
      if (nextPos !== pos) {
        setDst(nextPos);
      }

      if (nextPos !== propsPos && transitionEnd) {
        transitionEnd(nextPos);
      }
    },
    [propsPos]
  );

  useEffect(
    () => {
      if (dst !== pos) {
        const stop = slide(pos, dst);

        return stop;
      }
    },
    [dst, propsPos]
  );

  const limitPos = n => Math.min(Math.max(Math.round(n), min), max);

  useEffect(() => {
    const handlerOptions = { passive: false };
    const handleDragStart = e => {
      if ((!e.touches && e.button !== 0) || !root.current) {
        return;
      }
      const rect = root.current.getBoundingClientRect();
      const { pageX, pageY } = e.touches ? e.touches[0] : e;
      const directionValue = (horizontalValue, verticalValue) =>
        direction === 'horizontal' ? horizontalValue : verticalValue;
      const state = {
        x: pageX,
        y: pageY,
        pos: directionValue(pageX, pageY),
        dragging: false,
        delta: 0
      };
      const startTime = Date.now();

      const calcSpeed = delta => {
        const currentPos = pos + state.delta;
        if (currentPos <= min && delta < 0) {
          return Math.max(0, 0.3 + state.delta / 2);
        } else if (currentPos >= max && delta > 0) {
          return Math.max(0, 0.3 - state.delta / 2);
        }

        return 1;
      };

      const removeListeners = () => {
        document.removeEventListener('touchmove', handleMove, handlerOptions);
        document.removeEventListener('touchend', handleEnd, handlerOptions);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
      };

      const handleMove = e => {
        const { pageX, pageY } = e.touches ? e.touches[0] : e;
        const delta = state.pos - directionValue(pageX, pageY);
        if (state.dragging) {
          e.preventDefault();
          const deltaPos = delta / directionValue(rect.width, rect.height);
          const speed = calcSpeed(deltaPos);
          state.delta += deltaPos * speed;
          state.pos = directionValue(pageX, pageY);
          state.x = pageX;
          state.y = pageY;

          if (typeof swiping === 'function') {
            swiping(pos + state.delta);
          }

          if (!discrete) {
            setPos(pos + state.delta);
            setDst(pos + state.delta);
          }
        } else {
          if (e.touches) {
            const dx = state.x - pageX;
            const dy = state.y - pageY;
            if (
              !(e.touches.length > 1 || (e.scale && e.scale !== 1)) &&
              Math.abs(directionValue(dx, dy)) >
                Math.abs(directionValue(dy, dx))
            ) {
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
      };

      const finish = value => {
        if (discrete) {
          setPos(value);
          if (typeof transitionEnd === 'function') {
            transitionEnd(value);
          }
        }
        setDst(value);
      };

      const handleEnd = () => {
        const final = limitPos(Math.round(pos + state.delta));

        if (
          final === pos &&
          Date.now() - startTime < 250 &&
          Math.abs(state.delta * directionValue(rect.width, rect.height)) > 30
        ) {
          finish(limitPos(final + Math.sign(state.delta)));
        } else {
          finish(final);
        }
        setInteracting(false);
        removeListeners();
      };

      document.addEventListener('touchmove', handleMove, handlerOptions);
      document.addEventListener('touchend', handleEnd, handlerOptions);
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    };

    if ((root.current && !interacting) || pos !== dst) {
      root.current.addEventListener(
        'touchstart',
        handleDragStart,
        handlerOptions
      );
      root.current.addEventListener('touchforcechange', () => undefined, false);
      root.current.addEventListener('mousedown', handleDragStart);

      return () => {
        if (root.current) {
          root.current.removeEventListener(
            'touchstart',
            handleDragStart,
            handlerOptions
          );
          root.current.removeEventListener(
            'touchforcechange',
            () => undefined,
            false
          );
          root.current.removeEventListener('mousedown', handleDragStart);
        }
      };
    }
  });

  return (
    <div ref={root} {...props}>
      {children && children(pos, go, interacting)}
    </div>
  );
}
