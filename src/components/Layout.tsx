import { useState, useMemo, type FC, type ChangeEvent } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Col,
  Container,
  Input,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
  Row,
} from "reactstrap";
import styled from "styled-components";
import { Paths, type PathsType } from "../App";

const Body = styled.div`
  margin-top: calc(66px + 1rem);
`;

const pathLabels: Record<PathsType, string> = {
  [Paths.Root]: "Home",
  [Paths.Iframer]: "Iframer",
  [Paths.URLComposer]: "URL Composer",
  [Paths.TokenGen]: "Token Generator",
  [Paths.Base64]: "Base64 Encoder/Decoder",
  [Paths.UUIDGenerator]: "UUID Generator",
  [Paths.HashGenerator]: "Hash Generator",
  [Paths.JWTDecoder]: "JWT Decoder",
  [Paths.TimestampConverter]: "Timestamp Converter",
  [Paths.URLEncoder]: "URL Encoder/Decoder",
  [Paths.StringCaseConverter]: "String Case Converter",
  [Paths.SVGToJSX]: "SVG Converter",
  [Paths.JSONPrettyPrint]: "JSON Pretty Print",
  [Paths.CookiesToJSON]: "Cookies to JSON",
  [Paths.JSONParser]: "JSON Parser",
  [Paths.SignalRNotifier]: "SignalR Notifier",
};

export const Layout: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const toggle = () => {
    setIsOpen((prev) => !prev);
    if (isOpen) {
      setSearchQuery("");
    }
  };

  const filteredPaths = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return Object.values(Paths);

    return Object.values(Paths).filter((path) => {
      const label = pathLabels[path as PathsType];
      return label?.toLowerCase().includes(query);
    });
  }, [searchQuery]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Container className="mb-4">
      <Navbar fixed="top" container expand={false}>
        <Row className="align-items-center">
          <Col xs="auto">
            <NavbarToggler onClick={toggle} />
          </Col>
          <Col xs="auto">
            <NavbarBrand href="/">Home</NavbarBrand>
          </Col>
        </Row>
        <Offcanvas isOpen={isOpen} toggle={toggle}>
          <OffcanvasHeader toggle={toggle}>Menu</OffcanvasHeader>
          <OffcanvasBody>
            <Input
              type="search"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="mb-3"
              autoFocus
            />
            <Nav vertical navbar>
              {filteredPaths.map((path) => (
                <NavItem key={path}>
                  <NavLink to={path} className="nav-link" onClick={toggle}>
                    {pathLabels[path as PathsType]}
                  </NavLink>
                </NavItem>
              ))}
              {filteredPaths.length === 0 && (
                <p className="text-muted small px-3">No tools found</p>
              )}
            </Nav>
          </OffcanvasBody>
        </Offcanvas>
      </Navbar>
      <Body>
        <Outlet />
      </Body>
    </Container>
  );
};
