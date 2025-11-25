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
  min-height: 80px;
  max-height: 150px;
`;

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

const decodeBase64Url = (str: string): string => {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if needed
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }
  return decodeURIComponent(escape(atob(base64)));
};

const parseJWT = (token: string): DecodedJWT | null => {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;

    const header = JSON.parse(decodeBase64Url(parts[0]));
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    const signature = parts[2];

    return { header, payload, signature };
  } catch {
    return null;
  }
};

const formatTimestamp = (timestamp: number): string => {
  // JWT timestamps are in seconds
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

const isExpired = (exp: number): boolean => {
  return Date.now() > exp * 1000;
};

export const JWTDecoder: FC = () => {
  const [input, setInput] = useState<string>("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState<string>("");
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleInputChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = currentTarget.value;
    setInput(value);
    setError("");

    if (!value.trim()) {
      setDecoded(null);
      return;
    }

    const result = parseJWT(value);
    if (result) {
      setDecoded(result);
    } else {
      setDecoded(null);
      setError("Invalid JWT format. Expected: header.payload.signature");
    }
  };

  const handleCopy = (content: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setTooltipOpen(true);
  };

  const renderPayloadValue = (key: string, value: unknown): React.ReactNode => {
    // Special handling for timestamp fields
    if ((key === "exp" || key === "iat" || key === "nbf") && typeof value === "number") {
      const expired = key === "exp" && isExpired(value);
      return (
        <span>
          {value}{" "}
          <span className={`text-${expired ? "danger" : "muted"}`}>
            ({formatTimestamp(value)}
            {key === "exp" && (expired ? " - EXPIRED" : " - Valid")}
            )
          </span>
        </span>
      );
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <>
      <h2>JWT Decoder</h2>
      <p>Decode JSON Web Tokens to view header and payload. Does not verify signatures.</p>

      <FormGroup>
        <CustomInput
          type="textarea"
          className="form-control font-monospace"
          placeholder="Paste JWT token here (eyJhbGciOiJIUzI1NiIs...)"
          value={input}
          onChange={handleInputChange}
        />
      </FormGroup>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {decoded && (
        <>
          <Card className="mb-3">
            <CardHeader>
              <Row className="align-items-center">
                <Col>Header</Col>
                <Col xs="auto">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => handleCopy(decoded.header)}
                    id="copyHeaderTooltip"
                  >
                    <CopyIcon />
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <pre className="mb-0">
                <code>{JSON.stringify(decoded.header, null, 2)}</code>
              </pre>
            </CardBody>
          </Card>

          <Card className="mb-3">
            <CardHeader>
              <Row className="align-items-center">
                <Col>
                  Payload
                  {typeof decoded.payload.exp === "number" && (
                    <span
                      className={`badge ms-2 bg-${isExpired(decoded.payload.exp as number) ? "danger" : "success"}`}
                    >
                      {isExpired(decoded.payload.exp as number) ? "Expired" : "Valid"}
                    </span>
                  )}
                </Col>
                <Col xs="auto">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => handleCopy(decoded.payload)}
                    id="copyPayloadTooltip"
                  >
                    <CopyIcon />
                  </Button>
                  <Tooltip placement="top" isOpen={tooltipOpen} target="copyPayloadTooltip" autohide={false}>
                    Copied!
                  </Tooltip>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <table className="table table-sm mb-0">
                <tbody>
                  {Object.entries(decoded.payload).map(([key, val]) => (
                    <tr key={key}>
                      <td style={{ width: "120px" }}>
                        <strong>{key}</strong>
                      </td>
                      <td style={{ wordBreak: "break-all" }}>{renderPayloadValue(key, val as unknown)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Signature</CardHeader>
            <CardBody>
              <code className="user-select-all" style={{ wordBreak: "break-all", fontSize: "0.85em" }}>
                {decoded.signature}
              </code>
              <div className="mt-2 text-muted small">
                Note: This tool does not verify the signature. Use a proper JWT library for validation.
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </>
  );
};
