import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { UserForm } from "./components/UserForm";
import { PlayRecording } from "./components/PlayRecording";
import { CustomPlayRecording } from "./components/CustomPlayRecording";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Router basename="">
        <div>
          <ul>
            <li>
              <Link to={"/"}>Home</Link>
            </li>
            <li>
              <Link to={"/play-video"}>Play Video</Link>
            </li>
            <li>
              <Link to={"/custom-video"}>Custom Video Player</Link>
            </li>
          </ul>
        </div>
        <Switch>
          <Route exact path="/" component={UserForm} />
          <Route exact path="/custom-video" component={CustomPlayRecording} />
          <Route exact path="/play-video" component={PlayRecording} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
