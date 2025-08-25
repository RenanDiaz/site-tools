import { useEffect, useState, type FC } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Button, Card, Col, Collapse, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { v4 as uuid } from "uuid";
import { CopyIcon, RemoveIcon } from "./Images";
import { Paths } from "../App";
import { urlComposerLocalStorage } from "../utility/LocalStorage";

interface SearchParam {
  name: string;
  value: string;
}

export const URLComposer: FC = () => {
  const [url, setUrl] = useState<string>("");
  const [searchParams, setSearchParams] = useState<string[]>([]);
  const [prevProtocol, setPrevProtocol] = useState<string>("http");
  const [prevDomain, setPrevDomain] = useState<string>("");
  const [prevPort, setPrevPort] = useState<string>("");
  const [prevPath, setPrevPath] = useState<string>("");
  const [prevSearchParams, setPrevSearchParams] = useState<SearchParam[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const protocol = formData.get("protocol") as string;
    const domain = formData.get("domain") as string;
    const port = formData.get("port") as string;
    const path = formData.get("path") as string;
    let url = `${protocol}://${domain}`;
    if (port) {
      url += `:${port}`;
    }
    if (path) {
      url += path.startsWith("/") ? path : `/${path}`;
    }
    if (searchParams.length > 0) {
      let search =
        "?" +
        searchParams
          .filter((id) => {
            const name = formData.get(`search-param-name-${id}`) as string;
            const value = formData.get(`search-param-value-${id}`) as string;
            return !!name && !!value;
          })
          .map((id) => {
            const name = formData.get(`search-param-name-${id}`) as string;
            const value = formData.get(`search-param-value-${id}`) as string;
            return `${name}=${value}`;
          })
          .join("&");
      if (search !== "?") {
        url += search;
      }
    }
    setUrl(url);
    const storage = {
      protocol,
      domain,
      port,
      path,
      searchParams: searchParams.map((id) => ({
        id,
        name: formData.get(`search-param-name-${id}`) as string,
        value: formData.get(`search-param-value-${id}`) as string,
      })),
    };
    urlComposerLocalStorage.set(storage);
  };

  const handleAddSearchParam = () => {
    setSearchParams((prev) => [...prev, uuid()]);
  };

  const handleRemoveSearchParam = (id: string) => {
    setSearchParams((prev) => prev.filter((p) => p !== id));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
  };

  useEffect(() => {
    urlComposerLocalStorage.get().then((value) => {
      if (value) {
        setPrevProtocol(value.protocol || "http");
        setPrevDomain(value.domain || "");
        setPrevPort(value.port || "");
        setPrevPath(value.path || "");
        setPrevSearchParams(value.searchParams || []);
        setSearchParams(value.searchParams?.map((_) => uuid()) || []);
      }
    });
  }, []);

  return (
    <>
      <h2>URLComposer</h2>
      <p>Compose a URL.</p>
      <Form onSubmit={handleSubmit}>
        <Row className="align-items-center row-cols-1 row-cols-md-4">
          <Col>
            <FormGroup floating>
              <Input
                type="select"
                id="protocol"
                name="protocol"
                required
                defaultValue={prevProtocol}
              >
                <option value="http">http</option>
                <option value="https">https</option>
              </Input>
              <Label for="protocol">Protocol</Label>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup floating>
              <Input
                type="text"
                id="domain"
                name="domain"
                placeholder="Domain"
                required
                defaultValue={prevDomain}
              />
              <Label for="domain">Domain</Label>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup floating>
              <Input type="text" id="port" name="port" placeholder="Port" defaultValue={prevPort} />
              <Label for="port">Port</Label>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup floating>
              <Input type="text" id="path" name="path" placeholder="Path" defaultValue={prevPath} />
              <Label for="path">Path</Label>
            </FormGroup>
          </Col>
        </Row>
        <Collapse isOpen={searchParams.length > 0}>
          <Card body className="mb-3">
            <Label className="text-muted">Search params</Label>
            {searchParams.map((id, index) => (
              <Row key={id} className="align-items-center">
                <Col>
                  <FormGroup floating>
                    <Input
                      type="text"
                      id={`search-param-name-${id}`}
                      name={`search-param-name-${id}`}
                      placeholder="Name"
                      defaultValue={prevSearchParams[index]?.name}
                    />
                    <Label for={`search-param-name-${id}`}>Name</Label>
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup floating>
                    <Input
                      type="text"
                      id={`search-param-value-${id}`}
                      name={`search-param-value-${id}`}
                      placeholder="Value"
                      defaultValue={prevSearchParams[index]?.value}
                    />
                    <Label for={`search-param-value-${id}`}>Value</Label>
                  </FormGroup>
                </Col>
                <Col xs="auto">
                  <Button
                    color="danger"
                    outline
                    size="lg"
                    className="border-0 pt-1 px-2 mb-3"
                    onClick={() => handleRemoveSearchParam(id)}
                  >
                    <RemoveIcon />
                  </Button>
                </Col>
              </Row>
            ))}
          </Card>
        </Collapse>
        <Row className="gx-0">
          <Col xs="auto">
            <Button type="submit" color="primary">
              Compose
            </Button>
          </Col>
          <Col xs="auto">
            <Button color="link" onClick={handleAddSearchParam}>
              Add search param
            </Button>
          </Col>
        </Row>
      </Form>
      <hr />
      <h4>URL</h4>
      <p>
        <a href={url} target="_blank" rel="noreferrer">
          {url}
        </a>
      </p>
      {!!url && (
        <Row className="gx-2">
          <Col xs="auto">
            <Button color="primary" onClick={copyToClipboard}>
              <CopyIcon />
            </Button>
          </Col>
          <Col xs="auto">
            <LinkContainer to={Paths.Iframer} state={{ url }}>
              <Button color="primary">Load into IFramer</Button>
            </LinkContainer>
          </Col>
        </Row>
      )}
    </>
  );
};
