import React from "react";
import { Link } from "react-router-dom";
import * as Accordion from "@radix-ui/react-accordion";
import "./Home.css";
// import { useNavigate } from "react-router-dom";

const experiments = [
  { id: 1, title: "Three.js WebXR Experiment", description: "Uses Three.sj with WebXR API for 'Instant Tracking' of cones in 3D space", path: "/three_instant_tracking" },
  { id: 2, title: "Experiment 2", description: "Description for experiment 2", path: "/second_experience" },
];

const Home = () => {
    // const navigate = useNavigate();
    return (
      <div className="container">
        <h1>Experiment Hub</h1>
        <Accordion.Root type="single" collapsible>
          {experiments.map((exp) => (
            <Accordion.Item key={exp.id} value={exp.title} className="accordion-item">
              <Accordion.Trigger className="accordion-trigger">{exp.title}</Accordion.Trigger>
              <Accordion.Content className="accordion-content">
                <p>{exp.description}</p>
                <Link to={exp.path}>Go to Experiment</Link>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    );
  };

export default Home;
