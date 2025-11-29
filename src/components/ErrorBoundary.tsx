import { Component, type ReactNode } from "react";
import { Alert, Button, Card, CardBody, CardHeader } from "reactstrap";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <Card>
            <CardHeader className="bg-danger text-white">
              <h4 className="mb-0">Something went wrong</h4>
            </CardHeader>
            <CardBody>
              <Alert color="danger">
                <h5>An error occurred</h5>
                {this.state.error && (
                  <details className="mt-3">
                    <summary style={{ cursor: "pointer" }}>Error details</summary>
                    <pre className="mt-2 mb-0" style={{ fontSize: "0.875rem" }}>
                      {this.state.error.message}
                      {"\n\n"}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </Alert>
              <Button color="primary" onClick={this.handleReset}>
                Return to Home
              </Button>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
