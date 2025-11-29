import type { FC } from "react";
import { useState } from "react";
import yaml from "js-yaml";
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
import { CopyIcon } from "./Images";
import { useRevertableState } from "../utility/useRevertableState";

export const YAMLToJSON: FC = () => {
  const [yamlInput, setYamlInput] = useState<string>("");
  const [jsonOutput, setJsonOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleConvert = () => {
    if (!yamlInput.trim()) {
      setError("Please enter YAML data to convert");
      setJsonOutput("");
      return;
    }

    setError("");

    try {
      const parsed = yaml.load(yamlInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonOutput(formatted);
    } catch (err) {
      if (err instanceof yaml.YAMLException) {
        setError(`YAML Parse Error: ${err.message}`);
      } else {
        setError(`Failed to parse YAML: ${err instanceof Error ? err.message : String(err)}`);
      }
      setJsonOutput("");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonOutput);
    setTooltipOpen(true);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setYamlInput(content);
      };
      reader.readAsText(file);
    }
  };

  const loadExample = () => {
    const exampleYAML = `# Example YAML configuration
server:
  host: localhost
  port: 8080
  ssl: true

database:
  name: mydb
  username: admin
  password: secret123

features:
  - authentication
  - logging
  - caching

settings:
  timeout: 30
  maxConnections: 100
  debug: false`;

    setYamlInput(exampleYAML);
  };

  return (
    <>
      <h2>YAML to JSON Converter</h2>
      <p>Convert YAML configuration files to JSON format with syntax validation.</p>

      <FormGroup>
        <Label for="yamlFile">Upload YAML File</Label>
        <Input
          type="file"
          id="yamlFile"
          accept=".yaml,.yml,text/yaml"
          onChange={handleFileUpload}
        />
      </FormGroup>

      <FormGroup>
        <Row className="align-items-center mb-2">
          <Col>
            <Label for="yamlInput">YAML Input</Label>
          </Col>
          <Col xs="auto">
            <Button color="secondary" size="sm" onClick={loadExample}>
              Load Example
            </Button>
          </Col>
        </Row>
        <Input
          type="textarea"
          id="yamlInput"
          rows={12}
          value={yamlInput}
          onChange={(e) => setYamlInput(e.target.value)}
          placeholder="Paste YAML data here or upload a file..."
          style={{ fontFamily: "monospace" }}
        />
      </FormGroup>

      <FormGroup>
        <Button color="primary" onClick={handleConvert}>
          Convert to JSON
        </Button>
      </FormGroup>

      {error && (
        <Alert color="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {jsonOutput && (
        <Card>
          <CardHeader>
            <Row className="align-items-center">
              <Col>JSON Output</Col>
              <Col xs="auto" className="d-flex gap-2">
                <Button color="success" onClick={handleDownload}>
                  Download
                </Button>
                <Button color="primary" onClick={handleCopy} id="copyYamlJsonTooltip">
                  <CopyIcon />
                </Button>
                <Tooltip placement="top" isOpen={tooltipOpen} target="copyYamlJsonTooltip" autohide={false}>
                  Copied!
                </Tooltip>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <pre className="mb-0" style={{ maxHeight: 400, overflowY: "auto" }}>
              <code>{jsonOutput}</code>
            </pre>
          </CardBody>
        </Card>
      )}

      <Card className="mt-3">
        <CardHeader>About YAML</CardHeader>
        <CardBody>
          <p className="mb-2">
            YAML (YAML Ain't Markup Language) is a human-readable data serialization format commonly
            used for:
          </p>
          <ul className="mb-2">
            <li>Configuration files (Docker, Kubernetes, CI/CD)</li>
            <li>Data exchange between languages</li>
            <li>Application settings</li>
            <li>Infrastructure as Code definitions</li>
          </ul>
          <p className="mb-0">
            <strong>Features:</strong> Supports strings, numbers, booleans, arrays, objects, comments,
            multi-line strings, and anchors/aliases for reference reuse.
          </p>
        </CardBody>
      </Card>
    </>
  );
};
