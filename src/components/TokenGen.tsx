import type { FC } from "react";
import { useState } from "react";
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

type TokenType = "alphanumeric" | "alphabetic" | "numeric" | "hex" | "base64" | "urlsafe";

const CHARSETS: Record<TokenType, string> = {
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  alphabetic: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  numeric: "0123456789",
  hex: "0123456789abcdef",
  base64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  urlsafe: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
};

const generateToken = (length: number, type: TokenType): string => {
  const charset = CHARSETS[type];
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (num) => charset[num % charset.length]).join("");
};

export const TokenGen: FC = () => {
  const [length, setLength] = useState<number>(32);
  const [tokenType, setTokenType] = useState<TokenType>("alphanumeric");
  const [count, setCount] = useState<number>(1);
  const [tokens, setTokens] = useState<string[]>([]);
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const newTokens = Array.from({ length: count }, () => generateToken(length, tokenType));
    setTokens(newTokens);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(tokens.join("\n"));
    setTooltipOpen(true);
  };

  const handleCopySingle = (token: string) => {
    navigator.clipboard.writeText(token);
  };

  return (
    <>
      <h2>Token Generator</h2>
      <p>Generate cryptographically secure random tokens.</p>
      <Form onSubmit={handleGenerate}>
        <Row>
          <Col md={4}>
            <FormGroup>
              <Label for="tokenLength">Length</Label>
              <Input
                type="number"
                id="tokenLength"
                min={1}
                max={256}
                value={length}
                onChange={(e) => setLength(Math.min(256, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label for="tokenType">Type</Label>
              <Input
                type="select"
                id="tokenType"
                value={tokenType}
                onChange={(e) => setTokenType(e.target.value as TokenType)}
              >
                <option value="alphanumeric">Alphanumeric (A-Z, a-z, 0-9)</option>
                <option value="alphabetic">Alphabetic (A-Z, a-z)</option>
                <option value="numeric">Numeric (0-9)</option>
                <option value="hex">Hexadecimal (0-9, a-f)</option>
                <option value="base64">Base64</option>
                <option value="urlsafe">URL Safe (Base64 without +/)</option>
              </Input>
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label for="tokenCount">Count</Label>
              <Input
                type="number"
                id="tokenCount"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </FormGroup>
          </Col>
        </Row>
        <FormGroup>
          <Button type="submit" color="primary">
            Generate
          </Button>
        </FormGroup>
      </Form>

      {tokens.length > 0 && (
        <Card>
          <CardHeader>
            <Row className="align-items-center">
              <Col>Generated Tokens</Col>
              <Col xs="auto">
                <Button color="primary" onClick={handleCopyAll} id="copyAllTooltip">
                  <CopyIcon />
                </Button>
                <Tooltip placement="top" isOpen={tooltipOpen} target="copyAllTooltip" autohide={false}>
                  Copied!
                </Tooltip>
              </Col>
            </Row>
          </CardHeader>
          <CardBody style={{ maxHeight: 400, overflowY: "auto" }}>
            {tokens.map((token, index) => (
              <Row key={index} className="align-items-center mb-2">
                <Col>
                  <code className="user-select-all" style={{ wordBreak: "break-all" }}>
                    {token}
                  </code>
                </Col>
                <Col xs="auto">
                  <Button size="sm" color="secondary" onClick={() => handleCopySingle(token)}>
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
