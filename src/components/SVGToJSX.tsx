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
import { CopyIcon } from "./Images";
import { useRevertableState } from "../utility/useRevertableState";
import styled from "styled-components";

const CustomInput = styled(Input)`
  field-sizing: content;
  max-height: 400px;
`;

function svgToJSX(svgString: string) {
  return svgString
    .replace(/class=/g, "className=")
    .replace(/stroke-width=/g, "strokeWidth=")
    .replace(/fill-opacity=/g, "fillOpacity=")
    .replace(/stroke-opacity=/g, "strokeOpacity=")
    .replace(/viewBox=/g, "viewBox=")
    .replace(/xlink:href/g, "xlinkHref")
    .replace(/xmlns:xlink/g, "xmlnsXlink")
    .replace(/([a-z])-([a-z])/g, (_, p1, p2) => `${p1}${p2.toUpperCase()}`)
    .replace(/style="([^"]*)"/g, (_, styleString) => {
      const styleObject = styleString
        .split(";")
        .filter(Boolean)
        .map((style: string) => {
          const [property, value] = style.split(":");
          const camelCasedProperty = property
            .trim()
            .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          return `${camelCasedProperty}: '${value.trim()}'`;
        })
        .join(", ");
      return `style={{ ${styleObject} }}`;
    })
    .trim();
}

export const SVGToJSX: FC = () => {
  const [svgString, setSvgString] = useState<string>("");
  const [jsxString, setJSXString] = useState<string>("");
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setJSXString(svgToJSX(svgString));
  };

  const handleSVGChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    setSvgString(currentTarget.value);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(jsxString);
    setTooltipOpen(true);
  };

  return (
    <>
      <h2>SVG to JSX</h2>
      <p>Convert an SVG string to JSX.</p>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <CustomInput
            type="textarea"
            className="form-control"
            placeholder="Paste SVG string here"
            value={svgString}
            onChange={handleSVGChange}
          />
        </FormGroup>
        <FormGroup>
          <Button type="submit" color="primary">
            Convert
          </Button>
        </FormGroup>
      </Form>
      <Row>
        <Col xs xl="9">
          <Card>
            <CardHeader>
              <Row className="align-items-center">
                <Col>Result</Col>
                <Col xs="auto">
                  <Button color="primary" onClick={handleCopyClick} id="copiedTooltip">
                    <CopyIcon />
                  </Button>
                  <Tooltip
                    placement="top"
                    isOpen={tooltipOpen}
                    target="copiedTooltip"
                    autohide={false}
                  >
                    Copied!
                  </Tooltip>
                </Col>
              </Row>
            </CardHeader>
            <CardBody style={{ maxHeight: 400, overflowY: "auto" }}>
              <pre className="mb-0">
                <code>{jsxString}</code>
              </pre>
            </CardBody>
          </Card>
        </Col>
        <Col xl="3">
          {/* svg preview */}
          <Card>
            <CardHeader>SVG Preview</CardHeader>
            <CardBody style={{ maxHeight: 400, overflowY: "auto" }}>
              <div
                dangerouslySetInnerHTML={{ __html: svgString }}
                style={{ width: "100%", height: "100%" }}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};
