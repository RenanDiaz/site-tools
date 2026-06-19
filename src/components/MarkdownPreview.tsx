import type { ChangeEvent, FC } from "react";
import { useState, useMemo, useEffect, useRef } from "react";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import DOMPurify from "dompurify";
import "highlight.js/styles/github-dark.css";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Row,
  Spinner,
  Tooltip,
} from "reactstrap";
import styled, { css } from "styled-components";
import { CopyIcon } from "./Images";
import { useRevertableState } from "../utility/useRevertableState";

// Shared GitHub-flavored markdown styling, themed via Bootstrap CSS variables.
const githubMarkdownStyles = css`
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 {
    font-size: 2rem;
    border-bottom: 1px solid var(--bs-border-color);
    padding-bottom: 0.3rem;
  }

  h2 {
    font-size: 1.5rem;
    border-bottom: 1px solid var(--bs-border-color);
    padding-bottom: 0.3rem;
  }

  h3 { font-size: 1.25rem; }
  h4 { font-size: 1rem; }
  h5 { font-size: 0.875rem; }
  h6 { font-size: 0.85rem; color: var(--bs-secondary-color); }

  p {
    margin-bottom: 1rem;
  }

  ul, ol {
    padding-left: 2rem;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.25rem;
  }

  code {
    background-color: rgba(110, 118, 129, 0.2);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-size: 85%;
  }

  pre {
    background-color: #0d1117;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  pre code {
    padding: 0;
    background-color: transparent;
  }

  blockquote {
    padding: 0 1rem;
    border-left: 0.25rem solid var(--bs-border-color);
    color: var(--bs-secondary-color);
    margin-bottom: 1rem;
  }

  hr {
    border: 0;
    border-top: 1px solid var(--bs-border-color);
    margin: 1.5rem 0;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1rem;
  }

  table th,
  table td {
    padding: 0.5rem;
    border: 1px solid var(--bs-border-color);
  }

  table th {
    background-color: rgba(110, 118, 129, 0.1);
    font-weight: 600;
  }

  a {
    color: var(--bs-link-color);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

const CustomTextarea = styled(Input)`
  field-sizing: content;
  min-height: 400px;
  max-height: 600px;
  font-family: monospace;
`;

const PreviewContainer = styled.div`
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem;

  ${githubMarkdownStyles}
`;

const FullscreenOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bs-body-bg);
  z-index: 1050;
  display: ${(props) => (props.isOpen ? "flex" : "none")};
  flex-direction: column;
  padding: 1rem;
`;

const FullscreenHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--bs-border-color);
`;

const FullscreenPreview = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;

  ${githubMarkdownStyles}
`;

// Off-screen container rendered with explicit light-theme colors so the
// exported PDF is legible regardless of the app's active theme.
const PdfContent = styled.div`
  position: absolute;
  left: -9999px;
  top: 0;
  width: 800px;
  padding: 40px;
  background-color: #ffffff;
  color: #1f2328;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
    sans-serif;

  ${githubMarkdownStyles}

  /* Explicit light-theme overrides applied after the shared (theme-variable)
     styles so they win regardless of the app's active Bootstrap theme. */
  h6 { color: #59636e; }

  h1,
  h2 {
    border-bottom: 1px solid #d0d7de;
  }

  code {
    background-color: rgba(129, 139, 152, 0.2);
  }

  /* Keep code blocks dark to match the github-dark highlight theme. */
  pre {
    color: #e6edf3;
  }

  blockquote {
    border-left: 0.25rem solid #d0d7de;
    color: #59636e;
  }

  hr {
    border-top: 1px solid #d0d7de;
  }

  table th,
  table td {
    border: 1px solid #d0d7de;
  }

  table th {
    background-color: #f6f8fa;
  }

  a {
    color: #0969da;
  }
`;

type ViewMode = "split" | "preview" | "edit";

const defaultMarkdown = `# Markdown Preview

Welcome to the **Markdown Preview** tool!

## Features

- Live preview as you type
- GitHub-flavored markdown support
- Sanitized HTML output
- Copy HTML to clipboard
- Fullscreen preview mode

## Formatting Examples

### Text Styles

*Italic text* or _italic text_

**Bold text** or __bold text__

***Bold and italic*** or ___bold and italic___

~~Strikethrough~~

### Lists

#### Unordered List
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

#### Ordered List
1. First item
2. Second item
3. Third item

### Links and Images

[Link to Anthropic](https://www.anthropic.com)

![Alt text for image](https://via.placeholder.com/150)

### Code

Inline \`code\` with backticks.

\`\`\`javascript
// Code block
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Blockquotes

> This is a blockquote.
>
> It can span multiple lines.

### Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Horizontal Rule

---

That's it! Start typing to see your markdown rendered below.
`;

