declare module 'react-swipe-props' {
  export type SwipeProps = {
    children?: (
      pos: number,
      slide?: (n: number) => void,
      dragging?: boolean
    ) => React.ReactNode;
    pos?: number;
    slideDuration?: number;
    min: number;
    max: number;
    transitionEnd?: (pos: number) => void;
  } & React.HTMLProps<HTMLDivElement>;

  const ReactSwipeProps: React.FC<SwipeProps>;

  export default ReactSwipeProps;
}
