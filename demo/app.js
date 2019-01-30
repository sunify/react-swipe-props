import React from 'react';
import { Router, Link } from '@reach/router';
import SlidersDemo from './slidersDemo';
import RoutesDemo from './routesDemo';
import { makeUrl } from './utils';

export default function App() {
  return (
    <>
      <menu className="menu">
        <Link to={makeUrl('/')}>Sliders</Link>
        <Link to={makeUrl('/pages')}>Pages</Link>
      </menu>
      <Router style={{ height: '100%' }} basepath={process.env.BASE_PATH || ''}>
        <SlidersDemo path="/" />
        <RoutesDemo path="/pages" slide={0} />
        <RoutesDemo path="/pages/:slide" />
      </Router>
    </>
  );
}
