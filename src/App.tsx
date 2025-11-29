import { useEffect, lazy, Suspense, type FC } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Spinner } from "reactstrap";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { Paths } from "./paths";

// Lazy load all tool components for code splitting
const IFramer = lazy(() => import("./components/IFramer").then(m => ({ default: m.IFramer })));
const URLComposer = lazy(() => import("./components/URLComposer").then(m => ({ default: m.URLComposer })));
const TokenGen = lazy(() => import("./components/TokenGen").then(m => ({ default: m.TokenGen })));
const SVGToJSX = lazy(() => import("./components/SVGToJSX").then(m => ({ default: m.SVGToJSX })));
const JSONPrettyPrint = lazy(() => import("./components/JSONPrettyPrint").then(m => ({ default: m.JSONPrettyPrint })));
const CookiesToJSON = lazy(() => import("./components/CookiesToJSON").then(m => ({ default: m.CookiesToJSON })));
const JSONParser = lazy(() => import("./components/JSONParser").then(m => ({ default: m.JSONParser })));
const SignalRNotifier = lazy(() => import("./components/SignalRNotifier").then(m => ({ default: m.SignalRNotifier })));
const Base64 = lazy(() => import("./components/Base64").then(m => ({ default: m.Base64 })));
const UUIDGenerator = lazy(() => import("./components/UUIDGenerator").then(m => ({ default: m.UUIDGenerator })));
const HashGenerator = lazy(() => import("./components/HashGenerator").then(m => ({ default: m.HashGenerator })));
const JWTDecoder = lazy(() => import("./components/JWTDecoder").then(m => ({ default: m.JWTDecoder })));
const TimestampConverter = lazy(() => import("./components/TimestampConverter").then(m => ({ default: m.TimestampConverter })));
const URLEncoder = lazy(() => import("./components/URLEncoder").then(m => ({ default: m.URLEncoder })));
const StringCaseConverter = lazy(() => import("./components/StringCaseConverter").then(m => ({ default: m.StringCaseConverter })));
const RegexTester = lazy(() => import("./components/RegexTester").then(m => ({ default: m.RegexTester })));
const ColorConverter = lazy(() => import("./components/ColorConverter").then(m => ({ default: m.ColorConverter })));
const MarkdownPreview = lazy(() => import("./components/MarkdownPreview").then(m => ({ default: m.MarkdownPreview })));
const HTMLEntityEncoder = lazy(() => import("./components/HTMLEntityEncoder").then(m => ({ default: m.HTMLEntityEncoder })));
const LoremIpsumGenerator = lazy(() => import("./components/LoremIpsumGenerator").then(m => ({ default: m.LoremIpsumGenerator })));
const CSVToJSON = lazy(() => import("./components/CSVToJSON").then(m => ({ default: m.CSVToJSON })));
const QRCodeGenerator = lazy(() => import("./components/QRCodeGenerator").then(m => ({ default: m.QRCodeGenerator })));
const TextDiffViewer = lazy(() => import("./components/TextDiffViewer").then(m => ({ default: m.TextDiffViewer })));
const YAMLToJSON = lazy(() => import("./components/YAMLToJSON").then(m => ({ default: m.YAMLToJSON })));
const XMLToJSON = lazy(() => import("./components/XMLToJSON").then(m => ({ default: m.XMLToJSON })));

// Loading component for Suspense fallback
const LoadingFallback: FC = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
    <Spinner color="primary" />
  </div>
);

// Re-export for backwards compatibility
export { Paths, type PathsType } from "./paths";

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
        element: <Suspense fallback={<LoadingFallback />}><IFramer /></Suspense>,
      },
      {
        path: Paths.URLComposer,
        element: <Suspense fallback={<LoadingFallback />}><URLComposer /></Suspense>,
      },
      {
        path: Paths.TokenGen,
        element: <Suspense fallback={<LoadingFallback />}><TokenGen /></Suspense>,
      },
      {
        path: Paths.Base64,
        element: <Suspense fallback={<LoadingFallback />}><Base64 /></Suspense>,
      },
      {
        path: Paths.UUIDGenerator,
        element: <Suspense fallback={<LoadingFallback />}><UUIDGenerator /></Suspense>,
      },
      {
        path: Paths.HashGenerator,
        element: <Suspense fallback={<LoadingFallback />}><HashGenerator /></Suspense>,
      },
      {
        path: Paths.JWTDecoder,
        element: <Suspense fallback={<LoadingFallback />}><JWTDecoder /></Suspense>,
      },
      {
        path: Paths.TimestampConverter,
        element: <Suspense fallback={<LoadingFallback />}><TimestampConverter /></Suspense>,
      },
      {
        path: Paths.URLEncoder,
        element: <Suspense fallback={<LoadingFallback />}><URLEncoder /></Suspense>,
      },
      {
        path: Paths.StringCaseConverter,
        element: <Suspense fallback={<LoadingFallback />}><StringCaseConverter /></Suspense>,
      },
      {
        path: Paths.SVGToJSX,
        element: <Suspense fallback={<LoadingFallback />}><SVGToJSX /></Suspense>,
      },
      {
        path: Paths.JSONPrettyPrint,
        element: <Suspense fallback={<LoadingFallback />}><JSONPrettyPrint /></Suspense>,
      },
      {
        path: Paths.CookiesToJSON,
        element: <Suspense fallback={<LoadingFallback />}><CookiesToJSON /></Suspense>,
      },
      {
        path: Paths.JSONParser,
        element: <Suspense fallback={<LoadingFallback />}><JSONParser /></Suspense>,
      },
      {
        path: Paths.SignalRNotifier,
        element: <Suspense fallback={<LoadingFallback />}><SignalRNotifier /></Suspense>,
      },
      {
        path: Paths.RegexTester,
        element: <Suspense fallback={<LoadingFallback />}><RegexTester /></Suspense>,
      },
      {
        path: Paths.ColorConverter,
        element: <Suspense fallback={<LoadingFallback />}><ColorConverter /></Suspense>,
      },
      {
        path: Paths.MarkdownPreview,
        element: <Suspense fallback={<LoadingFallback />}><MarkdownPreview /></Suspense>,
      },
      {
        path: Paths.HTMLEntityEncoder,
        element: <Suspense fallback={<LoadingFallback />}><HTMLEntityEncoder /></Suspense>,
      },
      {
        path: Paths.LoremIpsumGenerator,
        element: <Suspense fallback={<LoadingFallback />}><LoremIpsumGenerator /></Suspense>,
      },
      {
        path: Paths.CSVToJSON,
        element: <Suspense fallback={<LoadingFallback />}><CSVToJSON /></Suspense>,
      },
      {
        path: Paths.QRCodeGenerator,
        element: <Suspense fallback={<LoadingFallback />}><QRCodeGenerator /></Suspense>,
      },
      {
        path: Paths.TextDiffViewer,
        element: <Suspense fallback={<LoadingFallback />}><TextDiffViewer /></Suspense>,
      },
      {
        path: Paths.YAMLToJSON,
        element: <Suspense fallback={<LoadingFallback />}><YAMLToJSON /></Suspense>,
      },
      {
        path: Paths.XMLToJSON,
        element: <Suspense fallback={<LoadingFallback />}><XMLToJSON /></Suspense>,
      },
    ],
  },
]);

const App: FC = () => {
  useEffect(() => {
    document.body.setAttribute("data-bs-theme", "dark");
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default App;
