import React from 'react';

type MotionProps = React.HTMLAttributes<HTMLElement> & {
  animate?: unknown;
  exit?: unknown;
  initial?: unknown;
  layout?: unknown;
  transition?: unknown;
};

const createMotionComponent = (tag: keyof HTMLElementTagNameMap) =>
  React.forwardRef<HTMLElement, MotionProps>(function MotionComponent(props, ref) {
    const {animate, exit, initial, layout, transition, ...domProps} = props;

    void animate;
    void exit;
    void initial;
    void layout;
    void transition;

    return React.createElement(tag, {...domProps, ref}, props.children);
  });

export const AnimatePresence = ({children}: {children?: React.ReactNode}) =>
  React.createElement(React.Fragment, null, children);

export const motion = new Proxy(
  {},
  {
    get: (_, tag: string) => createMotionComponent(tag as keyof HTMLElementTagNameMap),
  },
) as Record<string, React.ComponentType<MotionProps>>;

export const m = motion;
