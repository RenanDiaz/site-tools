import type { FC } from "react";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
  Tooltip,
} from "reactstrap";
import styled from "styled-components";
import { CopyIcon } from "./Images";
import { useRevertableState } from "../utility/useRevertableState";

const StyledTextarea = styled(Input)`
  font-family: monospace;
  font-size: 0.85rem;
`;

const OutputPre = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

interface ParsedCurl {
  method: string;
  url: string;
  path: string;
  body: string | null;
  contentType: string | null;
}

const parseCurl = (curlCommand: string): ParsedCurl | null => {
  try {
    // Normalize the curl command - remove line continuations and extra whitespace
    const normalized = curlCommand
      .replace(/\\\n/g, " ")
      .replace(/\\\r\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Extract URL - look for quoted URL after 'curl' or unquoted URL
    let url = "";
    const urlMatch = normalized.match(/curl\s+(?:(?:-[A-Za-z]\s+\S+\s+)*)?['"]?([^'">\s]+)['"]?/i);
    if (urlMatch) {
      url = urlMatch[1];
    }

    // Also try to find URL in a different pattern (after options)
    if (!url || url.startsWith("-")) {
      const altUrlMatch = normalized.match(/['"]?(https?:\/\/[^'">\s]+)['"]?/);
      if (altUrlMatch) {
        url = altUrlMatch[1];
      }
    }

    // Extract path from URL
    let path = "/";
    try {
      const urlObj = new URL(url);
      path = urlObj.pathname + urlObj.search;
    } catch {
      // If URL parsing fails, try to extract path directly
      const pathMatch = url.match(/(?:https?:\/\/[^\/]+)?(\/[^\s]*)/);
      if (pathMatch) {
        path = pathMatch[1];
      }
    }

    // Extract method - look for -X or --request
    let method = "GET";
    const methodMatch = normalized.match(/(?:-X|--request)\s+['"]?(\w+)['"]?/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
    }

    // Extract body - look for --data-raw, --data, -d
    let body: string | null = null;
    const bodyPatterns = [
      /--data-raw\s+'([^']+)'/,
      /--data-raw\s+"([^"]+)"/,
      /--data\s+'([^']+)'/,
      /--data\s+"([^"]+)"/,
      /-d\s+'([^']+)'/,
      /-d\s+"([^"]+)"/,
    ];

    for (const pattern of bodyPatterns) {
      const bodyMatch = normalized.match(pattern);
      if (bodyMatch) {
        body = bodyMatch[1];
        break;
      }
    }

    // If there's a body but no explicit method, assume POST
    if (body && method === "GET") {
      method = "POST";
    }

    // Try to format JSON body
    if (body) {
      try {
        const parsed = JSON.parse(body);
        body = JSON.stringify(parsed, null, 2);
      } catch {
        // Keep original body if not valid JSON
      }
    }

    // Extract Content-Type header
    let contentType: string | null = null;
    const contentTypeMatch = normalized.match(/-H\s+['"]Content-Type:\s*([^'"]+)['"]/i);
    if (contentTypeMatch) {
      contentType = contentTypeMatch[1].trim();
    }

    return { method, url, path, body, contentType };
  } catch {
    return null;
  }
};

const generateMarkdown = (
  parsed: ParsedCurl,
  response: string | null,
  includeResponse: boolean
): string => {
  let markdown = `### ${parsed.method} ${parsed.path}\n`;

  if (parsed.body) {
    markdown += `\n**Body**\n\`\`\`json\n${parsed.body}\n\`\`\`\n`;
  }

  if (includeResponse && response) {
    let formattedResponse = response;
    try {
      const parsed = JSON.parse(response);
      formattedResponse = JSON.stringify(parsed, null, 2);
    } catch {
      // Keep original if not valid JSON
    }
    markdown += `\n**Response**\n\`\`\`json\n${formattedResponse}\n\`\`\`\n`;
  }

  return markdown;
};

