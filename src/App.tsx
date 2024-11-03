import { FC } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { IFramer } from "./components/IFramer";
import { URLComposer } from "./components/URLComposer";
import { TokenGen } from "./components/TokenGen";
import { SVGToJSX } from "./components/SVGToJSX";
import { JSONPrettyPrint } from "./components/JSONPrettyPrint";

export enum Paths {
  Root = "/",
  Iframer = "/iframer",
  URLComposer = "/url-composer",
  TokenGen = "/token-generator",
  SVGToJSX = "/svg-converter",
  JSONPrettyPrint = "/json-pretty-print",
}

const router = createBrowserRouter([
  {
    path: Paths.Root,
    element: <Layout />,
    children: [
      {
        path: Paths.Root,
        element: <Home />,
      },
      {
        path: Paths.Iframer,
        element: <IFramer />,
      },
      {
        path: Paths.URLComposer,
        element: <URLComposer />,
      },
      {
        path: Paths.TokenGen,
        element: <TokenGen />,
      },
      {
        path: Paths.SVGToJSX,
        element: <SVGToJSX />,
      },
      {
        path: Paths.JSONPrettyPrint,
        element: <JSONPrettyPrint />,
      },
    ],
  },
]);

const App: FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
