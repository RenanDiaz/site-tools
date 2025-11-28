import type { FC } from "react";
import { useState } from "react";
import Papa from "papaparse";
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

interface ParsedData {
  data: unknown[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export const CSVToJSON: FC = () => {
  const [csvInput, setCsvInput] = useState<string>("");
  const [jsonOutput, setJsonOutput] = useState<string>("");
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleConvert = () => {
    if (!csvInput.trim()) {
      setError("Please enter CSV data to convert");
      setJsonOutput("");
      return;
    }

    setError("");

    try {
      const result = Papa.parse<unknown>(csvInput, {
        header: hasHeader,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header) => header.trim(),
      }) as ParsedData;

      if (result.errors.length > 0) {
        const errorMessages = result.errors
          .map((err) => `Row ${err.row}: ${err.message}`)
          .join(", ");
        setError(`Parse errors: ${errorMessages}`);
      }

      const formatted = JSON.stringify(result.data, null, 2);
      setJsonOutput(formatted);
    } catch (err) {
      setError(`Failed to parse CSV: ${err instanceof Error ? err.message : String(err)}`);
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
        setCsvInput(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <h2>CSV to JSON Converter</h2>
      <p>Convert CSV data to JSON format with automatic header detection and type conversion.</p>

      <FormGroup>
        <Label for="csvFile">Upload CSV File</Label>
        <Input
          type="file"
          id="csvFile"
          accept=".csv,text/csv"
          onChange={handleFileUpload}
        />
      </FormGroup>

      <FormGroup>
        <Label for="csvInput">CSV Input</Label>
        <Input
          type="textarea"
          id="csvInput"
          rows={10}
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
          placeholder="Paste CSV data here or upload a file...&#10;&#10;Example:&#10;Name,Age,Email&#10;John Doe,30,john@example.com&#10;Jane Smith,25,jane@example.com"
        />
      </FormGroup>

      <FormGroup check className="mb-3">
        <Label check>
          <Input
            type="checkbox"
            checked={hasHeader}
            onChange={(e) => setHasHeader(e.target.checked)}
          />
          First row contains headers
        </Label>
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
                <Button color="primary" onClick={handleCopy} id="copyCsvJsonTooltip">
                  <CopyIcon />
                </Button>
                <Tooltip placement="top" isOpen={tooltipOpen} target="copyCsvJsonTooltip" autohide={false}>
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
        <CardHeader>Features</CardHeader>
        <CardBody>
          <ul className="mb-0">
            <li>Automatic header detection and parsing</li>
            <li>Dynamic type conversion (numbers, booleans, null)</li>
            <li>Handles quoted fields and escaped commas</li>
            <li>Skips empty lines automatically</li>
            <li>File upload or paste CSV text</li>
            <li>Download as JSON file</li>
            <li>Error reporting with row numbers</li>
          </ul>
        </CardBody>
      </Card>
    </>
  );
};