// Configure marked with syntax highlighting
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
  {
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert \n to <br>
  }
);

export const MarkdownPreview: FC = () => {
  const [markdown, setMarkdown] = useState<string>(defaultMarkdown);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleMarkdownChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    setMarkdown(currentTarget.value);
  };

  const html = useMemo(() => {
    const rawHtml = marked.parse(markdown) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [markdown]);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html);
    setTooltipOpen(true);
  };

  const handleClear = () => {
    setMarkdown("");
  };

  const handleExportPdf = async () => {
    if (!pdfRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const { default: html2pdf } = await import("html2pdf.js");
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: "markdown.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          enableLinks: true,
        })
        .from(pdfRef.current)
        .save();
    } finally {
      setIsExporting(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  return (
    <>
      <h2>Markdown Preview</h2>
      <p>Write GitHub-flavored markdown with live preview.</p>

      <FormGroup>
        <Row className="g-2 mb-3">
          <Col xs="auto">
            <ButtonGroup>
              <Button
                color={viewMode === "split" ? "primary" : "secondary"}
                onClick={() => setViewMode("split")}
              >
                Split
              </Button>
              <Button
                color={viewMode === "edit" ? "primary" : "secondary"}
                onClick={() => setViewMode("edit")}
              >
                Edit
              </Button>
              <Button
                color={viewMode === "preview" ? "primary" : "secondary"}
                onClick={() => setViewMode("preview")}
              >
                Preview
              </Button>
            </ButtonGroup>
          </Col>
          <Col xs="auto">
            <Button color="secondary" onClick={handleClear}>
              Clear
            </Button>
          </Col>
          <Col xs="auto">
            <Button color="secondary" onClick={toggleFullscreen}>
              ⛶ Fullscreen
            </Button>
          </Col>
          <Col xs="auto">
            <Button color="secondary" onClick={handleExportPdf} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Spinner size="sm" /> Exporting…
                </>
              ) : (
                "⬇ Export PDF"
              )}
            </Button>
          </Col>
          <Col xs="auto">
            <Button color="primary" onClick={handleCopyHtml} id="copyHtmlTooltip">
              <CopyIcon /> Copy HTML
            </Button>
            <Tooltip placement="top" isOpen={tooltipOpen} target="copyHtmlTooltip" autohide={false}>
              Copied!
            </Tooltip>
          </Col>
        </Row>
      </FormGroup>

      <Row>
        {(viewMode === "split" || viewMode === "edit") && (
          <Col md={viewMode === "split" ? 6 : 12}>
            <Card className="mb-3">
              <CardHeader>Markdown</CardHeader>
              <CardBody className="p-0">
                <CustomTextarea
                  type="textarea"
                  className="form-control border-0"
                  value={markdown}
                  onChange={handleMarkdownChange}
                  placeholder="# Start typing markdown here..."
                />
              </CardBody>
            </Card>
          </Col>
        )}

        {(viewMode === "split" || viewMode === "preview") && (
          <Col md={viewMode === "split" ? 6 : 12}>
            <Card>
              <CardHeader>Preview</CardHeader>
              <CardBody className="p-0">
                <PreviewContainer dangerouslySetInnerHTML={{ __html: html }} />
              </CardBody>
            </Card>
          </Col>
        )}
      </Row>

      {/* Fullscreen Overlay */}
      <FullscreenOverlay isOpen={isFullscreen}>
        <FullscreenHeader>
          <h3 className="mb-0">Markdown Preview</h3>
          <Button color="secondary" onClick={toggleFullscreen}>
            ✕ Close (Esc)
          </Button>
        </FullscreenHeader>
        <FullscreenPreview dangerouslySetInnerHTML={{ __html: html }} />
      </FullscreenOverlay>

      {/* Off-screen, light-themed render source for PDF export */}
      <PdfContent ref={pdfRef} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
};
