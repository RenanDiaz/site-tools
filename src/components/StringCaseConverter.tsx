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
} from "reactstrap";
import styled from "styled-components";
import { CopyIcon } from "./Images";

const CustomInput = styled(Input)`
  field-sizing: content;
  min-height: 80px;
  max-height: 200px;
`;

interface CaseResult {
  name: string;
  value: string;
}

// Split input into words, handling various cases
const splitIntoWords = (str: string): string[] => {
  // Handle empty string
  if (!str.trim()) return [];

  return (
    str
      // Insert space before uppercase letters (for camelCase/PascalCase)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Replace common separators with spaces
      .replace(/[-_./\\]/g, " ")
      // Replace multiple spaces with single space
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 0)
  );
};

const toCamelCase = (words: string[]): string => {
  if (words.length === 0) return "";
  return words
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");
};

const toPascalCase = (words: string[]): string => {
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
};

const toSnakeCase = (words: string[]): string => {
  return words.map((word) => word.toLowerCase()).join("_");
};

const toScreamingSnakeCase = (words: string[]): string => {
  return words.map((word) => word.toUpperCase()).join("_");
};

const toKebabCase = (words: string[]): string => {
  return words.map((word) => word.toLowerCase()).join("-");
};

const toScreamingKebabCase = (words: string[]): string => {
  return words.map((word) => word.toUpperCase()).join("-");
};

const toTitleCase = (words: string[]): string => {
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
};

const toSentenceCase = (words: string[]): string => {
  if (words.length === 0) return "";
  return words
    .map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()
    )
    .join(" ");
};

const toLowercase = (words: string[]): string => {
  return words.join(" ").toLowerCase();
};

const toUppercase = (words: string[]): string => {
  return words.join(" ").toUpperCase();
};

const toDotCase = (words: string[]): string => {
  return words.map((word) => word.toLowerCase()).join(".");
};

const toPathCase = (words: string[]): string => {
  return words.map((word) => word.toLowerCase()).join("/");
};

export const StringCaseConverter: FC = () => {
  const [input, setInput] = useState<string>("");
  const [results, setResults] = useState<CaseResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number>(-1);

  const handleInputChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = currentTarget.value;
    setInput(value);

    const words = splitIntoWords(value);

    if (words.length === 0) {
      setResults([]);
      return;
    }

    setResults([
      { name: "camelCase", value: toCamelCase(words) },
      { name: "PascalCase", value: toPascalCase(words) },
      { name: "snake_case", value: toSnakeCase(words) },
      { name: "SCREAMING_SNAKE_CASE", value: toScreamingSnakeCase(words) },
      { name: "kebab-case", value: toKebabCase(words) },
      { name: "SCREAMING-KEBAB-CASE", value: toScreamingKebabCase(words) },
      { name: "Title Case", value: toTitleCase(words) },
      { name: "Sentence case", value: toSentenceCase(words) },
      { name: "lowercase", value: toLowercase(words) },
      { name: "UPPERCASE", value: toUppercase(words) },
      { name: "dot.case", value: toDotCase(words) },
      { name: "path/case", value: toPathCase(words) },
    ]);
  };

  const handleCopy = (value: string, index: number) => {
    navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
  };

  return (
    <>
      <h2>String Case Converter</h2>
      <p>Convert text between different naming conventions and cases.</p>

      <FormGroup>
        <CustomInput
          type="textarea"
          className="form-control"
          placeholder="Enter text to convert (e.g., hello world, helloWorld, hello_world)..."
          value={input}
          onChange={handleInputChange}
        />
      </FormGroup>

      {results.length > 0 && (
        <Card>
          <CardHeader>Converted Cases</CardHeader>
          <CardBody>
            {results.map((result, index) => (
              <Row key={result.name} className="align-items-center mb-2">
                <Col xs={12} md={3}>
                  <strong className="text-muted">{result.name}</strong>
                </Col>
                <Col>
                  <code className="user-select-all">{result.value}</code>
                </Col>
                <Col xs="auto">
                  <Button
                    size="sm"
                    color={copiedIndex === index ? "success" : "secondary"}
                    onClick={() => handleCopy(result.value, index)}
                  >
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
