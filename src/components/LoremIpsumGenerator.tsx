import type { FC } from "react";
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
  Label,
  Row,
  Tooltip,
} from "reactstrap";
import { CopyIcon } from "./Images";
import { useRevertableState } from "../utility/useRevertableState";

type GenerateType = "paragraphs" | "sentences" | "words";

const loremWords = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum",
];

const getRandomWord = (): string => {
  return loremWords[Math.floor(Math.random() * loremWords.length)];
};

const generateWords = (count: number): string => {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(getRandomWord());
  }
  return words.join(" ");
};

const generateSentence = (): string => {
  const wordCount = Math.floor(Math.random() * 10) + 5; // 5-14 words per sentence
  const words = generateWords(wordCount);
  return words.charAt(0).toUpperCase() + words.slice(1) + ".";
};

const generateSentences = (count: number): string => {
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(generateSentence());
  }
  return sentences.join(" ");
};

const generateParagraph = (): string => {
  const sentenceCount = Math.floor(Math.random() * 4) + 3; // 3-6 sentences per paragraph
  return generateSentences(sentenceCount);
};

const generateParagraphs = (count: number): string => {
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    paragraphs.push(generateParagraph());
  }
  return paragraphs.join("\n\n");
};

export const LoremIpsumGenerator: FC = () => {
  const [type, setType] = useState<GenerateType>("paragraphs");
  const [count, setCount] = useState<number>(3);
  const [output, setOutput] = useState<string>("");
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleGenerate = () => {
    let result = "";
    switch (type) {
      case "paragraphs":
        result = generateParagraphs(count);
        break;
      case "sentences":
        result = generateSentences(count);
        break;
      case "words":
        result = generateWords(count);
        break;
    }
    setOutput(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setTooltipOpen(true);
  };

  const getMaxCount = (): number => {
    switch (type) {
      case "paragraphs":
        return 50;
      case "sentences":
        return 200;
      case "words":
        return 1000;
    }
  };

  const getDefaultCount = (newType: GenerateType): number => {
    switch (newType) {
      case "paragraphs":
        return 3;
      case "sentences":
        return 10;
      case "words":
        return 50;
    }
  };

  const handleTypeChange = (newType: GenerateType) => {
    setType(newType);
    setCount(getDefaultCount(newType));
  };

  return (
    <>
      <h2>Lorem Ipsum Generator</h2>
      <p>Generate placeholder text for your designs and mockups.</p>

      <FormGroup>
        <Row className="g-2">
          <Col md={6}>
            <Label for="generateType">Generate</Label>
            <ButtonGroup className="w-100">
              <Button
                color={type === "paragraphs" ? "primary" : "secondary"}
                onClick={() => handleTypeChange("paragraphs")}
              >
                Paragraphs
              </Button>
              <Button
                color={type === "sentences" ? "primary" : "secondary"}
                onClick={() => handleTypeChange("sentences")}
              >
                Sentences
              </Button>
              <Button
                color={type === "words" ? "primary" : "secondary"}
                onClick={() => handleTypeChange("words")}
              >
                Words
              </Button>
            </ButtonGroup>
          </Col>
          <Col md={6}>
            <Label for="count">Count</Label>
            <Input
              type="number"
              id="count"
              min={1}
              max={getMaxCount()}
              value={count}
              onChange={(e) =>
                setCount(Math.min(getMaxCount(), Math.max(1, parseInt(e.target.value) || 1)))
              }
            />
          </Col>
        </Row>
      </FormGroup>

      <FormGroup>
        <Button color="primary" onClick={handleGenerate}>
          Generate
        </Button>
      </FormGroup>

      {output && (
        <Card>
          <CardHeader>
            <Row className="align-items-center">
              <Col>Generated Text</Col>
              <Col xs="auto">
                <Button color="primary" onClick={handleCopy} id="copyLoremTooltip">
                  <CopyIcon />
                </Button>
                <Tooltip placement="top" isOpen={tooltipOpen} target="copyLoremTooltip" autohide={false}>
                  Copied!
                </Tooltip>
              </Col>
            </Row>
          </CardHeader>
          <CardBody style={{ maxHeight: 500, overflowY: "auto" }}>
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {output}
            </p>
          </CardBody>
        </Card>
      )}

      <Card className="mt-3">
        <CardHeader>About Lorem Ipsum</CardHeader>
        <CardBody>
          <p className="mb-0">
            Lorem Ipsum is placeholder text commonly used in the graphic, print, and publishing
            industries for previewing layouts and visual mockups. It helps designers and clients
            focus on design elements without being distracted by meaningful content.
          </p>
        </CardBody>
      </Card>
    </>
  );
};
