import type { FC } from "react";
import { useState } from "react";
import { parseString } from "xml2js";
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

export const XMLToJSON: FC = () => {
  const [xmlInput, setXmlInput] = useState<string>("");
  const [jsonOutput, setJsonOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [explicitArray, setExplicitArray] = useState<boolean>(false);
  const [mergeAttrs, setMergeAttrs] = useState<boolean>(false);
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleConvert = () => {
    if (!xmlInput.trim()) {
      setError("Please enter XML data to convert");
      setJsonOutput("");
      return;
    }

    setError("");

    const options = {
      explicitArray,
      mergeAttrs,
    };

    parseString(xmlInput, options, (err, result) => {
      if (err) {
        setError(`XML Parse Error: ${err.message}`);
        setJsonOutput("");
      } else {
        const formatted = JSON.stringify(result, null, 2);
        setJsonOutput(formatted);
      }
    });
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
        setXmlInput(content);
      };
      reader.readAsText(file);
    }
  };

  const loadExample = () => {
    const exampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction">
    <title lang="en">Harry Potter</title>
    <author>J.K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
  <book category="web">
    <title lang="en">Learning XML</title>
    <author>Erik T. Ray</author>
    <year>2003</year>
    <price>39.95</price>
  </book>
</bookstore>`;

    setXmlInput(exampleXML);
  };

  return (
    <>
      <h2>XML to JSON Converter</h2>
      <p>Convert XML documents to JSON format with configurable attribute handling.</p>

      <FormGroup>
        <Label for="xmlFile">Upload XML File</Label>
        <Input
          type="file"
          id="xmlFile"
          accept=".xml,text/xml"
          onChange={handleFileUpload}
        />
      </FormGroup>

      <FormGroup>
        <Row className="align-items-center mb-2">
          <Col>
            <Label for="xmlInput">XML Input</Label>
          </Col>
          <Col xs="auto">
            <Button color="secondary" size="sm" onClick={loadExample}>
              Load Example
            </Button>
          </Col>
        </Row>
        <Input
          type="textarea"
          id="xmlInput"
          rows={12}
          value={xmlInput}
          onChange={(e) => setXmlInput(e.target.value)}
          placeholder="Paste XML data here or upload a file..."
          style={{ fontFamily: "monospace" }}
        />
      </FormGroup>

      <Row className="g-3 mb-3">
        <Col md={6}>
          <FormGroup check>
            <Label check>
              <Input
                type="checkbox"
                checked={explicitArray}
                onChange={(e) => setExplicitArray(e.target.checked)}
              />
              Always use arrays for child elements
            </Label>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup check>
            <Label check>
              <Input
                type="checkbox"
                checked={mergeAttrs}
                onChange={(e) => setMergeAttrs(e.target.checked)}
              />
              Merge attributes into parent object
            </Label>
          </FormGroup>
        </Col>
      </Row>

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
                <Button color="primary" onClick={handleCopy} id="copyXmlJsonTooltip">
                  <CopyIcon />
                </Button>
                <Tooltip placement="top" isOpen={tooltipOpen} target="copyXmlJsonTooltip" autohide={false}>
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
        <CardHeader>Conversion Options</CardHeader>
        <CardBody>
          <ul className="mb-0">
            <li>
              <strong>Always use arrays:</strong> Forces all child elements to be represented as
              arrays, even if there's only one child. Useful for consistent data structure.
            </li>
            <li>
              <strong>Merge attributes:</strong> Merges XML attributes directly into the parent
              object instead of nesting them under an "attributes" key.
            </li>
          </ul>
        </CardBody>
      </Card>

      <Card className="mt-3">
        <CardHeader>About XML</CardHeader>
        <CardBody>
          <p className="mb-2">
            XML (eXtensible Markup Language) is a markup language commonly used for:
          </p>
          <ul className="mb-0">
            <li>Data storage and transport</li>
            <li>Configuration files</li>
            <li>Web services (SOAP, RSS, Atom)</li>
            <li>Document formats (SVG, Office documents)</li>
            <li>API responses and data exchange</li>
          </ul>
        </CardBody>
      </Card>
    </>
  );
};
