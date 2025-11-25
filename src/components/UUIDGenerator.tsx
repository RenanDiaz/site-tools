import type { FC } from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Tooltip,
} from "reactstrap";
import { CopyIcon } from "./Images";
import { useRevertableState } from "../utility/useRevertableState";

type UUIDFormat = "lowercase" | "uppercase" | "no-hyphens" | "braces";

const formatUUID = (uuid: string, format: UUIDFormat): string => {
  switch (format) {
    case "uppercase":
      return uuid.toUpperCase();
    case "no-hyphens":
      return uuid.replace(/-/g, "");
    case "braces":
      return `{${uuid}}`;
    case "lowercase":
    default:
      return uuid;
  }
};

export const UUIDGenerator: FC = () => {
  const [count, setCount] = useState<number>(1);
  const [format, setFormat] = useState<UUIDFormat>("lowercase");
  const [uuids, setUUIDs] = useState<string[]>([]);
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const newUUIDs = Array.from({ length: count }, () => formatUUID(uuidv4(), format));
    setUUIDs(newUUIDs);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
    setTooltipOpen(true);
  };

  const handleCopySingle = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
  };

  const handleFormatChange = (newFormat: UUIDFormat) => {
    setFormat(newFormat);
    // Re-format existing UUIDs
    if (uuids.length > 0) {
      // Extract base UUID (lowercase with hyphens) and reformat
      const baseUUIDs = uuids.map((u) => {
        // Remove braces if present
        let base = u.replace(/[{}]/g, "");
        // Add hyphens if missing
        if (!base.includes("-")) {
          base = `${base.slice(0, 8)}-${base.slice(8, 12)}-${base.slice(12, 16)}-${base.slice(16, 20)}-${base.slice(20)}`;
        }
        return base.toLowerCase();
      });
      setUUIDs(baseUUIDs.map((u) => formatUUID(u, newFormat)));
    }
  };

  return (
    <>
      <h2>UUID Generator</h2>
      <p>Generate RFC 4122 version 4 UUIDs (random).</p>
      <Form onSubmit={handleGenerate}>
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label for="uuidCount">Count</Label>
              <Input
                type="number"
                id="uuidCount"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup>
              <Label for="uuidFormat">Format</Label>
              <Input
                type="select"
                id="uuidFormat"
                value={format}
                onChange={(e) => handleFormatChange(e.target.value as UUIDFormat)}
              >
                <option value="lowercase">Lowercase (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)</option>
                <option value="uppercase">Uppercase (XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX)</option>
                <option value="no-hyphens">No Hyphens (xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)</option>
                <option value="braces">With Braces ({"{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}"})</option>
              </Input>
            </FormGroup>
          </Col>
        </Row>
        <FormGroup>
          <Button type="submit" color="primary">
            Generate
          </Button>
        </FormGroup>
      </Form>

      {uuids.length > 0 && (
        <Card>
          <CardHeader>
            <Row className="align-items-center">
              <Col>Generated UUIDs</Col>
              <Col xs="auto">
                <Button color="primary" onClick={handleCopyAll} id="copyAllUUIDTooltip">
                  <CopyIcon />
                </Button>
                <Tooltip placement="top" isOpen={tooltipOpen} target="copyAllUUIDTooltip" autohide={false}>
                  Copied!
                </Tooltip>
              </Col>
            </Row>
          </CardHeader>
          <CardBody style={{ maxHeight: 400, overflowY: "auto" }}>
            {uuids.map((uuid, index) => (
              <Row key={index} className="align-items-center mb-2">
                <Col>
                  <code className="user-select-all">{uuid}</code>
                </Col>
                <Col xs="auto">
                  <Button size="sm" color="secondary" onClick={() => handleCopySingle(uuid)}>
                    <CopyIcon />
                  </Button>
                </Col>
              </Row>
            ))}
          </CardBody>
        </Card>
      )}
    </>
  );
};
