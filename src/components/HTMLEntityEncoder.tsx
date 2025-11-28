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

const encodeHtmlEntities = (str: string): string => {
  const textarea = document.createElement("textarea");
  textarea.textContent = str;
  return textarea.innerHTML;
};

const decodeHtmlEntities = (str: string): string => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.textContent || "";
};

export const HTMLEntityEncoder: FC = () => {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [mode, setMode] = useState<Mode>("encode");
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleInputChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = currentTarget.value;
    setInput(value);
    processValue(value, mode);
  };

  const processValue = (value: string, currentMode: Mode) => {
    if (!value) {
      setOutput("");
      return;
    }

    if (currentMode === "encode") {
      setOutput(encodeHtmlEntities(value));
    } else {
      setOutput(decodeHtmlEntities(value));
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
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
      <h2>HTML Entity Encoder/Decoder</h2>
      <p>Convert special characters to/from HTML entities.</p>

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
          placeholder={
            mode === "encode"
              ? "Enter text with special characters (e.g., <>&\"')..."
              : "Enter HTML entities (e.g., &lt;&gt;&amp;&quot;&#39;)..."
          }
          value={input}
          onChange={handleInputChange}
        />
      </FormGroup>

      <FormGroup>
        <Button color="secondary" onClick={handleSwap} disabled={!output}>
          ↕ Swap Input/Output
        </Button>
      </FormGroup>

      <Card>
        <CardHeader>
          <Row className="align-items-center">
            <Col>{mode === "encode" ? "Encoded (HTML Entities)" : "Decoded (Text)"}</Col>
            <Col xs="auto">
              <Button
                color="primary"
                onClick={handleCopyClick}
                id="copyHTMLTooltip"
                disabled={!output}
              >
                <CopyIcon />
              </Button>
              <Tooltip placement="top" isOpen={tooltipOpen} target="copyHTMLTooltip" autohide={false}>
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

      <Card className="mt-3">
        <CardHeader>Common HTML Entities</CardHeader>
        <CardBody>
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th>Character</th>
                <th>Entity Name</th>
                <th>Entity Number</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>&lt;</td>
                <td>&amp;lt;</td>
                <td>&amp;#60;</td>
              </tr>
              <tr>
                <td>&gt;</td>
                <td>&amp;gt;</td>
                <td>&amp;#62;</td>
              </tr>
              <tr>
                <td>&amp;</td>
                <td>&amp;amp;</td>
                <td>&amp;#38;</td>
              </tr>
              <tr>
                <td>&quot;</td>
                <td>&amp;quot;</td>
                <td>&amp;#34;</td>
              </tr>
              <tr>
                <td>&#39;</td>
                <td>&amp;#39;</td>
                <td>&amp;#39;</td>
              </tr>
              <tr>
                <td>&nbsp;</td>
                <td>&amp;nbsp;</td>
                <td>&amp;#160;</td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
};
