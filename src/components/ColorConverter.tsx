import type { ChangeEvent, FC } from "react";
import { useCallback, useState } from "react";
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
} from "reactstrap";
import styled from "styled-components";
import { CopyIcon } from "./Images";
import { useRevertableState } from "../utility/useRevertableState";

const ColorPreview = styled.div<{ $color: string }>`
  width: 100%;
  height: 120px;
  border-radius: 8px;
  background-color: ${(props) => props.$color};
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: background-color 0.2s ease;
`;

const ColorInput = styled(Input)`
  font-family: monospace;
`;

const ColorPickerWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const ColorPickerInput = styled.input`
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }
`;

interface ColorValues {
  hex: string;
  rgb: { r: number; g: number; b: number };
  rgba: { r: number; g: number; b: number; a: number };
  hsl: { h: number; s: number; l: number };
  hsla: { h: number; s: number; l: number; a: number };
}

const defaultColor: ColorValues = {
  hex: "#3b82f6",
  rgb: { r: 59, g: 130, b: 246 },
  rgba: { r: 59, g: 130, b: 246, a: 1 },
  hsl: { h: 217, s: 91, l: 60 },
  hsla: { h: 217, s: 91, l: 60, a: 1 },
};

// Conversion utilities
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

const createColorValues = (r: number, g: number, b: number, a: number = 1): ColorValues => {
  const hsl = rgbToHsl(r, g, b);
  return {
    hex: rgbToHex(r, g, b),
    rgb: { r, g, b },
    rgba: { r, g, b, a },
    hsl,
    hsla: { ...hsl, a },
  };
};

