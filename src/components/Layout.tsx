import { useState, type FC } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Col,
  Container,
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

export const Layout: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggle = () => setIsOpen((prev) => !prev);

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
          <OffcanvasHeader toggle={toggle}>Menú</OffcanvasHeader>
          <OffcanvasBody>
            <Nav vertical navbar>
              {Object.values(Paths).map((path) => (
                <NavItem key={path}>
                  <NavLink to={path} className="nav-link" onClick={toggle}>
                    {
                      {
                        [Paths.Root]: "Home",
                        [Paths.Iframer]: "Iframer",
                        [Paths.URLComposer]: "URL Composer",
                        [Paths.TokenGen]: "Token Generator",
                        [Paths.SVGToJSX]: "SVG Converter",
                        [Paths.JSONPrettyPrint]: "JSON Pretty Print",
                        [Paths.CookiesToJSON]: "Cookies to JSON",
                        [Paths.JSONParser]: "JSON Parser",
                        [Paths.SignalRNotifier]: "SignalR Notifier",
                      }[path as PathsType]
                    }
                  </NavLink>
                </NavItem>
              ))}
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
