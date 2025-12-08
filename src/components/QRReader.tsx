import type { FC } from "react";
import { useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
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
import { useRevertableState } from "../utility/useRevertableState";

export const QRReader: FC = () => {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const processImage = useCallback((imageData: ImageData): string | null => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    return code?.data || null;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setResult("");

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setError("Could not create canvas context");
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const decoded = processImage(imageData);

      if (decoded) {
        setResult(decoded);
      } else {
        setError("No QR code found in image");
      }
    };

    img.onerror = () => {
      setError("Failed to load image");
    };

    img.src = URL.createObjectURL(file);
  };

  const startCamera = async () => {
    setError("");
    setResult("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        scanFrame();
      }
    } catch {
      setError("Could not access camera. Please ensure camera permissions are granted.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setIsScanning(false);
  }, []);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const decoded = processImage(imageData);

      if (decoded) {
        setResult(decoded);
        stopCamera();
        return;
      }
    }

    animationRef.current = requestAnimationFrame(scanFrame);
  }, [processImage, stopCamera]);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(result);
    setTooltipOpen(true);
  };

  const handleClear = () => {
    setResult("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isUrl = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <>
      <h2>QR Code Reader</h2>
      <p>Decode QR codes from images or use your camera to scan.</p>

      <Row className="g-3 mb-3">
        <Col md={6}>
          <Card className="h-100">
            <CardHeader>Upload Image</CardHeader>
            <CardBody>
              <FormGroup>
                <Label for="qrImage">Select an image with a QR code</Label>
                <Input
                  type="file"
                  id="qrImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  innerRef={fileInputRef}
                />
              </FormGroup>
            </CardBody>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <CardHeader>Camera Scan</CardHeader>
            <CardBody className="d-flex flex-column justify-content-center">
              {!isScanning ? (
                <Button color="primary" onClick={startCamera} className="w-100">
                  Start Camera
                </Button>
              ) : (
                <Button color="danger" onClick={stopCamera} className="w-100">
                  Stop Camera
                </Button>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {isScanning && (
        <Card className="mb-3">
          <CardHeader>Camera Preview</CardHeader>
          <CardBody className="text-center">
            <video
              ref={videoRef}
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                border: "1px solid var(--bs-border-color)",
                borderRadius: "4px",
              }}
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <p className="text-muted mt-2 mb-0">
              Point your camera at a QR code to scan
            </p>
          </CardBody>
        </Card>
      )}

      {error && (
        <Alert color="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {result && (
        <Card className="mb-3">
          <CardHeader>
            <Row className="align-items-center">
              <Col>Decoded Result</Col>
              <Col xs="auto" className="d-flex gap-2">
                {isUrl(result) && (
                  <Button
                    color="primary"
                    size="sm"
                    tag="a"
                    href={result}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open URL
                  </Button>
                )}
                <Button color="secondary" size="sm" onClick={handleCopyClick}>
                  {tooltipOpen ? "Copied!" : "Copy"}
                </Button>
                <Button color="outline-secondary" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                margin: 0,
                padding: "0.5rem",
                backgroundColor: "var(--bs-tertiary-bg)",
                borderRadius: "4px",
              }}
            >
              {result}
            </pre>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>About QR Reader</CardHeader>
        <CardBody>
          <p className="mb-2">
            This tool can decode QR codes from:
          </p>
          <ul className="mb-2">
            <li><strong>Image files:</strong> Upload PNG, JPG, or other image formats</li>
            <li><strong>Camera:</strong> Use your device's camera for live scanning</li>
          </ul>
          <p className="mb-0">
            <strong>Tip:</strong> For best results, ensure the QR code is clearly visible and well-lit.
          </p>
        </CardBody>
      </Card>
    </>
  );
};
