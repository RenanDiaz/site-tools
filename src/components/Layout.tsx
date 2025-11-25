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
import { Paths } from "../App";
import { tools, getToolLabel } from "../toolsConfig";

const Body = styled.div`
  margin-top: calc(66px + 1rem);
`;

export const Layout: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const toggle = () => {
    setIsOpen((prev) => !prev);
    if (isOpen) {
      setSearchQuery("");
    }
  };

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return tools;

    return tools.filter((tool) => {
      return (
        tool.label.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
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
            <NavbarBrand href="/">Site Tools</NavbarBrand>
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
              <NavItem>
                <NavLink to={Paths.Root} className="nav-link" onClick={toggle}>
                  {getToolLabel(Paths.Root)}
                </NavLink>
              </NavItem>
              <hr className="my-2" />
              {filteredTools.map((tool) => (
                <NavItem key={tool.path}>
                  <NavLink to={tool.path} className="nav-link" onClick={toggle}>
                    {tool.label}
                  </NavLink>
                </NavItem>
              ))}
              {filteredTools.length === 0 && (
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
