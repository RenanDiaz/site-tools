import { FC } from "react";
import { Col, Modal, ModalBody, Row, Spinner } from "reactstrap";
import styled from "styled-components";

export const ImageButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
`;

interface ILoadingProps {
  isLoading: boolean;
  type?: string;
  color?: string;
}

export const LoadingOverlay: FC<ILoadingProps> = ({ isLoading, type, color }) => {
  const selectedType = type ?? "border";
  const selectedColor = color ?? "dark";
  return (
    <Modal
      isOpen={isLoading}
      toggle={() => {}}
      centered
      fade={false}
      contentClassName="bg-transparent border-0"
    >
      <ModalBody>
        <Row className="justify-content-center">
          <Col xs="auto">
            <Spinner type={selectedType} color={selectedColor} />
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};
