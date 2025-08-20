import { ChangeEvent, FC, useState } from "react";
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

export const JSONParser: FC = () => {
  const [jsonString, setJsonString] = useState<string>("");
  const [parsedJSON, setParsedJSON] = useState<string>("");
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setJsonString(event.target.value);
  };

  const handleParse = () => {
    try {
      const parsedArray = jsonString
        .split(",\n")
        .map((line) => line.trim())
        .filter((line) => line)
        .map((line) => JSON.parse(line));
      parsedArray.map(console.log);
      const parsed = parsedArray.length === 1 ? parsedArray[0] : parsedArray;
      setParsedJSON(JSON.stringify(parsed, null, 2));
      setIsError(false);
      setError("");
    } catch (error) {
      setIsError(true);
      setError(JSON.stringify(error, null, 2));
    }
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(parsedJSON);
    setTooltipOpen(true);
  };

  return (
    <>
      <h2>JSONParser</h2>
      <p>This tool is used to parse JSON strings. Paste the JSON string below to parse it.</p>
      <FormGroup>
        <Input type="textarea" rows={10} value={jsonString} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Button color="primary" onClick={handleParse}>
          Parse
        </Button>
      </FormGroup>
      {isError && (
        <>
          <h3>Error</h3>
          <pre>{error}</pre>
        </>
      )}
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
          <pre>{parsedJSON}</pre>
        </CardBody>
      </Card>
    </>
  );
};
