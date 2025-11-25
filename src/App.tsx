import { useEffect, type FC } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { IFramer } from "./components/IFramer";
import { URLComposer } from "./components/URLComposer";
import { TokenGen } from "./components/TokenGen";
import { SVGToJSX } from "./components/SVGToJSX";
import { JSONPrettyPrint } from "./components/JSONPrettyPrint";
import { CookiesToJSON } from "./components/CookiesToJSON";
import { JSONParser } from "./components/JSONParser";
import { SignalRNotifier } from "./components/SignalRNotifier";
import { Base64 } from "./components/Base64";
import { UUIDGenerator } from "./components/UUIDGenerator";
import { HashGenerator } from "./components/HashGenerator";
import { JWTDecoder } from "./components/JWTDecoder";
import { TimestampConverter } from "./components/TimestampConverter";
import { URLEncoder } from "./components/URLEncoder";
import { StringCaseConverter } from "./components/StringCaseConverter";

export const Paths = {
  Root: "/",
  Iframer: "/iframer",
  URLComposer: "/url-composer",
  TokenGen: "/token-generator",
  Base64: "/base64",
  UUIDGenerator: "/uuid-generator",
  HashGenerator: "/hash-generator",
  JWTDecoder: "/jwt-decoder",
  TimestampConverter: "/timestamp-converter",
  URLEncoder: "/url-encoder",
  StringCaseConverter: "/string-case-converter",
  SVGToJSX: "/svg-converter",
  JSONPrettyPrint: "/json-pretty-print",
  CookiesToJSON: "/cookies-to-json",
  JSONParser: "/json-parser",
  SignalRNotifier: "/signalr-notifier",
} as const;

// For type usage
export type PathsType = (typeof Paths)[keyof typeof Paths];

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
        path: Paths.Base64,
        element: <Base64 />,
      },
      {
        path: Paths.UUIDGenerator,
        element: <UUIDGenerator />,
      },
      {
        path: Paths.HashGenerator,
        element: <HashGenerator />,
      },
      {
        path: Paths.JWTDecoder,
        element: <JWTDecoder />,
      },
      {
        path: Paths.TimestampConverter,
        element: <TimestampConverter />,
      },
      {
        path: Paths.URLEncoder,
        element: <URLEncoder />,
      },
      {
        path: Paths.StringCaseConverter,
        element: <StringCaseConverter />,
      },
      {
        path: Paths.SVGToJSX,
        element: <SVGToJSX />,
      },
      {
        path: Paths.JSONPrettyPrint,
        element: <JSONPrettyPrint />,
      },
      {
        path: Paths.CookiesToJSON,
        element: <CookiesToJSON />,
      },
      {
        path: Paths.JSONParser,
        element: <JSONParser />,
      },
      {
        path: Paths.SignalRNotifier,
        element: <SignalRNotifier />,
      },
    ],
  },
]);

const App: FC = () => {
  useEffect(() => {
    document.body.setAttribute("data-bs-theme", "dark");
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
