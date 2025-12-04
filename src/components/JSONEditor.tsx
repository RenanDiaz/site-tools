import type { ChangeEvent, FC } from "react";
import { useState, useCallback } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Row,
  Tooltip,
  Badge,
} from "reactstrap";
import styled from "styled-components";
import { CopyIcon } from "./Images";
import { useRevertableState } from "../utility/useRevertableState";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const TreeContainer = styled.div`
  font-family: monospace;
  font-size: 0.9rem;
`;

const TreeNode = styled.div<{ $depth: number }>`
  margin-left: ${(props) => props.$depth * 20}px;
  padding: 4px 0;
`;

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const KeyLabel = styled.span`
  color: #9cdcfe;
  font-weight: 500;
`;

const TypeBadge = styled(Badge)`
  font-size: 0.7rem;
  padding: 2px 6px;
`;

const ActionButton = styled(Button)`
  padding: 2px 8px;
  font-size: 0.75rem;
`;

const ValueInput = styled(Input)`
  max-width: 300px;
  font-family: monospace;
  font-size: 0.85rem;
`;

const AddFieldContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
  flex-wrap: wrap;
`;

interface JsonNodeProps {
  keyName: string | number | null;
  value: JsonValue;
  path: (string | number)[];
  onUpdate: (path: (string | number)[], newValue: JsonValue) => void;
  onRemove: (path: (string | number)[]) => void;
  onAddField: (path: (string | number)[], key: string, value: JsonValue) => void;
  onAddArrayItem: (path: (string | number)[], value: JsonValue) => void;
  depth: number;
}

const getValueType = (value: JsonValue): string => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
};

const JsonNode: FC<JsonNodeProps> = ({
  keyName,
  value,
  path,
  onUpdate,
  onRemove,
  onAddField,
  onAddArrayItem,
  depth,
}) => {
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [newFieldType, setNewFieldType] = useState<"string" | "number" | "boolean" | "null" | "object" | "array">("string");
  const [newArrayValue, setNewArrayValue] = useState("");
  const [newArrayType, setNewArrayType] = useState<"string" | "number" | "boolean" | "null" | "object" | "array">("string");
  const [isExpanded, setIsExpanded] = useState(depth < 3);

  const valueType = getValueType(value);

  const parseValue = (val: string, type: string): JsonValue => {
    switch (type) {
      case "number":
        return parseFloat(val) || 0;
      case "boolean":
        return val.toLowerCase() === "true";
      case "null":
        return null;
      case "object":
        return {};
      case "array":
        return [];
      default:
        return val;
    }
  };

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    let parsedValue: JsonValue;

    if (valueType === "number") {
      parsedValue = parseFloat(newVal) || 0;
    } else if (valueType === "boolean") {
      parsedValue = newVal.toLowerCase() === "true";
    } else {
      parsedValue = newVal;
    }

    onUpdate(path, parsedValue);
  };

  const handleAddField = () => {
    if (!newFieldKey.trim()) return;
    const parsedValue = parseValue(newFieldValue, newFieldType);
    onAddField(path, newFieldKey.trim(), parsedValue);
    setNewFieldKey("");
    setNewFieldValue("");
  };

  const handleAddArrayItem = () => {
    const parsedValue = parseValue(newArrayValue, newArrayType);
    onAddArrayItem(path, parsedValue);
    setNewArrayValue("");
  };

  const renderPrimitiveValue = () => {
    if (valueType === "null") {
      return <Badge color="secondary">null</Badge>;
    }
    if (valueType === "boolean") {
      return (
        <Input
          type="select"
          value={value ? "true" : "false"}
          onChange={(e) => onUpdate(path, e.target.value === "true")}
          style={{ width: 100, display: "inline-block" }}
          bsSize="sm"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </Input>
      );
    }
    return (
      <ValueInput
        type={valueType === "number" ? "number" : "text"}
        value={String(value)}
        onChange={handleValueChange}
        bsSize="sm"
      />
    );
  };

  const renderKey = () => {
    if (keyName === null) return null;
    return (
      <>
        <KeyLabel>
          {typeof keyName === "number" ? `[${keyName}]` : `"${keyName}"`}
        </KeyLabel>
        <span>:</span>
      </>
    );
  };

  if (valueType === "object" && !Array.isArray(value)) {
    const obj = value as { [key: string]: JsonValue };
    const keys = Object.keys(obj);

    return (
      <TreeNode $depth={depth}>
        <FieldRow>
          {renderKey()}
          <TypeBadge color="info">object</TypeBadge>
          <Badge color="secondary">{keys.length} fields</Badge>
          <ActionButton
            color="link"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "collapse" : "expand"}
          </ActionButton>
          {depth > 0 && (
            <ActionButton color="danger" size="sm" onClick={() => onRemove(path)}>
              Remove
            </ActionButton>
          )}
        </FieldRow>
        {isExpanded && (
          <>
            {keys.map((key) => (
              <JsonNode
                key={key}
                keyName={key}
                value={obj[key]}
                path={[...path, key]}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onAddField={onAddField}
                onAddArrayItem={onAddArrayItem}
                depth={depth + 1}
              />
            ))}
            <TreeNode $depth={depth + 1}>
              <AddFieldContainer>
                <Input
                  type="text"
                  placeholder="Key"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  bsSize="sm"
                  style={{ width: 120 }}
                />
                <Input
                  type="select"
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as typeof newFieldType)}
                  bsSize="sm"
                  style={{ width: 100 }}
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="null">null</option>
                  <option value="object">object</option>
                  <option value="array">array</option>
                </Input>
                {newFieldType !== "null" && newFieldType !== "object" && newFieldType !== "array" && (
                  <ValueInput
                    type={newFieldType === "number" ? "number" : "text"}
                    placeholder="Value"
                    value={newFieldValue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewFieldValue(e.target.value)}
                    bsSize="sm"
                  />
                )}
                <ActionButton color="success" size="sm" onClick={handleAddField}>
                  + Add Field
                </ActionButton>
              </AddFieldContainer>
            </TreeNode>
          </>
        )}
      </TreeNode>
    );
  }

  if (Array.isArray(value)) {
    return (
      <TreeNode $depth={depth}>
        <FieldRow>
          {renderKey()}
          <TypeBadge color="warning">array</TypeBadge>
          <Badge color="secondary">{value.length} items</Badge>
          <ActionButton
            color="link"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "collapse" : "expand"}
          </ActionButton>
          {depth > 0 && (
            <ActionButton color="danger" size="sm" onClick={() => onRemove(path)}>
              Remove
            </ActionButton>
          )}
        </FieldRow>
        {isExpanded && (
          <>
            {value.map((item, index) => (
              <JsonNode
                key={index}
                keyName={index}
                value={item}
                path={[...path, index]}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onAddField={onAddField}
                onAddArrayItem={onAddArrayItem}
                depth={depth + 1}
              />
            ))}
            <TreeNode $depth={depth + 1}>
              <AddFieldContainer>
                <Input
                  type="select"
                  value={newArrayType}
                  onChange={(e) => setNewArrayType(e.target.value as typeof newArrayType)}
                  bsSize="sm"
                  style={{ width: 100 }}
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="null">null</option>
                  <option value="object">object</option>
                  <option value="array">array</option>
                </Input>
                {newArrayType !== "null" && newArrayType !== "object" && newArrayType !== "array" && (
                  <ValueInput
                    type={newArrayType === "number" ? "number" : "text"}
                    placeholder="Value"
                    value={newArrayValue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewArrayValue(e.target.value)}
                    bsSize="sm"
                  />
                )}
                <ActionButton color="success" size="sm" onClick={handleAddArrayItem}>
                  + Add Item
                </ActionButton>
              </AddFieldContainer>
            </TreeNode>
          </>
        )}
      </TreeNode>
    );
  }

  // Primitive value
  return (
    <TreeNode $depth={depth}>
      <FieldRow>
        {renderKey()}
        <TypeBadge
          color={
            valueType === "string"
              ? "success"
              : valueType === "number"
              ? "primary"
              : valueType === "boolean"
              ? "info"
              : "secondary"
          }
        >
          {valueType}
        </TypeBadge>
        {renderPrimitiveValue()}
        {depth > 0 && (
          <ActionButton color="danger" size="sm" onClick={() => onRemove(path)}>
            Remove
          </ActionButton>
        )}
      </FieldRow>
    </TreeNode>
  );
};

export const JSONEditor: FC = () => {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [jsonData, setJsonData] = useState<JsonValue | null>(null);
  const [error, setError] = useState<string>("");
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const handleParse = () => {
    if (!jsonInput.trim()) {
      setError("Please enter some JSON");
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonData(parsed);
      setError("");
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
      setJsonData(null);
    }
  };

  const handleLoadExample = () => {
    const example = {
      name: "John Doe",
      age: 30,
      isActive: true,
      email: null,
      address: {
        street: "123 Main St",
        city: "New York",
        zip: "10001",
      },
      hobbies: ["reading", "coding", "gaming"],
      projects: [
        { name: "Project A", status: "completed" },
        { name: "Project B", status: "in-progress" },
      ],
    };
    setJsonInput(JSON.stringify(example, null, 2));
  };

  const handleUpdate = useCallback((path: (string | number)[], newValue: JsonValue) => {
    setJsonData((prev) => {
      if (prev === null) return null;
      if (path.length === 0) return newValue;

      const newData = JSON.parse(JSON.stringify(prev));
      let current: JsonValue = newData;

      for (let i = 0; i < path.length - 1; i++) {
        current = (current as Record<string, JsonValue>)[path[i] as string];
      }

      const lastKey = path[path.length - 1];
      (current as Record<string, JsonValue>)[lastKey as string] = newValue;

      return newData;
    });
  }, []);

  const handleRemove = useCallback((path: (string | number)[]) => {
    setJsonData((prev) => {
      if (prev === null || path.length === 0) return prev;

      const newData = JSON.parse(JSON.stringify(prev));
      let current: JsonValue = newData;

      for (let i = 0; i < path.length - 1; i++) {
        current = (current as Record<string, JsonValue>)[path[i] as string];
      }

      const lastKey = path[path.length - 1];
      if (Array.isArray(current)) {
        current.splice(lastKey as number, 1);
      } else {
        delete (current as Record<string, JsonValue>)[lastKey as string];
      }

      return newData;
    });
  }, []);

  const handleAddField = useCallback((path: (string | number)[], key: string, value: JsonValue) => {
    setJsonData((prev) => {
      if (prev === null) return prev;

      const newData = JSON.parse(JSON.stringify(prev));
      let current: JsonValue = newData;

      for (const p of path) {
        current = (current as Record<string, JsonValue>)[p as string];
      }

      (current as Record<string, JsonValue>)[key] = value;

      return newData;
    });
  }, []);

  const handleAddArrayItem = useCallback((path: (string | number)[], value: JsonValue) => {
    setJsonData((prev) => {
      if (prev === null) return prev;

      const newData = JSON.parse(JSON.stringify(prev));
      let current: JsonValue = newData;

      for (const p of path) {
        current = (current as Record<string, JsonValue>)[p as string];
      }

      (current as JsonValue[]).push(value);

      return newData;
    });
  }, []);

  const handleCopy = () => {
    if (jsonData !== null) {
      navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
      setTooltipOpen(true);
    }
  };

  const handleApplyToInput = () => {
    if (jsonData !== null) {
      setJsonInput(JSON.stringify(jsonData, null, 2));
    }
  };

  return (
    <>
      <h2>JSON Editor</h2>
      <p>
        Edit JSON by adding or removing fields and array items. Paste your JSON below
        and click "Parse" to start editing.
      </p>

      <FormGroup>
        <Input
          type="textarea"
          rows={8}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste your JSON here..."
          style={{ fontFamily: "monospace" }}
        />
      </FormGroup>

      <FormGroup className="d-flex gap-2 flex-wrap">
        <Button color="primary" onClick={handleParse}>
          Parse JSON
        </Button>
        <Button color="secondary" onClick={handleLoadExample}>
          Load Example
        </Button>
        {jsonData !== null && (
          <Button color="info" onClick={handleApplyToInput}>
            Apply Changes to Input
          </Button>
        )}
      </FormGroup>

      {error && <Alert color="danger">{error}</Alert>}

      {jsonData !== null && (
        <>
          <Card className="mb-3">
            <CardHeader>
              <Row className="align-items-center">
                <Col>Editor</Col>
              </Row>
            </CardHeader>
            <CardBody style={{ maxHeight: 500, overflowY: "auto" }}>
              <TreeContainer>
                <JsonNode
                  keyName={null}
                  value={jsonData}
                  path={[]}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                  onAddField={handleAddField}
                  onAddArrayItem={handleAddArrayItem}
                  depth={0}
                />
              </TreeContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Row className="align-items-center">
                <Col>Output</Col>
                <Col xs="auto">
                  <Button color="primary" onClick={handleCopy} id="jsonEditorCopyTooltip">
                    <CopyIcon />
                  </Button>
                  <Tooltip
                    placement="top"
                    isOpen={tooltipOpen}
                    target="jsonEditorCopyTooltip"
                  >
                    Copied!
                  </Tooltip>
                </Col>
              </Row>
            </CardHeader>
            <CardBody style={{ maxHeight: 400, overflowY: "auto" }}>
              <pre style={{ margin: 0 }}>
                <code>{JSON.stringify(jsonData, null, 2)}</code>
              </pre>
            </CardBody>
          </Card>
        </>
      )}

      <Card className="mt-3">
        <CardHeader>Features</CardHeader>
        <CardBody>
          <ul className="mb-0">
            <li>Parse and validate JSON input</li>
            <li>Visual tree-based editing interface</li>
            <li>Add new fields to objects with type selection</li>
            <li>Remove fields from objects</li>
            <li>Add items to arrays with type selection</li>
            <li>Remove items from arrays</li>
            <li>Edit primitive values (strings, numbers, booleans)</li>
            <li>Collapse/expand nested objects and arrays</li>
            <li>Copy modified JSON to clipboard</li>
          </ul>
        </CardBody>
      </Card>
    </>
  );
};
