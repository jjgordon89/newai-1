import { RouteObject } from "react-router-dom";

// This file contains routes that are only used in Tempo
// These routes will not be included in your production build
const routes: RouteObject[] = [
  {
    path: "/tempobook/*",
    element: <div>Tempo Storybook</div>,
  },
];

export default routes;
