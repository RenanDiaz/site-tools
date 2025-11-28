import type { FC } from "react";
import { useState } from "react";
import * as Diff from "diff";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import styled from "styled-components";

type ViewMode = "split" | "unified";

const DiffContainer = styled.div`
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
`;

const SplitView = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const DiffPane = styled.div`
  border: 1px solid var(--bs-border-color);
  border-radius: 4px;
  overflow: auto;
  max-height: 600px;
`;

const DiffLine = styled.div<{ type?: "added" | "removed" | "unchanged" }>`
  padding: 2px 8px;
  white-space: pre-wrap;
  word-break: break-all;
  background-color: ${(props) =>
    props.type === "added"
      ? "rgba(0, 255, 0, 0.2)"
      : props.type === "removed"
      ? "rgba(255, 0, 0, 0.2)"
      : "transparent"};
  border-left: 3px solid
    ${(props) =>
      props.type === "added"
        ? "#00ff00"
        : props.type === "removed"
        ? "#ff0000"
        : "transparent"};

  &:hover {
    background-color: ${(props) =>
      props.type === "added"
        ? "rgba(0, 255, 0, 0.3)"
        : props.type === "removed"
        ? "rgba(255, 0, 0, 0.3)"
        : "rgba(128, 128, 128, 0.1)"};
  }
`;

const UnifiedDiffLine = styled.div<{ type?: "added" | "removed" | "context" }>`
  padding: 2px 8px;
  white-space: pre-wrap;
  word-break: break-all;
  background-color: ${(props) =>
    props.type === "added"
      ? "rgba(0, 255, 0, 0.2)"
      : props.type === "removed"
      ? "rgba(255, 0, 0, 0.2)"
      : "transparent"};
  border-left: 3px solid
    ${(props) =>
      props.type === "added"
        ? "#00ff00"
        : props.type === "removed"
        ? "#ff0000"
        : "transparent"};

  &::before {
    content: "${(props) =>
      props.type === "added" ? "+" : props.type === "removed" ? "-" : " "}";
    display: inline-block;
    width: 20px;
    color: ${(props) =>
      props.type === "added"
        ? "#00ff00"
        : props.type === "removed"
        ? "#ff0000"
        : "#888"};
    font-weight: bold;
  }

  &:hover {
    background-color: ${(props) =>
      props.type === "added"
        ? "rgba(0, 255, 0, 0.3)"
        : props.type === "removed"
        ? "rgba(255, 0, 0, 0.3)"
        : "rgba(128, 128, 128, 0.1)"};
  }
`;

export const TextDiffViewer: FC = () => {
  const [leftText, setLeftText] = useState<string>("");
  const [rightText, setRightText] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);

  const computeDiff = () => {
    const options = { ignoreWhitespace };
    return Diff.diffLines(leftText, rightText, options);
  };

  const renderSplitView = () => {
    const changes = computeDiff();
    const leftLines: React.JSX.Element[] = [];
    const rightLines: React.JSX.Element[] = [];

    changes.forEach((part, idx) => {
      const lines = part.value.split("\n");
      // Remove last empty line if exists
      if (lines[lines.length - 1] === "") {
        lines.pop();
      }

      lines.forEach((line, lineIdx) => {
        const key = `${idx}-${lineIdx}`;
        if (part.added) {
          rightLines.push(
            <DiffLine key={`right-${key}`} type="added">
              {line || "\u00A0"}
            </DiffLine>
          );
          leftLines.push(
            <DiffLine key={`left-${key}`} type="unchanged">
              {"\u00A0"}
            </DiffLine>
          );
        } else if (part.removed) {
          leftLines.push(
            <DiffLine key={`left-${key}`} type="removed">
              {line || "\u00A0"}
            </DiffLine>
          );
          rightLines.push(
            <DiffLine key={`right-${key}`} type="unchanged">
              {"\u00A0"}
            </DiffLine>
          );
        } else {
          leftLines.push(
            <DiffLine key={`left-${key}`} type="unchanged">
              {line || "\u00A0"}
            </DiffLine>
          );
          rightLines.push(
            <DiffLine key={`right-${key}`} type="unchanged">
              {line || "\u00A0"}
            </DiffLine>
          );
        }
      });
    });

    return (
      <SplitView>
        <DiffPane>{leftLines}</DiffPane>
        <DiffPane>{rightLines}</DiffPane>
      </SplitView>
    );
  };

  const renderUnifiedView = () => {
    const changes = computeDiff();
    const lines: React.JSX.Element[] = [];

    changes.forEach((part, idx) => {
      const partLines = part.value.split("\n");
      // Remove last empty line if exists
      if (partLines[partLines.length - 1] === "") {
        partLines.pop();
      }

      partLines.forEach((line, lineIdx) => {
        const key = `${idx}-${lineIdx}`;
        const type = part.added ? "added" : part.removed ? "removed" : "context";
        lines.push(
          <UnifiedDiffLine key={key} type={type}>
            {line || "\u00A0"}
          </UnifiedDiffLine>
        );
      });
    });

    return <DiffPane>{lines}</DiffPane>;
  };

  const hasDiff = leftText !== rightText;

  return (
    <>
      <h2>Text Diff Viewer</h2>
      <p>Compare two texts side-by-side or in unified view with line-by-line highlighting.</p>

      <Row className="g-3">
        <Col md={6}>
          <FormGroup>
            <Label for="leftText">Original Text</Label>
            <Input
              type="textarea"
              id="leftText"
              rows={10}
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              placeholder="Paste original text here..."
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="rightText">Modified Text</Label>
            <Input
              type="textarea"
              id="rightText"
              rows={10}
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              placeholder="Paste modified text here..."
            />
          </FormGroup>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={6}>
          <FormGroup>
            <Label>View Mode</Label>
            <ButtonGroup className="w-100">
              <Button
                color={viewMode === "split" ? "primary" : "secondary"}
                onClick={() => setViewMode("split")}
              >
                Split View
              </Button>
              <Button
                color={viewMode === "unified" ? "primary" : "secondary"}
                onClick={() => setViewMode("unified")}
              >
                Unified View
              </Button>
            </ButtonGroup>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup check className="mt-4">
            <Label check>
              <Input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              />
              Ignore whitespace differences
            </Label>
          </FormGroup>
        </Col>
      </Row>

      {hasDiff && (
        <Card>
          <CardHeader>
            <Row className="align-items-center">
              <Col>Diff Results</Col>
              <Col xs="auto" className="text-muted small">
                <span style={{ color: "#00ff00" }}>■</span> Added{" "}
                <span style={{ color: "#ff0000" }}>■</span> Removed
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <DiffContainer>
              {viewMode === "split" ? renderSplitView() : renderUnifiedView()}
            </DiffContainer>
          </CardBody>
        </Card>
      )}

      {!hasDiff && leftText && rightText && (
        <Card>
          <CardBody className="text-center text-muted">No differences found</CardBody>
        </Card>
      )}

      <Card className="mt-3">
        <CardHeader>How to Use</CardHeader>
        <CardBody>
          <ul className="mb-0">
            <li>
              <strong>Split View:</strong> Shows original and modified text side-by-side
            </li>
            <li>
              <strong>Unified View:</strong> Shows changes in a single column with +/- indicators
            </li>
            <li>
              <strong>Green highlight:</strong> Lines added in modified text
            </li>
            <li>
              <strong>Red highlight:</strong> Lines removed from original text
            </li>
            <li>
              <strong>Ignore whitespace:</strong> Compares content while ignoring spaces, tabs, and
              line endings
            </li>
          </ul>
        </CardBody>
      </Card>
    </>
  );
};
