import { FC, useState } from "react";
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
import { Paths } from "../App";

const Body = styled.div`
  margin-top: calc(66px + 1rem);
`;

export const Layout: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <Container className="mb-4">
      <Navbar fixed="top" container expand={false} color="light">
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
              <NavItem>
                <NavLink to={Paths.Iframer} className="nav-link" onClick={toggle}>
                  IFramer
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to={Paths.URLComposer} className="nav-link" onClick={toggle}>
                  URLComposer
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to={Paths.TokenGen} className="nav-link" onClick={toggle}>
                  TokenGen
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to={Paths.SVGToJSX} className="nav-link" onClick={toggle}>
                  SVG to JSX
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to={Paths.JSONPrettyPrint} className="nav-link" onClick={toggle}>
                  JSON Pretty Print
                </NavLink>
              </NavItem>
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
