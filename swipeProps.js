"use strict";

exports.__esModule = true;
exports.default = ReactSwipeProps;

var _react = _interopRequireWildcard(require("react"));

var _runWithFps = _interopRequireDefault(require("run-with-fps"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function easeInOutQuad(t) {
  return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function tween(from, to, duration, cb) {
  var stopped = false;
  var start = Date.now();
  var stop = (0, _runWithFps.default)(function () {
    var spent = Math.min(Date.now() - start, duration);
    cb(from + (to - from) * easeInOutQuad(spent / duration));

    if (spent === duration || stopped) {
      stop();
    }
  }, 60);
  return function () {
    stopped = true;
  };
}

var useBoundingClientRect = function useBoundingClientRect(ref) {
  var _useState = (0, _react.useState)(null),
      rect = _useState[0],
      setRect = _useState[1];

  (0, _react.useEffect)(function () {
    var updateRect = function updateRect() {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return function () {
      window.removeEventListener('resize', updateRect);
    };
  }, [ref.current]);
  return rect;
};

function ReactSwipeProps(_ref) {
  var children = _ref.children,
      _ref$pos = _ref.pos,
      propsPos = _ref$pos === void 0 ? 0 : _ref$pos,
      min = _ref.min,
      max = _ref.max,
      transitionEnd = _ref.transitionEnd,
      _ref$slideDuration = _ref.slideDuration,
      slideDuration = _ref$slideDuration === void 0 ? 300 : _ref$slideDuration,
      _ref$discrete = _ref.discrete,
      discrete = _ref$discrete === void 0 ? false : _ref$discrete,
      swiping = _ref.swiping,
      props = _objectWithoutPropertiesLoose(_ref, ["children", "pos", "min", "max", "transitionEnd", "slideDuration", "discrete", "swiping"]);

  var _useState2 = (0, _react.useState)(min),
      pos = _useState2[0],
      setPos = _useState2[1];

  var _useState3 = (0, _react.useState)(false),
      interacting = _useState3[0],
      setInteracting = _useState3[1];

  var _useState4 = (0, _react.useState)(min),
      dst = _useState4[0],
      setDst = _useState4[1];

  var root = (0, _react.useRef)(null);
  var rect = useBoundingClientRect(root);

  var slide = function slide(from, to) {
    if (discrete) {
      setPos(to);
      transitionEnd(to);
    } else {
      return tween(from, to, Math.max(1, Math.min(2, Math.abs(from - to))) * slideDuration, function (v) {
        setPos(v);

        if (v === to && transitionEnd) {
          transitionEnd(to);
        }
      });
    }
  };

  var go = function go(pos) {
    setDst(pos);

    if (discrete) {
      setPos(pos);
    }
  };

  (0, _react.useEffect)(function () {
    var nextPos = Math.min(Math.max(Math.round(propsPos), min), max);

    if (nextPos !== pos) {
      setDst(nextPos);
    }

    if (nextPos !== propsPos && transitionEnd) {
      transitionEnd(nextPos);
    }
  }, [propsPos]);
  (0, _react.useEffect)(function () {
    if (dst !== pos) {
      var stop = slide(pos, dst);
      return stop;
    }
  }, [dst, propsPos]);

  var limitPos = function limitPos(n) {
    return Math.min(Math.max(Math.round(n), min), max);
  };

  (0, _react.useEffect)(function () {
    var handlerOptions = {
      passive: false
    };

    var handleDragStart = function handleDragStart(e) {
      if (!e.touches && e.button !== 0) {
        return;
      }

      var _ref2 = e.touches ? e.touches[0] : e,
          pageX = _ref2.pageX,
          pageY = _ref2.pageY;

      var state = {
        x: pageX,
        y: pageY,
        dragging: false,
        delta: 0
      };
      var startTime = Date.now();

      var calcSpeed = function calcSpeed(delta) {
        var currentPos = pos + state.delta;

        if (currentPos <= min && delta < 0) {
          return Math.max(0, 0.3 + state.delta / 2);
        } else if (currentPos >= max && delta > 0) {
          return Math.max(0, 0.3 - state.delta / 2);
        }

        return 1;
      };

      var removeListeners = function removeListeners() {
        document.removeEventListener('touchmove', handleMove, handlerOptions);
        document.removeEventListener('touchend', handleEnd, handlerOptions);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
      };

      var handleMove = function handleMove(e) {
        var _ref3 = e.touches ? e.touches[0] : e,
            pageX = _ref3.pageX,
            pageY = _ref3.pageY;

        var deltaX = state.x - pageX;
        var deltaY = state.y - pageY;

        if (state.dragging) {
          e.preventDefault();
          var deltaPos = deltaX / rect.width;
          var speed = calcSpeed(deltaPos);
          state.delta += deltaPos * speed;
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
            if (!(e.touches.length > 1 || e.scale && e.scale !== 1) && Math.abs(deltaX) > Math.abs(deltaY)) {
              e.preventDefault();
              state.dragging = true;
            } else {
              removeListeners();
            }
          } else {
            setInteracting(true);
            state.dragging = true;
          }
        }
      };

      var finish = function finish(value) {
        if (discrete) {
          setPos(value);

          if (typeof transitionEnd === 'function') {
            transitionEnd(value);
          }
        }

        setDst(value);
      };

      var handleEnd = function handleEnd() {
        var final = limitPos(Math.round(pos + state.delta));

        if (final === pos && Date.now() - startTime < 250 && Math.abs(state.delta * rect.width) > 30) {
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

    if (root.current && !interacting || pos !== dst) {
      root.current.addEventListener('touchstart', handleDragStart, handlerOptions);
      root.current.addEventListener('touchforcechange', function () {
        return undefined;
      }, false);
      root.current.addEventListener('mousedown', handleDragStart);
      return function () {
        if (root.current) {
          root.current.removeEventListener('touchstart', handleDragStart, handlerOptions);
          root.current.removeEventListener('touchforcechange', function () {
            return undefined;
          }, false);
          root.current.removeEventListener('mousedown', handleDragStart);
        }
      };
    }
  });
  return _react.default.createElement("div", _extends({
    ref: root
  }, props), children && children(pos, go));
}

;