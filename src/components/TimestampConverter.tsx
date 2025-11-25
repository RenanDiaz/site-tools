import type { ChangeEvent, FC } from "react";
import { useState, useEffect } from "react";
import {
  Button,
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

interface TimestampFormats {
  unix: string;
  unixMs: string;
  iso8601: string;
  utc: string;
  local: string;
  relative: string;
}

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSecs = Math.floor(Math.abs(diffMs) / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isPast = diffMs < 0;
  const suffix = isPast ? " ago" : " from now";

  if (diffSecs < 60) return `${diffSecs} second${diffSecs !== 1 ? "s" : ""}${suffix}`;
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""}${suffix}`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""}${suffix}`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""}${suffix}`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months !== 1 ? "s" : ""}${suffix}`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} year${years !== 1 ? "s" : ""}${suffix}`;
};

const formatTimestamp = (date: Date): TimestampFormats => ({
  unix: Math.floor(date.getTime() / 1000).toString(),
  unixMs: date.getTime().toString(),
  iso8601: date.toISOString(),
  utc: date.toUTCString(),
  local: date.toLocaleString(),
  relative: getRelativeTime(date),
});

const parseInput = (input: string): Date | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try parsing as Unix timestamp (seconds)
  const asNumber = Number(trimmed);
  if (!isNaN(asNumber)) {
    // If it's a reasonable Unix timestamp in seconds (1970-2100)
    if (asNumber > 0 && asNumber < 4102444800) {
      return new Date(asNumber * 1000);
    }
    // If it looks like milliseconds
    if (asNumber > 4102444800) {
      return new Date(asNumber);
    }
  }

  // Try parsing as ISO 8601 or other date string
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
};

export const TimestampConverter: FC = () => {
  const [input, setInput] = useState<string>("");
  const [formats, setFormats] = useState<TimestampFormats | null>(null);
  const [error, setError] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);
  const [copiedField, setCopiedField] = useState<string>("");

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const value = currentTarget.value;
    setInput(value);
    setError("");

    if (!value.trim()) {
      setFormats(null);
      return;
    }

    const date = parseInput(value);
    if (date) {
      setFormats(formatTimestamp(date));
    } else {
      setFormats(null);
      setError("Could not parse timestamp. Try Unix seconds, milliseconds, or ISO 8601 format.");
    }
  };

  const handleUseNow = () => {
    const now = new Date();
    setInput(Math.floor(now.getTime() / 1000).toString());
    setFormats(formatTimestamp(now));
    setError("");
  };

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTooltipOpen(true);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const currentFormats = formatTimestamp(currentTime);

  return (
    <>
      <h2>Timestamp Converter</h2>
      <p>Convert between Unix timestamps, ISO 8601, and human-readable dates.</p>

      <Card className="mb-4">
        <CardHeader>Current Time</CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <div className="mb-2">
                <strong>Unix (seconds):</strong>{" "}
                <code className="user-select-all">{currentFormats.unix}</code>
              </div>
              <div className="mb-2">
                <strong>ISO 8601:</strong>{" "}
                <code className="user-select-all">{currentFormats.iso8601}</code>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-2">
                <strong>Local:</strong> {currentFormats.local}
              </div>
              <div className="mb-2">
                <strong>UTC:</strong> {currentFormats.utc}
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <FormGroup>
        <Label for="timestampInput">Enter Timestamp</Label>
        <Row className="g-2">
          <Col>
            <Input
              type="text"
              id="timestampInput"
              className="font-monospace"
              placeholder="Unix timestamp, milliseconds, or ISO 8601..."
              value={input}
              onChange={handleInputChange}
            />
          </Col>
          <Col xs="auto">
            <Button color="secondary" onClick={handleUseNow}>
              Use Now
            </Button>
          </Col>
        </Row>
        <small className="text-muted">
          Examples: 1700000000, 1700000000000, 2023-11-14T22:13:20.000Z
        </small>
      </FormGroup>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {formats && (
        <Card>
          <CardHeader>Converted Formats</CardHeader>
          <CardBody>
            {[
              { label: "Unix (seconds)", value: formats.unix, key: "unix" },
              { label: "Unix (milliseconds)", value: formats.unixMs, key: "unixMs" },
              { label: "ISO 8601", value: formats.iso8601, key: "iso8601" },
              { label: "UTC", value: formats.utc, key: "utc" },
              { label: "Local", value: formats.local, key: "local" },
              { label: "Relative", value: formats.relative, key: "relative" },
            ].map(({ label, value, key }) => (
              <Row key={key} className="align-items-center mb-2">
                <Col xs={12} md={3}>
                  <strong>{label}</strong>
                </Col>
                <Col>
                  <code className="user-select-all">{value}</code>
                </Col>
                <Col xs="auto">
                  <Button
                    size="sm"
                    color={copiedField === key ? "success" : "secondary"}
                    onClick={() => handleCopy(value, key)}
                    id={`copy-${key}`}
                  >
                    <CopyIcon />
                  </Button>
                  {copiedField === key && (
                    <Tooltip placement="top" isOpen={tooltipOpen} target={`copy-${key}`} autohide={false}>
                      Copied!
                    </Tooltip>
                  )}
                </Col>
              </Row>
            ))}
          </CardBody>
        </Card>
      )}
    </>
  );
};
