import React from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

const experiments = [
  { id: 1, title: "Experiment 1", description: "Description for experiment 1", path: "/experiment1" },
  { id: 2, title: "Experiment 2", description: "Description for experiment 2", path: "/experiment2" },
];

const Home = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Experiment Hub</h1>
    <Accordion type="single" collapsible>
      {experiments.map((exp) => (
        <AccordionItem key={exp.id} value={exp.title}>
          <div className="p-4">
            <h2 className="text-lg font-semibold">{exp.title}</h2>
            <p className="text-sm mb-2">{exp.description}</p>
            <Link to={exp.path} className="text-blue-500">Go to Experiment</Link>
          </div>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export default Home;
