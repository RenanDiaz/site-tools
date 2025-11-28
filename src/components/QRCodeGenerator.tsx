import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export const QRCodeGenerator: FC = () => {
  const [text, setText] = useState<string>("");
  const [size, setSize] = useState<number>(256);
  const [foregroundColor, setForegroundColor] = useState<string>("#000000");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>("M");
  const [error, setError] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    setError("");

    QRCode.toCanvas(
      canvas,
      text,
      {
        width: size,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        errorCorrectionLevel: errorCorrection,
      },
      (err) => {
        if (err) {
          setError(`Failed to generate QR code: ${err.message}`);
        }
      }
    );
  }, [text, size, foregroundColor, backgroundColor, errorCorrection]);

  const handleDownload = () => {
    if (!text.trim()) {
      setError("Please enter text to generate a QR code");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Failed to create image");
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <>
      <h2>QR Code Generator</h2>
      <p>Generate QR codes from text or URLs with customizable colors and size.</p>

      <FormGroup>
        <Label for="qrText">Text or URL</Label>
        <Input
          type="textarea"
          id="qrText"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or URL to encode..."
        />
      </FormGroup>

      <Row className="g-3 mb-3">
        <Col md={6}>
          <FormGroup>
            <Label for="qrSize">Size (px)</Label>
            <Input
              type="number"
              id="qrSize"
              min={128}
              max={1024}
              step={64}
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value) || 256)}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="errorCorrection">Error Correction</Label>
            <Input
              type="select"
              id="errorCorrection"
              value={errorCorrection}
              onChange={(e) => setErrorCorrection(e.target.value as ErrorCorrectionLevel)}
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </Input>
          </FormGroup>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={6}>
          <FormGroup>
            <Label for="fgColor">Foreground Color</Label>
            <div className="d-flex gap-2 align-items-center">
              <Input
                type="color"
                id="fgColor"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                style={{ width: 60, height: 38 }}
              />
              <Input
                type="text"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="bgColor">Background Color</Label>
            <div className="d-flex gap-2 align-items-center">
              <Input
                type="color"
                id="bgColor"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                style={{ width: 60, height: 38 }}
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </FormGroup>
        </Col>
      </Row>

      {error && (
        <Alert color="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {text.trim() && (
        <Card className="mb-3">
          <CardHeader>
            <Row className="align-items-center">
              <Col>Generated QR Code</Col>
              <Col xs="auto">
                <Button color="success" onClick={handleDownload}>
                  Download PNG
                </Button>
              </Col>
            </Row>
          </CardHeader>
          <CardBody className="text-center">
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: "100%",
                height: "auto",
                border: "1px solid var(--bs-border-color)",
                borderRadius: "4px",
              }}
            />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>About QR Codes</CardHeader>
        <CardBody>
          <p className="mb-2">
            QR (Quick Response) codes are 2D barcodes that can store various types of data including:
          </p>
          <ul className="mb-2">
            <li>URLs and website links</li>
            <li>Plain text messages</li>
            <li>Contact information (vCard)</li>
            <li>WiFi credentials</li>
            <li>Email addresses</li>
            <li>Phone numbers</li>
          </ul>
          <p className="mb-0">
            <strong>Error Correction:</strong> Higher levels allow the QR code to be readable even if
            partially damaged or obscured, but result in larger/more complex codes.
          </p>
        </CardBody>
      </Card>
    </>
  );
};
