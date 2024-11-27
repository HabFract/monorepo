import React, { ErrorInfo, ReactNode, useEffect } from 'react';
import { useToast } from '../contexts/toast';
import { Collapse } from 'antd';
import { Button } from 'habit-fract-design-system';

// Functional component to handle toast
const ErrorToast = ({ error }: { error: Error }) => {
  const { showToast } = useToast();
  
  useEffect(() => {
    showToast(`An error occurred: ${error.message}`, {
      actionButton: <Collapse
      size="small"
      items={[{ key: '1', label: <Button type={"button"} variant="primary" onClick={() => console.log(error.stack)}>
        Show Details
      </Button>, children: <p>{error.stack}</p> }]}
    />
    });
  }, [error]);

  return null;
};

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <>
          <ErrorToast error={this.state.error} />
          {this.props.fallback}
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;