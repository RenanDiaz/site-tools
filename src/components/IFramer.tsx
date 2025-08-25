import type { FC, FormEvent } from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Col, Collapse, Form, Input, Label, Row, Spinner } from "reactstrap";
import styled from "styled-components";
import { ChevronDown, ChevronUp } from "./Images";
import { ImageButton } from "./Utils";
import { iframerLocalStorage } from "../utility/LocalStorage";

const Iframe = styled.iframe`
  border: 1px solid #ccc;
`;

const LoadingContainer = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background: #00000080;
`;

export const IFramer: FC = () => {
  const { state } = useLocation();
  const [url, setUrl] = useState<string>("");
  const [prevURL, setPrevURL] = useState<string>("");
  const [width, setWidth] = useState<number>(500);
  const [height, setHeight] = useState<number>(500);
  const [key, setKey] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const url = formData.get("url") as string;
    setUrl(url);
    setIsLoading(true);
    iframerLocalStorage.set({ url });
  };

  const handleReload = () => {
    setKey((prev) => prev + 1);
    setIsLoading(true);
  };

  const toggleSettings = () => setShowSettings((prev) => !prev);

  const handleLoaded = () => setIsLoading(false);

  useEffect(() => {
    if (state && state.url) {
      setUrl(state.url);
      setPrevURL(state.url);
      setIsLoading(true);
    } else {
      iframerLocalStorage.get().then((value) => {
        if (value) {
          setPrevURL(value.url || "");
        }
      });
    }
  }, [state]);

  return (
    <>
      <h2>IFramer</h2>
      <p>Load URL into an iframe.</p>
      <Form onSubmit={handleSubmit}>
        <Row className="align-items-center">
          <Col>
            <div className="form-floating">
              <Input
                type="url"
                id="url"
                name="url"
                placeholder="URL"
                required
                defaultValue={prevURL}
              />
              <Label for="url">URL</Label>
            </div>
          </Col>
          <Col xs="auto">
            <Button type="submit" color="primary">
              Load
            </Button>
          </Col>
        </Row>
      </Form>
      <Row className="align-items-center gx-2 cursor-pointer" onClick={toggleSettings}>
        <Col xs="auto">Additional settings</Col>
        <Col>
          <hr />
        </Col>
        <Col xs="auto">
          <ImageButton>{showSettings ? <ChevronUp /> : <ChevronDown />}</ImageButton>
        </Col>
      </Row>
      <Collapse isOpen={showSettings}>
        <Row>
          <Col>
            <div className="form-floating">
              <Input
                type="number"
                id="width"
                name="width"
                placeholder="Width"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
              />
              <Label for="width">Width</Label>
            </div>
          </Col>
          <Col>
            <div className="form-floating">
              <Input
                type="number"
                id="height"
                name="height"
                placeholder="height"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
              />
              <Label for="heidht">Height</Label>
            </div>
          </Col>
        </Row>
      </Collapse>
      <hr />
      <Row className="mb-2">
        <Col xs="auto">
          <div className="position-relative lh-0">
            <Iframe key={key} src={url} width={width} height={height} onLoad={handleLoaded} />
            {isLoading && (
              <LoadingContainer>
                <Row className="justify-content-center align-items-center h-100">
                  <Col xs="auto">
                    <Spinner type="border" color="dark" />
                  </Col>
                </Row>
              </LoadingContainer>
            )}
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button type="button" color="primary" onClick={handleReload}>
            Reload
          </Button>
        </Col>
      </Row>
    </>
  );
};
