import React from "react";
import { Link } from "react-router-dom";
import * as Accordion from "@radix-ui/react-accordion";
import "./Home.css";

const experiments = [
  { id: 1, title: "Experiment 1", description: "Description for experiment 1", path: "/experiment1" },
  { id: 2, title: "Experiment 2", description: "Description for experiment 2", path: "/experiment2" },
];

const Home = () => {
    return (
      <div className="container">
        <h1>Experiment Hub</h1>
        <Accordion.Root type="single" collapsible>
          {experiments.map((exp) => (
            <Accordion.Item key={exp.id} value={exp.title} className="accordion-item">
              <Accordion.Trigger className="accordion-trigger">{exp.title}</Accordion.Trigger>
              <Accordion.Content className="accordion-content">
                <p>{exp.description}</p>
                <a href={exp.path}>Go to Experiment</a>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    );
  };

export default Home;
