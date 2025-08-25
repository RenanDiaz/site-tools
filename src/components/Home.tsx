import type { FC } from "react";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";
import { Paths, type PathsType } from "../App";

export const Home: FC = () => {
  return (
    <Row>
      <Col>
        <h2>Home</h2>
        <p>Welcome to Site Tools.</p>
        {Object.values(Paths).map((path) => (
          <p key={path}>
            <Link to={path}>
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
                }[path as PathsType]
              }
            </Link>
          </p>
        ))}
      </Col>
    </Row>
  );
};
