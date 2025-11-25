import type { ChangeEvent, FC } from "react";
import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Row,
  Tooltip,
} from "reactstrap";
import styled from "styled-components";
import { CopyIcon } from "./Images";
import { useRevertableState } from "../utility/useRevertableState";

const CustomInput = styled(Input)`
  field-sizing: content;
  min-height: 100px;
  max-height: 200px;
`;

interface HashResult {
  algorithm: string;
  hash: string;
}

const hashAlgorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

const computeHash = async (text: string, algorithm: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const HashGenerator: FC = () => {
  const [input, setInput] = useState<string>("");
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);
  const [copiedIndex, setCopiedIndex] = useState<number>(-1);

  const handleInputChange = async ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = currentTarget.value;
    setInput(value);

    if (!value.trim()) {
      setHashes([]);
      return;
    }

    const results = await Promise.all(
      hashAlgorithms.map(async (algo) => ({
        algorithm: algo,
        hash: await computeHash(value, algo),
      }))
    );
    setHashes(results);
  };

  const handleCopyAll = () => {
    const text = hashes.map((h) => `${h.algorithm}: ${h.hash}`).join("\n");
    navigator.clipboard.writeText(text);
    setTooltipOpen(true);
  };

  const handleCopySingle = (hash: string, index: number) => {
    navigator.clipboard.writeText(hash);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
  };

  return (
    <>
      <h2>Hash Generator</h2>
      <p>Generate cryptographic hashes using SHA-1, SHA-256, SHA-384, and SHA-512.</p>

      <FormGroup>
        <CustomInput
          type="textarea"
          className="form-control"
          placeholder="Enter text to hash..."
          value={input}
          onChange={handleInputChange}
        />
      </FormGroup>

      {hashes.length > 0 && (
        <Card>
          <CardHeader>
            <Row className="align-items-center">
              <Col>Hashes</Col>
              <Col xs="auto">
                <Button color="primary" onClick={handleCopyAll} id="copyAllHashTooltip">
                  <CopyIcon />
                </Button>
                <Tooltip placement="top" isOpen={tooltipOpen} target="copyAllHashTooltip" autohide={false}>
                  Copied!
                </Tooltip>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            {hashes.map((result, index) => (
              <Row key={result.algorithm} className="align-items-center mb-3">
                <Col xs={12} md={2}>
                  <strong>{result.algorithm}</strong>
                </Col>
                <Col>
                  <code className="user-select-all" style={{ wordBreak: "break-all", fontSize: "0.85em" }}>
                    {result.hash}
                  </code>
                </Col>
                <Col xs="auto">
                  <Button
                    size="sm"
                    color={copiedIndex === index ? "success" : "secondary"}
                    onClick={() => handleCopySingle(result.hash, index)}
                  >
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
