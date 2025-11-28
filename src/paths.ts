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
  RegexTester: "/regex-tester",
  ColorConverter: "/color-converter",
  MarkdownPreview: "/markdown-preview",
} as const;

export type PathsType = (typeof Paths)[keyof typeof Paths];
