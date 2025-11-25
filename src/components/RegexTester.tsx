import type { ChangeEvent, FC } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Badge,
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

const CustomInput = styled(Input)`
  field-sizing: content;
  min-height: 100px;
  max-height: 300px;
`;

const PatternInput = styled(Input)`
  font-family: monospace;
`;

const MatchHighlight = styled.mark`
  background-color: rgba(255, 193, 7, 0.4);
  padding: 0;
  border-radius: 2px;
`;

const GroupBadge = styled(Badge)`
  font-family: monospace;
  font-size: 0.85em;
`;

interface MatchInfo {
  fullMatch: string;
  groups: (string | undefined)[];
  namedGroups: Record<string, string> | undefined;
  index: number;
}

const flagOptions = [
  { flag: "g", label: "Global", description: "Find all matches" },
  { flag: "i", label: "Case Insensitive", description: "Ignore case" },
  { flag: "m", label: "Multiline", description: "^ and $ match line boundaries" },
  { flag: "s", label: "Dotall", description: ". matches newlines" },
  { flag: "u", label: "Unicode", description: "Enable Unicode support" },
] as const;

export const RegexTester: FC = () => {
  const [pattern, setPattern] = useState<string>("");
  const [testString, setTestString] = useState<string>("");
  const [flags, setFlags] = useState<Set<string>>(new Set(["g"]));

  const handlePatternChange = useCallback(({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    setPattern(currentTarget.value);
  }, []);

  const handleTestStringChange = useCallback(({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    setTestString(currentTarget.value);
  }, []);

  const toggleFlag = useCallback((flag: string) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) {
        next.delete(flag);
      } else {
        next.add(flag);
      }
      return next;
    });
  }, []);

  const { regex, error } = useMemo(() => {
    if (!pattern) return { regex: null, error: null };
    try {
      const flagString = Array.from(flags).join("");
      return { regex: new RegExp(pattern, flagString), error: null };
    } catch (e) {
      return { regex: null, error: (e as Error).message };
    }
  }, [pattern, flags]);

  const matches: MatchInfo[] = useMemo(() => {
    if (!regex || !testString) return [];

    const results: MatchInfo[] = [];
    let match: RegExpExecArray | null;

    if (flags.has("g")) {
      while ((match = regex.exec(testString)) !== null) {
        results.push({
          fullMatch: match[0],
          groups: match.slice(1),
          namedGroups: match.groups,
          index: match.index,
        });
        // Prevent infinite loop on zero-length matches
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } else {
      match = regex.exec(testString);
      if (match) {
        results.push({
          fullMatch: match[0],
          groups: match.slice(1),
          namedGroups: match.groups,
          index: match.index,
        });
      }
    }

    return results;
  }, [regex, testString, flags]);

  const highlightedText = useMemo(() => {
    if (!regex || !testString || matches.length === 0) return null;

    const parts: Array<{ text: string; isMatch: boolean }> = [];
    let lastIndex = 0;

    for (const match of matches) {
      if (match.index > lastIndex) {
        parts.push({ text: testString.slice(lastIndex, match.index), isMatch: false });
      }
      parts.push({ text: match.fullMatch, isMatch: true });
      lastIndex = match.index + match.fullMatch.length;
    }

    if (lastIndex < testString.length) {
      parts.push({ text: testString.slice(lastIndex), isMatch: false });
    }

    return parts;
  }, [regex, testString, matches]);

  return (
    <>
      <h2>Regex Tester</h2>
      <p>Test regular expressions against text with live match highlighting.</p>

      <Row>
        <Col xs={12} lg={8}>
          <FormGroup>
            <Label for="pattern">Pattern</Label>
            <PatternInput
              id="pattern"
              type="text"
              className="form-control"
              placeholder="Enter regex pattern (e.g., \d+, [a-z]+, etc.)"
              value={pattern}
              onChange={handlePatternChange}
              invalid={!!error}
            />
          </FormGroup>
        </Col>
        <Col xs={12} lg={4}>
          <Label>Flags</Label>
          <div className="d-flex flex-wrap gap-2">
            {flagOptions.map(({ flag, label, description }) => (
              <Badge
                key={flag}
                color={flags.has(flag) ? "primary" : "secondary"}
                style={{ cursor: "pointer" }}
                onClick={() => toggleFlag(flag)}
                title={description}
              >
                {label} ({flag})
              </Badge>
            ))}
          </div>
        </Col>
      </Row>

      {error && (
        <Alert color="danger" className="mt-2">
          <strong>Invalid pattern:</strong> {error}
        </Alert>
      )}

      <FormGroup className="mt-3">
        <Label for="testString">Test String</Label>
        <CustomInput
          id="testString"
          type="textarea"
          className="form-control"
          placeholder="Enter text to test against..."
          value={testString}
          onChange={handleTestStringChange}
        />
      </FormGroup>

      <Row className="mt-3">
        <Col xs={12} lg={6}>
          <Card>
            <CardHeader>
              <Row className="align-items-center">
                <Col>Matches</Col>
                <Col xs="auto">
                  <Badge color={matches.length > 0 ? "success" : "secondary"}>
                    {matches.length} match{matches.length !== 1 ? "es" : ""}
                  </Badge>
                </Col>
              </Row>
            </CardHeader>
            <CardBody style={{ maxHeight: 300, overflowY: "auto" }}>
              {matches.length === 0 ? (
                <span className="text-muted">
                  {!pattern ? "Enter a pattern to start" : !testString ? "Enter test string" : "No matches found"}
                </span>
              ) : (
                matches.map((match, idx) => (
                  <div key={idx} className="mb-3 pb-2 border-bottom">
                    <div className="mb-1">
                      <strong>Match {idx + 1}</strong>
                      <span className="text-muted ms-2">at index {match.index}</span>
                    </div>
                    <code className="d-block mb-2" style={{ wordBreak: "break-all" }}>
                      "{match.fullMatch}"
                    </code>
                    {match.groups.length > 0 && (
                      <div>
                        <small className="text-muted">Capture groups:</small>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {match.groups.map((group, gIdx) => (
                            <GroupBadge key={gIdx} color="info">
                              ${gIdx + 1}: {group ?? "(empty)"}
                            </GroupBadge>
                          ))}
                        </div>
                      </div>
                    )}
                    {match.namedGroups && Object.keys(match.namedGroups).length > 0 && (
                      <div className="mt-1">
                        <small className="text-muted">Named groups:</small>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {Object.entries(match.namedGroups).map(([name, value]) => (
                            <GroupBadge key={name} color="warning">
                              {name}: {value}
                            </GroupBadge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} lg={6} className="mt-3 mt-lg-0">
          <Card>
            <CardHeader>Highlighted Preview</CardHeader>
            <CardBody style={{ maxHeight: 300, overflowY: "auto" }}>
              {highlightedText ? (
                <pre className="mb-0" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {highlightedText.map((part, idx) =>
                    part.isMatch ? (
                      <MatchHighlight key={idx}>{part.text}</MatchHighlight>
                    ) : (
                      <span key={idx}>{part.text}</span>
                    )
                  )}
                </pre>
              ) : (
                <span className="text-muted">
                  {!testString ? "Enter text to see preview" : "No matches to highlight"}
                </span>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};
