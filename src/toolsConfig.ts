import { Paths, type PathsType } from "./paths";

export interface ToolInfo {
  path: PathsType;
  label: string;
  description: string;
  category: ToolCategory;
}

export type ToolCategory =
  | "encoding"
  | "json"
  | "generators"
  | "converters"
  | "web"
  | "games"
  | "other";

export const categoryLabels: Record<ToolCategory, string> = {
  encoding: "Encoding & Decoding",
  json: "JSON Tools",
  generators: "Generators",
  converters: "Converters",
  web: "Web Development",
  games: "Games",
  other: "Other Tools",
};

export const tools: ToolInfo[] = [
  // Encoding & Decoding
  {
    path: Paths.Base64,
    label: "Base64 Encoder/Decoder",
    description: "Encode text to Base64 or decode Base64 to text",
    category: "encoding",
  },
  {
    path: Paths.URLEncoder,
    label: "URL Encoder/Decoder",
    description: "Encode or decode URL components",
    category: "encoding",
  },
  {
    path: Paths.JWTDecoder,
    label: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens",
    category: "encoding",
  },

  // Generators
  {
    path: Paths.TokenGen,
    label: "Token Generator",
    description: "Generate secure random tokens in various formats",
    category: "generators",
  },
  {
    path: Paths.UUIDGenerator,
    label: "UUID Generator",
    description: "Generate RFC 4122 version 4 UUIDs",
    category: "generators",
  },
  {
    path: Paths.HashGenerator,
    label: "Hash Generator",
    description: "Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes",
    category: "generators",
  },
  {
    path: Paths.QRCodeGenerator,
    label: "QR Code Generator",
    description: "Generate QR codes with custom colors and sizes",
    category: "generators",
  },
  {
    path: Paths.QRReader,
    label: "QR Code Reader",
    description: "Decode QR codes from images or camera",
    category: "converters",
  },

  // Converters
  {
    path: Paths.TimestampConverter,
    label: "Timestamp Converter",
    description: "Convert between Unix timestamps and dates",
    category: "converters",
  },
  {
    path: Paths.StringCaseConverter,
    label: "String Case Converter",
    description: "Convert text between camelCase, snake_case, etc.",
    category: "converters",
  },
  {
    path: Paths.SVGToJSX,
    label: "SVG Converter",
    description: "Convert SVG markup to React JSX",
    category: "converters",
  },
  {
    path: Paths.CSVToJSON,
    label: "CSV to JSON Converter",
    description: "Convert CSV data to JSON with header detection",
    category: "converters",
  },
  {
    path: Paths.YAMLToJSON,
    label: "YAML to JSON Converter",
    description: "Convert YAML configuration files to JSON",
    category: "converters",
  },
  {
    path: Paths.XMLToJSON,
    label: "XML to JSON Converter",
    description: "Convert XML documents to JSON with attribute options",
    category: "converters",
  },

  // JSON Tools
  {
    path: Paths.JSONPrettyPrint,
    label: "JSON Pretty Print",
    description: "Format and beautify JSON",
    category: "json",
  },
  {
    path: Paths.CookiesToJSON,
    label: "Cookies to JSON",
    description: "Parse cookie strings into JSON",
    category: "json",
  },
  {
    path: Paths.JSONParser,
    label: "JSON Parser",
    description: "Parse and validate JSON data",
    category: "json",
  },
  {
    path: Paths.JSONEditor,
    label: "JSON Editor",
    description: "Edit JSON by adding or removing fields and array items",
    category: "json",
  },

  // Web Development
  {
    path: Paths.URLComposer,
    label: "URL Composer",
    description: "Build URLs with query parameters",
    category: "web",
  },
  {
    path: Paths.Iframer,
    label: "Iframer",
    description: "Preview URLs in an iframe",
    category: "web",
  },
  {
    path: Paths.SignalRNotifier,
    label: "SignalR Notifier",
    description: "Connect and send messages via SignalR",
    category: "web",
  },
  {
    path: Paths.RegexTester,
    label: "Regex Tester",
    description: "Test regular expressions with live match highlighting",
    category: "web",
  },
  {
    path: Paths.ColorConverter,
    label: "Color Converter",
    description: "Convert between HEX, RGB, RGBA, HSL, and HSLA",
    category: "web",
  },
  {
    path: Paths.CurlToMarkdown,
    label: "cURL to Markdown",
    description: "Convert cURL commands to Markdown API documentation",
    category: "web",
  },
  {
    path: Paths.MarkdownPreview,
    label: "Markdown Preview",
    description: "Live preview of GitHub-flavored markdown",
    category: "converters",
  },
  {
    path: Paths.HTMLEntityEncoder,
    label: "HTML Entity Encoder/Decoder",
    description: "Convert special characters to/from HTML entities",
    category: "encoding",
  },
  {
    path: Paths.LoremIpsumGenerator,
    label: "Lorem Ipsum Generator",
    description: "Generate placeholder text for mockups",
    category: "generators",
  },
  {
    path: Paths.TextDiffViewer,
    label: "Text Diff Viewer",
    description: "Compare two texts with line-by-line highlighting",
    category: "other",
  },

  // Games
  {
    path: Paths.HedbanzGame,
    label: "Hedbanz - Adivina Quién",
    description: "Juego de adivinanzas donde los demás dan pistas sobre un personaje",
    category: "games",
  },
];

// Helper to get label by path (for Layout navigation)
export const getToolLabel = (path: PathsType): string => {
  if (path === Paths.Root) return "Home";
  const tool = tools.find((t) => t.path === path);
  return tool?.label ?? path;
};

// Get tools grouped by category
export const getToolsByCategory = (): Record<ToolCategory, ToolInfo[]> => {
  const grouped: Record<ToolCategory, ToolInfo[]> = {
    encoding: [],
    json: [],
    generators: [],
    converters: [],
    web: [],
    games: [],
    other: [],
  };

  for (const tool of tools) {
    grouped[tool.category].push(tool);
  }

  return grouped;
};