export const ColorConverter: FC = () => {
  const [color, setColor] = useState<ColorValues>(defaultColor);
  const [alpha, setAlpha] = useState<number>(1);
  const [tooltipOpen, setTooltipOpen] = useRevertableState<boolean>(false, 2000);
  const [copiedFormat, setCopiedFormat] = useState<string>("");

  const updateFromRgb = useCallback((r: number, g: number, b: number, a: number = alpha) => {
    setColor(createColorValues(r, g, b, a));
  }, [alpha]);

  const handlePickerChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const rgb = hexToRgb(e.target.value);
      if (rgb) {
        updateFromRgb(rgb.r, rgb.g, rgb.b);
      }
    },
    [updateFromRgb]
  );

  const handleHexChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const rgb = hexToRgb(value.startsWith("#") ? value : `#${value}`);
      if (rgb) {
        updateFromRgb(rgb.r, rgb.g, rgb.b);
      }
    },
    [updateFromRgb]
  );

  const handleRgbChange = useCallback(
    (component: "r" | "g" | "b", value: string) => {
      const num = parseInt(value) || 0;
      const clamped = Math.max(0, Math.min(255, num));
      updateFromRgb(
        component === "r" ? clamped : color.rgb.r,
        component === "g" ? clamped : color.rgb.g,
        component === "b" ? clamped : color.rgb.b
      );
    },
    [color.rgb, updateFromRgb]
  );

  const handleHslChange = useCallback(
    (component: "h" | "s" | "l", value: string) => {
      const num = parseInt(value) || 0;
      let clamped: number;
      if (component === "h") {
        clamped = Math.max(0, Math.min(360, num));
      } else {
        clamped = Math.max(0, Math.min(100, num));
      }

      const newHsl = {
        h: component === "h" ? clamped : color.hsl.h,
        s: component === "s" ? clamped : color.hsl.s,
        l: component === "l" ? clamped : color.hsl.l,
      };

      const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
      updateFromRgb(rgb.r, rgb.g, rgb.b);
    },
    [color.hsl, updateFromRgb]
  );

  const handleAlphaChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0;
      const clamped = Math.max(0, Math.min(1, value));
      setAlpha(clamped);
      setColor((prev) => ({
        ...prev,
        rgba: { ...prev.rgba, a: clamped },
        hsla: { ...prev.hsla, a: clamped },
      }));
    },
    []
  );

  const copyToClipboard = useCallback(
    (format: string, value: string) => {
      navigator.clipboard.writeText(value);
      setCopiedFormat(format);
      setTooltipOpen(true);
    },
    [setTooltipOpen]
  );

  const formatValues = {
    hex: color.hex.toUpperCase(),
    rgb: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
    rgba: `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${alpha})`,
    hsl: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
    hsla: `hsla(${color.hsla.h}, ${color.hsla.s}%, ${color.hsla.l}%, ${alpha})`,
  };

  return (
    <>
      <h2>Color Converter</h2>
      <p>Convert colors between HEX, RGB, RGBA, HSL, and HSLA formats.</p>

      <Row>
        <Col xs={12} lg={4}>
          <Card className="mb-3">
            <CardHeader>Color Picker</CardHeader>
            <CardBody>
              <ColorPickerWrapper>
                <ColorPickerInput
                  type="color"
                  value={color.hex}
                  onChange={handlePickerChange}
                />
              </ColorPickerWrapper>
              <div className="mt-3">
                <Label for="alphaSlider">Alpha: {alpha.toFixed(2)}</Label>
                <Input
                  id="alphaSlider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={alpha}
                  onChange={handleAlphaChange}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Preview</CardHeader>
            <CardBody>
              <ColorPreview $color={formatValues.rgba} />
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} lg={8}>
          <Card className="mb-3">
            <CardHeader>Input Values</CardHeader>
            <CardBody>
              <FormGroup>
                <Label>HEX</Label>
                <ColorInput
                  type="text"
                  value={color.hex}
                  onChange={handleHexChange}
                  placeholder="#000000"
                />
              </FormGroup>

              <FormGroup>
                <Label>RGB</Label>
                <Row>
                  <Col>
                    <Input
                      type="number"
                      min="0"
                      max="255"
                      value={color.rgb.r}
                      onChange={(e) => handleRgbChange("r", e.target.value)}
                      placeholder="R"
                    />
                  </Col>
                  <Col>
                    <Input
                      type="number"
                      min="0"
                      max="255"
                      value={color.rgb.g}
                      onChange={(e) => handleRgbChange("g", e.target.value)}
                      placeholder="G"
                    />
                  </Col>
                  <Col>
                    <Input
                      type="number"
                      min="0"
                      max="255"
                      value={color.rgb.b}
                      onChange={(e) => handleRgbChange("b", e.target.value)}
                      placeholder="B"
                    />
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Label>HSL</Label>
                <Row>
                  <Col>
                    <Input
                      type="number"
                      min="0"
                      max="360"
                      value={color.hsl.h}
                      onChange={(e) => handleHslChange("h", e.target.value)}
                      placeholder="H"
                    />
                  </Col>
                  <Col>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={color.hsl.s}
                      onChange={(e) => handleHslChange("s", e.target.value)}
                      placeholder="S"
                    />
                  </Col>
                  <Col>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={color.hsl.l}
                      onChange={(e) => handleHslChange("l", e.target.value)}
                      placeholder="L"
                    />
                  </Col>
                </Row>
              </FormGroup>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Row className="align-items-center">
                <Col>Output Formats</Col>
                <Col xs="auto">
                  {tooltipOpen && (
                    <small className="text-success">Copied {copiedFormat}!</small>
                  )}
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {Object.entries(formatValues).map(([format, value]) => (
                <Row key={format} className="align-items-center mb-2">
                  <Col xs={3} md={2}>
                    <strong>{format.toUpperCase()}</strong>
                  </Col>
                  <Col>
                    <code className="user-select-all">{value}</code>
                  </Col>
                  <Col xs="auto">
                    <Button
                      size="sm"
                      color="secondary"
                      onClick={() => copyToClipboard(format.toUpperCase(), value)}
                    >
                      <CopyIcon />
                    </Button>
                  </Col>
                </Row>
              ))}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};
