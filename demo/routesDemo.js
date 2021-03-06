import React from 'react';
import RSWP from '../src/swipeProps';
import lerpColor from '@sunify/lerp-color';
import { Link } from '@reach/router';
import { makeUrl } from './utils';

const range = (from, to) =>
  Array.from(new Array(to - from), (_, i) => i + from);

export default function RoutesDemo({ slide, navigate }) {
  const count = 6;
  const go = pos => {
    if (pos !== Number(slide)) {
      if (pos) {
        navigate(makeUrl(`/pages/${pos}`));
      } else {
        navigate(makeUrl(`/pages`));
      }
    }
  };

  return (
    <RSWP
      pos={Number(slide)}
      min={0}
      max={count - 1}
      tabIndex={0}
      transitionEnd={go}
      className="routesDemo"
      direction="vertical"
    >
      {pos => (
        <div
          className="pages"
          style={{
            backgroundColor: lerpColor(
              '#6a19ad',
              'rgb(19, 197, 82)',
              Math.max(0, Math.min(1, pos / (count - 1)))
            )
          }}
        >
          <menu>
            {range(0, count).map(i => (
              <Link to={makeUrl(i ? `/pages/${i}` : `/pages`)} key={i}>
                Page {i + 1}
              </Link>
            ))}
          </menu>
          <div
            className="pagesShaft"
            style={{
              height: `${count * 100}%`,
              transform: `translate3d(0, ${-pos * (100 / count)}%, 0.01px)`
            }}
          >
            {range(0, count).map(i => (
              <div className="page" key={i}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}
    </RSWP>
  );
}
