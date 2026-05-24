import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false }; // Initial state indicating no error
  }

  // Lifecycle method to catch errors in the children components
  static getDerivedStateFromError(error) {
    return { hasError: true }; // Update state to indicate that there was an error
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when there is an error
      return <h2>Something went wrong.</h2>;
    }
    return this.props.children; // If no error, render the children components
  }
}

export default ErrorBoundary;
