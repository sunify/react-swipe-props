import React from 'react';
import { Router, Link } from '@reach/router';
import SlidersDemo from './slidersDemo';
import RoutesDemo from './routesDemo';

export default function App() {
  return (
    <>
      <menu className="menu">
        <Link to="/">Sliders</Link>
        <Link to="/pages">Pages</Link>
      </menu>
      <Router style={{ height: '100%' }}>
        <SlidersDemo path="/" />
        <RoutesDemo path="/pages" slide={0} />
        <RoutesDemo path="/pages/:slide" />
      </Router>
    </>
  );
}
