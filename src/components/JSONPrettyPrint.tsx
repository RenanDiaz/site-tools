import type { ChangeEvent, FC, FormEvent } from "react";
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
  Row,
  Tooltip,
} from "reactstrap";
import styled from "styled-components";
import { CopyIcon } from "./Images";
import { useRevertableState } from "../utility/useRevertableState";

const CustomInput = styled(Input)`
  field-sizing: content;
  max-height: 400px;
`;

export const JSONPrettyPrint: FC = () => {
  const [jsonString, setJSONString] = useState<string>("");
  const [jsonPretty, setJSONPretty] = useState<string>("");
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const jsxString = JSON.stringify(JSON.parse(jsonString), null, 2);
    setJSONPretty(jsxString);
  };

  const handleSVGChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    setJSONString(currentTarget.value);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(jsonPretty);
    setTooltipOpen(true);
  };

  return (
    <>
      <h2>JSON Pretty Print</h2>
      <p>Pretty print JSON.</p>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <CustomInput
            type="textarea"
            className="form-control"
            placeholder="Paste JSON string here"
            value={jsonString}
            onChange={handleSVGChange}
          />
        </FormGroup>
        <FormGroup>
          <Button type="submit" color="primary">
            Convert
          </Button>
        </FormGroup>
      </Form>
      <Card>
        <CardHeader>
          <Row className="align-items-center">
            <Col>Result</Col>
            <Col xs="auto">
              <Button color="primary" onClick={handleCopyClick} id="copiedTooltip">
                <CopyIcon />
              </Button>
              <Tooltip placement="top" isOpen={tooltipOpen} target="copiedTooltip" autohide={false}>
                Copied!
              </Tooltip>
            </Col>
          </Row>
        </CardHeader>
        <CardBody style={{ maxHeight: 400, overflowY: "auto" }}>
          <pre className="mb-0">
            <code>{jsonPretty}</code>
          </pre>
        </CardBody>
      </Card>
    </>
  );
};
