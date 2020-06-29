import React, { Component } from "react";
import { render } from "react-dom";

console.log("This is a test" + context.user)


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loaded: false,
      placeholder: "Loading"
    };
  }

  componentDidMount() {
    fetch("api/profile/" + context.user)
      .then(response => {
        if (response.status > 400) {
          return this.setState(() => {
            return { placeholder: "Something went wrong!" };
          });
        }
        return response.json();
      })
      .then(data => {
        this.setState(() => {
          return {
            data,
            loaded: true
          };
        });
      });
  }

  render() {
    return (
      <p>{this.state.data.co2points}</p>
    );
  }
}

export default App;

const container = document.getElementById("root");
render(<App />, container);