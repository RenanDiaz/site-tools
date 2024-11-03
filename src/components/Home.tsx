import { FC } from "react";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";
import { Paths } from "../App";

export const Home: FC = () => {
  return (
    <Row>
      <Col>
        <h2>Home</h2>
        <p>Welcome to Site Tools.</p>
        <p>
          <Link to={Paths.Iframer}>IFramer</Link>
        </p>
        <p>
          <Link to={Paths.URLComposer}>URLComposer</Link>
        </p>
        <p>
          <Link to={Paths.TokenGen}>TokenGen</Link>
        </p>
        <p>
          <Link to={Paths.SVGToJSX}>SVG to JSX</Link>
        </p>
        <p>
          <Link to={Paths.JSONPrettyPrint}>JSON Pretty Print</Link>
        </p>
      </Col>
    </Row>
  );
};
