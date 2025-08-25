import type { ChangeEvent, FC, FormEvent } from "react";
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
import { CopyIcon } from "./Images";
import { useRevertableState } from "../utility/useRevertableState";
import { Form } from "react-router-dom";
import styled from "styled-components";

const CustomInput = styled(Input)`
  field-sizing: content;
  max-height: 400px;
`;

interface Cookie {
  name: string;
  value: string;
}

export const CookiesToJSON: FC = () => {
  const [cookiesString, setCookiesString] = useState<string>("");
  const [cookiesJSON, setCookiesJSON] = useState<Cookie[]>([]);
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCookiesString(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cookies = cookiesString
      .split(";")
      .map((cookie) => cookie.trim())
      .filter((cookie) => cookie)
      .map((cookie) => {
        const [name, value] = cookie.split("=");
        return { name, value };
      });
    setCookiesJSON(cookies);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(JSON.stringify(cookiesJSON));
    setTooltipOpen(true);
  };

  return (
    <>
      <h2>Cookies to JSON</h2>
      <p>Paste the cookies string below to convert it to a JSON object.</p>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <CustomInput
            type="textarea"
            className="form-control"
            placeholder="Paste SVG string here"
            value={cookiesString}
            onChange={handleChange}
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
            <Col>JSON</Col>
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
          <pre>{JSON.stringify(cookiesJSON, null, 2)}</pre>
        </CardBody>
      </Card>
    </>
  );
};
