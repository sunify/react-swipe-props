import React, { useState, useEffect, useRef } from 'react';

export default function ReactSwipeProps({ children, pos: propsPos, min, max, transitionEnd }) {
  const [pos, setPos] = useState(min);
  const root = useRef(null);

  const go = (i) => {
    const n = Math.min(Math.max(Math.round(i), min), max);
    console.log('go', n, pos);
    setPos(n);
    transitionEnd(n);
  }

  useEffect(() => {
    if (propsPos !== pos) {
      go(propsPos);
    }
  }, [propsPos]);

  useEffect(() => {
    const state = { x: 0, y: 0, dragging: false };
    const handleDragStart = (e) => {
      e.preventDefault();
      state.x = e.pageX;
      state.y = e.pageY;
      state.dragging = true;
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    };

    const handleMove = (e) => {
      if (state.dragging) {
        e.preventDefault();
        const delta = e.pageX - state.x;
        console.log(pos - delta / 500 * 2);
        setPos(pos - delta / 500 * 2);
      }
    }

    const handleEnd = (e) => {
      state.dragging = false;
      const delta = e.pageX - state.x;
      go(pos - delta / 500 * 2);
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