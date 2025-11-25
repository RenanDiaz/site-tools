import type { ChangeEvent, FC } from "react";
import { useState } from "react";
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
  Tooltip,
} from "reactstrap";
import styled from "styled-components";
import { CopyIcon } from "./Images";
import { useRevertableState } from "../utility/useRevertableState";

const CustomInput = styled(Input)`
  field-sizing: content;
  min-height: 100px;
  max-height: 300px;
`;

type Mode = "encode" | "decode";

export const Base64: FC = () => {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [mode, setMode] = useState<Mode>("encode");
  const [error, setError] = useState<string>("");
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleInputChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = currentTarget.value;
    setInput(value);
    processValue(value, mode);
  };

  const processValue = (value: string, currentMode: Mode) => {
    setError("");
    if (!value.trim()) {
      setOutput("");
      return;
    }

    try {
      if (currentMode === "encode") {
        // Encode: text to base64
        const encoded = btoa(unescape(encodeURIComponent(value)));
        setOutput(encoded);
      } else {
        // Decode: base64 to text
        const decoded = decodeURIComponent(escape(atob(value)));
        setOutput(decoded);
      }
    } catch {
      setError(currentMode === "decode" ? "Invalid Base64 string" : "Failed to encode");
      setOutput("");
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    // Swap input and output when switching modes
    const newInput = output;
    setInput(newInput);
    processValue(newInput, newMode);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(output);
    setTooltipOpen(true);
  };

  const handleSwap = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    handleModeChange(newMode);
  };

  return (
    <>
      <h2>Base64 Encoder/Decoder</h2>
      <p>Encode text to Base64 or decode Base64 to text. Supports UTF-8 characters.</p>

      <FormGroup>
        <ButtonGroup className="mb-3">
          <Button
            color={mode === "encode" ? "primary" : "secondary"}
            onClick={() => handleModeChange("encode")}
          >
            Encode
          </Button>
          <Button
            color={mode === "decode" ? "primary" : "secondary"}
            onClick={() => handleModeChange("decode")}
          >
            Decode
          </Button>
        </ButtonGroup>
      </FormGroup>

      <FormGroup>
        <CustomInput
          type="textarea"
          className="form-control"
          placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 to decode..."}
          value={input}
          onChange={handleInputChange}
        />
      </FormGroup>

      <FormGroup>
        <Button color="secondary" onClick={handleSwap} disabled={!output}>
          ↕ Swap Input/Output
        </Button>
      </FormGroup>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <Row className="align-items-center">
            <Col>{mode === "encode" ? "Encoded (Base64)" : "Decoded (Text)"}</Col>
            <Col xs="auto">
              <Button
                color="primary"
                onClick={handleCopyClick}
                id="copyBase64Tooltip"
                disabled={!output}
              >
                <CopyIcon />
              </Button>
              <Tooltip placement="top" isOpen={tooltipOpen} target="copyBase64Tooltip" autohide={false}>
                Copied!
              </Tooltip>
            </Col>
          </Row>
        </CardHeader>
        <CardBody style={{ maxHeight: 300, overflowY: "auto" }}>
          <pre className="mb-0" style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            <code>{output}</code>
          </pre>
        </CardBody>
      </Card>
    </>
  );
};
