declare module 'react-swipe-props' {
  export type SwipeProps = {
    children?: (pos: number) => React.ReactNode;
    pos?: number;
    min: number;
    max: number;
    transitionEnd?: (pos: number) => void;
  } & React.HTMLProps<HTMLDivElement>;

  const ReactSwipeProps: React.FC<SwipeProps>;

  export default ReactSwipeProps;
}
