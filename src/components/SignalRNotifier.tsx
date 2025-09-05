import { HubConnectionBuilder, type HubConnection, LogLevel } from "@microsoft/signalr";
import { useEffect, useState, type FC } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Form, Input, Label } from "reactstrap";

export const SignalRNotifier: FC = () => {
  const [signalRUrl, setSignalRUrl] = useState("");
  const [message, setMessage] = useState("");
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<string>("");

  const handleSubmitConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setStatus("");
    try {
      if (connection) {
        await connection.stop();
        setConnection(null);
        setIsConnected(false);
      }
      const newConnection = new HubConnectionBuilder()
        .withUrl(signalRUrl)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      newConnection.onclose(() => {
        setIsConnected(false);
        setStatus("Disconnected");
      });

      await newConnection.start();
      setConnection(newConnection);
      setIsConnected(true);
      setStatus("Connected");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setStatus("Connection failed: " + errorMsg);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (connection && isConnected) {
      try {
        // You may want to customize the method name and arguments
        await connection.invoke("CloudMessage", JSON.parse(message));
        setStatus("Message sent!");
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setStatus("Failed to send message: " + errorMsg);
      }
    } else {
      alert("Please establish a connection first.");
    }
  };

  useEffect(() => {
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection]);

  return (
    <div>
      <h2>SignalR Notifier</h2>
      <Card className="mb-3">
        <CardHeader>Connect to SignalR Hub</CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmitConnection} id="connectionForm">
            <div className="form-group">
              <Label>SignalR Hub URL:</Label>
              <Input
                type="text"
                value={signalRUrl}
                onChange={(e) => setSignalRUrl(e.target.value)}
                placeholder="Enter SignalR Hub URL"
                disabled={isConnecting || isConnected}
              />
            </div>
            {status && (
              <div className="mt-2">
                <small>Status: {status}</small>
              </div>
            )}
          </Form>
        </CardBody>
        <CardFooter>
          <Button
            type="submit"
            color="primary"
            form="connectionForm"
            disabled={isConnecting || isConnected || !signalRUrl}
          >
            {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Connect"}
          </Button>
        </CardFooter>
      </Card>
      <Card className="mb-3">
        <CardHeader>Send Message</CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmitMessage} id="messageForm">
            <div className="form-group">
              <Label>Message:</Label>
              <Input
                type="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message to send"
                disabled={!isConnected}
              />
            </div>
          </Form>
        </CardBody>
        <CardFooter>
          <Button
            type="submit"
            color="primary"
            form="messageForm"
            disabled={!isConnected || !message}
          >
            Send Message
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