export const CurlToMarkdown: FC = () => {
  const [curlInput, setCurlInput] = useState<string>("");
  const [responseInput, setResponseInput] = useState<string>("");
  const [includeResponse, setIncludeResponse] = useState<boolean>(false);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleConvert = () => {
    if (!curlInput.trim()) {
      setError("Please enter a cURL command");
      setOutput("");
      return;
    }

    const parsed = parseCurl(curlInput);
    if (!parsed) {
      setError("Could not parse cURL command");
      setOutput("");
      return;
    }

    if (!parsed.url && !parsed.path) {
      setError("Could not extract URL from cURL command");
      setOutput("");
      return;
    }

    setError("");
    const markdown = generateMarkdown(
      parsed,
      responseInput.trim() || null,
      includeResponse
    );
    setOutput(markdown);
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setTooltipOpen(true);
    }
  };

  const handleLoadExample = () => {
    const example = `curl 'http://localhost:6050/api/admin/createCustomer' \\
  -H 'Accept: */*' \\
  -H 'Content-Type: application/json' \\
  -H 'Origin: http://localhost:6050' \\
  --data-raw '{"account_number":"19920326","verifiable_account_number":false,"templateId":2,"Template":1}'`;
    setCurlInput(example);
    setResponseInput('{"created": true, "id": 12345}');
    setIncludeResponse(true);
  };

  return (
    <>
      <h2>cURL to Markdown</h2>
      <p>
        Convert cURL commands to simplified Markdown documentation format.
        Strips unnecessary headers and formats the request for API docs.
      </p>

      <FormGroup>
        <Label for="curlInput">cURL Command</Label>
        <StyledTextarea
          type="textarea"
          id="curlInput"
          rows={10}
          value={curlInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurlInput(e.target.value)}
          placeholder="Paste your cURL command here..."
        />
      </FormGroup>

      <FormGroup check className="mb-3">
        <Input
          type="checkbox"
          id="includeResponse"
          checked={includeResponse}
          onChange={(e) => setIncludeResponse(e.target.checked)}
        />
        <Label check for="includeResponse">
          Include Response
        </Label>
      </FormGroup>

      {includeResponse && (
        <FormGroup>
          <Label for="responseInput">Response (JSON)</Label>
          <StyledTextarea
            type="textarea"
            id="responseInput"
            rows={5}
            value={responseInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResponseInput(e.target.value)}
            placeholder='{"created": true}'
          />
        </FormGroup>
      )}

      <FormGroup className="d-flex gap-2 flex-wrap">
        <Button color="primary" onClick={handleConvert}>
          Convert to Markdown
        </Button>
        <Button color="secondary" onClick={handleLoadExample}>
          Load Example
        </Button>
      </FormGroup>

      {error && <Alert color="danger">{error}</Alert>}

      {output && (
        <Card>
          <CardHeader>
            <Row className="align-items-center">
              <Col>Markdown Output</Col>
              <Col xs="auto">
                <Button color="primary" onClick={handleCopy} id="curlMarkdownCopyTooltip">
                  <CopyIcon />
                </Button>
                <Tooltip
                  placement="top"
                  isOpen={tooltipOpen}
                  target="curlMarkdownCopyTooltip"
                >
                  Copied!
                </Tooltip>
              </Col>
            </Row>
          </CardHeader>
          <CardBody style={{ maxHeight: 400, overflowY: "auto" }}>
            <OutputPre>
              <code>{output}</code>
            </OutputPre>
          </CardBody>
        </Card>
      )}

      <Card className="mt-3">
        <CardHeader>Features</CardHeader>
        <CardBody>
          <ul className="mb-0">
            <li>Extracts HTTP method and endpoint path from cURL</li>
            <li>Parses and formats JSON request body</li>
            <li>Strips browser-generated headers (cookies, user-agent, etc.)</li>
            <li>Optional response section for complete documentation</li>
            <li>Copy formatted Markdown to clipboard</li>
          </ul>
        </CardBody>
      </Card>
    </>
  );
};
