import type { FC } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Col, Row } from "reactstrap";
import { getToolsByCategory, categoryLabels, type ToolCategory } from "../toolsConfig";

const categoryOrder: ToolCategory[] = ["generators", "encoding", "converters", "json", "web", "other"];

export const Home: FC = () => {
  const toolsByCategory = getToolsByCategory();

  return (
    <>
      <div className="mb-4">
        <h2>Site Tools</h2>
        <p className="text-muted">A collection of developer utilities for everyday tasks.</p>
      </div>

      {categoryOrder.map((category) => {
        const categoryTools = toolsByCategory[category];
        if (categoryTools.length === 0) return null;

        return (
          <div key={category} className="mb-4">
            <h5 className="text-muted mb-3">{categoryLabels[category]}</h5>
            <Row>
              {categoryTools.map((tool) => (
                <Col key={tool.path} xs={12} sm={6} lg={4} className="mb-3">
                  <Card
                    tag={Link}
                    to={tool.path}
                    className="h-100 text-decoration-none"
                    style={{ cursor: "pointer" }}
                  >
                    <CardBody>
                      <h6 className="card-title mb-2">{tool.label}</h6>
                      <p className="card-text text-muted small mb-0">{tool.description}</p>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        );
      })}
    </>
  );
};
