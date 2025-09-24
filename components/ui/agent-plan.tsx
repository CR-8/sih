"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

// Type definitions
interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tools?: string[]; // Optional array of MCP server tools
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
}

// Initial task data for design workflow
const initialTasks: Task[] = [
  {
    id: "1",
    title: "Gather Design Requirements",
    description:
      "Collect all necessary information about design preferences, target audience, and project goals",
    status: "in-progress",
    priority: "high",
    level: 0,
    dependencies: [],
    subtasks: [
      {
        id: "1.1",
        title: "Define target audience",
        description:
          "Identify the primary users and their demographics for the design",
        status: "completed",
        priority: "high",
        tools: ["user-research", "analytics"],
      },
      {
        id: "1.2",
        title: "Collect brand preferences",
        description:
          "Gather information about preferred themes, colors, and visual style",
        status: "in-progress",
        priority: "high",
        tools: ["brand-analyzer", "color-extractor"],
      },
      {
        id: "1.3",
        title: "Document project scope",
        description:
          "Create a comprehensive brief outlining all design requirements",
        status: "pending",
        priority: "medium",
        tools: ["documentation-generator"],
      },
    ],
  },
  {
    id: "2",
    title: "Create Design System Foundation",
    description: "Establish the core design system including colors, typography, and components",
    status: "pending",
    priority: "high",
    level: 0,
    dependencies: ["1"],
    subtasks: [
      {
        id: "2.1",
        title: "Generate color palette",
        description: "Create a cohesive color scheme based on brand preferences",
        status: "pending",
        priority: "high",
        tools: ["color-palette-generator", "accessibility-checker"],
      },
      {
        id: "2.2",
        title: "Define typography system",
        description:
          "Select and configure fonts for headings, body text, and UI elements",
        status: "pending",
        priority: "high",
        tools: ["typography-analyzer", "font-pairing"],
      },
      {
        id: "2.3",
        title: "Create spacing and layout guidelines",
        description: "Establish consistent spacing, grid systems, and layout principles",
        status: "pending",
        priority: "medium",
        tools: ["layout-generator", "grid-system"],
      },
    ],
  },
  {
    id: "3",
    title: "Design Component Library",
    description: "Build reusable UI components following the design system",
    status: "pending",
    priority: "medium",
    level: 1,
    dependencies: ["2"],
    subtasks: [
      {
        id: "3.1",
        title: "Design basic components",
        description: "Create buttons, forms, cards, and other fundamental components",
        status: "pending",
        priority: "high",
        tools: ["component-designer", "figma-connector"],
      },
      {
        id: "3.2",
        title: "Create navigation components",
        description: "Design headers, menus, breadcrumbs, and navigation elements",
        status: "pending",
        priority: "medium",
        tools: ["navigation-designer", "usability-tester"],
      },
      {
        id: "3.3",
        title: "Build complex components",
        description: "Design modals, tables, dashboards, and advanced UI elements",
        status: "pending",
        priority: "low",
        tools: ["advanced-designer", "interaction-prototyper"],
      },
    ],
  },
  {
    id: "4",
    title: "Create Wireframes and Prototypes",
    description: "Develop wireframes and interactive prototypes for user testing",
    status: "pending",
    priority: "high",
    level: 1,
    dependencies: ["2"],
    subtasks: [
      {
        id: "4.1",
        title: "Create low-fidelity wireframes",
        description: "Design basic layout structures and user flow wireframes",
        status: "pending",
        priority: "high",
        tools: ["wireframe-generator", "layout-planner"],
      },
      {
        id: "4.2",
        title: "Build interactive prototypes",
        description: "Create clickable prototypes to test user interactions",
        status: "pending",
        priority: "medium",
        tools: ["prototype-builder", "interaction-designer"],
      },
      {
        id: "4.3",
        title: "Conduct usability testing",
        description: "Test prototypes with users and gather feedback for improvements",
        status: "pending",
        priority: "medium",
        tools: ["usability-tester", "feedback-collector"],
      },
    ],
  },
  {
    id: "5",
    title: "Finalize Design Specifications",
    description: "Create detailed design specifications and handoff documentation",
    status: "pending",
    priority: "medium",
    level: 2,
    dependencies: ["3", "4"],
    subtasks: [
      {
        id: "5.1",
        title: "Create design specifications",
        description: "Document all design decisions, measurements, and implementation details",
        status: "pending",
        priority: "high",
        tools: ["spec-generator", "measurement-tool"],
      },
      {
        id: "5.2",
        title: "Generate style guide",
        description: "Create comprehensive style guide for developers and stakeholders",
        status: "pending",
        priority: "medium",
        tools: ["style-guide-generator", "documentation-tool"],
      },
      {
        id: "5.3",
        title: "Prepare handoff assets",
        description: "Export all necessary assets and prepare for development handoff",
        status: "pending",
        priority: "medium",
        tools: ["asset-exporter", "handoff-tool"],
      },
    ],
  },
];

interface AgentPlanProps {
  tasks?: Task[];
  onTaskUpdate?: (tasks: Task[]) => void;
  className?: string;
}

export default function AgentPlan({ 
  tasks: externalTasks, 
  onTaskUpdate, 
  className = "" 
}: AgentPlanProps) {
  const [tasks, setTasks] = useState<Task[]>(externalTasks || initialTasks);
  const [expandedTasks, setExpandedTasks] = useState<string[]>(["1"]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});

  // Add support for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

  // Update tasks and notify parent component
  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    onTaskUpdate?.(newTasks);
  };

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  // Toggle subtask expansion
  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Toggle task status with realistic progression
  const toggleTaskStatus = (taskId: string) => {
    updateTasks(tasks.map((task) => {
      if (task.id === taskId) {
        const statusFlow = ["pending", "in-progress", "completed"];
        const currentIndex = statusFlow.indexOf(task.status);
        const nextIndex = currentIndex >= statusFlow.length - 1 ? 0 : currentIndex + 1;
        const newStatus = statusFlow[nextIndex];

        // If task is now completed, mark all subtasks as completed
        const updatedSubtasks = task.subtasks.map((subtask) => ({
          ...subtask,
          status: newStatus === "completed" ? "completed" : subtask.status,
        }));

        return {
          ...task,
          status: newStatus,
          subtasks: updatedSubtasks,
        };
      }
      return task;
    }));
  };

  // Toggle subtask status
  const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
    updateTasks(tasks.map((task) => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map((subtask) => {
          if (subtask.id === subtaskId) {
            const statusFlow = ["pending", "in-progress", "completed"];
            const currentIndex = statusFlow.indexOf(subtask.status);
            const nextIndex = currentIndex >= statusFlow.length - 1 ? 0 : currentIndex + 1;
            return { ...subtask, status: statusFlow[nextIndex] };
          }
          return subtask;
        });

        // Calculate if task should be auto-completed when all subtasks are done
        const allSubtasksCompleted = updatedSubtasks.every(
          (s) => s.status === "completed",
        );

        return {
          ...task,
          subtasks: updatedSubtasks,
          status: allSubtasksCompleted ? "completed" : task.status,
        };
      }
      return task;
    }));
  };

  // Animation variants with reduced motion support
  const taskVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : -5 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: prefersReducedMotion 
        ? { type: "tween" as const, duration: 0.2 }
        : { type: "spring" as const, stiffness: 500, damping: 30 }
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -5,
      transition: { duration: 0.15 }
    }
  };

  const subtaskListVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      overflow: "hidden" 
    },
    visible: { 
      height: "auto", 
      opacity: 1,
      overflow: "visible",
      transition: { 
        duration: 0.25, 
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        when: "beforeChildren" as const
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      overflow: "hidden",
      transition: { 
        duration: 0.2
      }
    }
  };

  const subtaskVariants = {
    hidden: { 
      opacity: 0, 
      x: prefersReducedMotion ? 0 : -10 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: prefersReducedMotion 
        ? { type: "tween" as const, duration: 0.2 }
        : { type: "spring" as const, stiffness: 500, damping: 25 }
    },
    exit: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : -10,
      transition: { duration: 0.15 }
    }
  };

  const subtaskDetailsVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      overflow: "hidden"
    },
    visible: { 
      opacity: 1, 
      height: "auto",
      overflow: "visible",
      transition: { 
        duration: 0.25
      }
    }
  };

  // Status badge animation variants
  const statusBadgeVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: prefersReducedMotion ? 1 : [1, 1.08, 1],
      transition: { 
        duration: 0.35
      }
    }
  };

  return (
    <div className={`bg-background text-foreground h-full overflow-auto p-2 ${className}`}>
      <motion.div 
        className="bg-card border-border rounded-lg border shadow overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.3
          }
        }}
      >
        <LayoutGroup>
          <div className="p-4 overflow-hidden">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground mb-2">Design Workflow Plan</h2>
              <p className="text-sm text-muted-foreground">
                Follow this roadmap to create a comprehensive design system and user experience
              </p>
            </div>
            
            <ul className="space-y-1 overflow-hidden">
              {tasks.map((task, index) => {
                const isExpanded = expandedTasks.includes(task.id);
                const isCompleted = task.status === "completed";

                return (
                  <motion.li
                    key={task.id}
                    className={` ${index !== 0 ? "mt-1 pt-2" : ""} `}
                    initial="hidden"
                    animate="visible"
                    variants={taskVariants}
                  >
                    {/* Task row */}
                    <motion.div 
                      className="group flex items-center px-3 py-1.5 rounded-md"
                      whileHover={{ 
                        backgroundColor: "rgba(0,0,0,0.03)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <motion.div
                        className="mr-2 flex-shrink-0 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskStatus(task.id);
                        }}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={task.status}
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                            transition={{
                              duration: 0.2
                            }}
                          >
                            {task.status === "completed" ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
                            ) : task.status === "in-progress" ? (
                              <CircleDotDashed className="h-4.5 w-4.5 text-blue-500" />
                            ) : task.status === "need-help" ? (
                              <CircleAlert className="h-4.5 w-4.5 text-yellow-500" />
                            ) : task.status === "failed" ? (
                              <CircleX className="h-4.5 w-4.5 text-red-500" />
                            ) : (
                              <Circle className="text-muted-foreground h-4.5 w-4.5" />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>

                      <motion.div
                        className="flex min-w-0 flex-grow cursor-pointer items-center justify-between"
                        onClick={() => toggleTaskExpansion(task.id)}
                      >
                        <div className="mr-2 flex-1 truncate">
                          <span
                            className={`${isCompleted ? "text-muted-foreground line-through" : ""}`}
                          >
                            {task.title}
                          </span>
                        </div>

                        <div className="flex flex-shrink-0 items-center space-x-2 text-xs">
                          {task.dependencies.length > 0 && (
                            <div className="flex items-center mr-2">
                              <div className="flex flex-wrap gap-1">
                                {task.dependencies.map((dep, idx) => (
                                  <motion.span
                                    key={idx}
                                    className="bg-secondary/40 text-secondary-foreground rounded px-1.5 py-0.5 text-[10px] font-medium shadow-sm"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                      duration: 0.2,
                                      delay: idx * 0.05
                                    }}
                                    whileHover={{ 
                                      y: -1, 
                                      backgroundColor: "rgba(0,0,0,0.1)",
                                      transition: { duration: 0.2 } 
                                    }}
                                  >
                                    Depends on #{dep}
                                  </motion.span>
                                ))}
                              </div>
                            </div>
                          )}

                          <motion.span
                            className={`rounded px-1.5 py-0.5 ${
                              task.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : task.status === "in-progress"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                  : task.status === "need-help"
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                    : task.status === "failed"
                                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                      : "bg-muted text-muted-foreground"
                            }`}
                            variants={statusBadgeVariants}
                            initial="initial"
                            animate="animate"
                            key={task.status}
                          >
                            {task.status}
                          </motion.span>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Subtasks */}
                    <AnimatePresence mode="wait">
                      {isExpanded && task.subtasks.length > 0 && (
                        <motion.div 
                          className="relative overflow-hidden"
                          variants={subtaskListVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          layout
                        >
                          <div className="absolute top-0 bottom-0 left-[20px] border-l-2 border-dashed border-muted-foreground/30" />
                          <ul className="border-muted mt-1 mr-2 mb-1.5 ml-3 space-y-0.5">
                            {task.subtasks.map((subtask) => {
                              const subtaskKey = `${task.id}-${subtask.id}`;
                              const isSubtaskExpanded = expandedSubtasks[subtaskKey];

                              return (
                                <motion.li
                                  key={subtask.id}
                                  className="group flex flex-col py-0.5 pl-6"
                                  onClick={() =>
                                    toggleSubtaskExpansion(task.id, subtask.id)
                                  }
                                  variants={subtaskVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  layout
                                >
                                  <motion.div 
                                    className="flex flex-1 items-center rounded-md p-1"
                                    whileHover={{ 
                                      backgroundColor: "rgba(0,0,0,0.03)",
                                      transition: { duration: 0.2 }
                                    }}
                                    layout
                                  >
                                    <motion.div
                                      className="mr-2 flex-shrink-0 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSubtaskStatus(task.id, subtask.id);
                                      }}
                                      whileTap={{ scale: 0.9 }}
                                      whileHover={{ scale: 1.1 }}
                                      layout
                                    >
                                      <AnimatePresence mode="wait">
                                        <motion.div
                                          key={subtask.status}
                                          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                          exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                                          transition={{
                                            duration: 0.2
                                          }}
                                        >
                                          {subtask.status === "completed" ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                          ) : subtask.status === "in-progress" ? (
                                            <CircleDotDashed className="h-3.5 w-3.5 text-blue-500" />
                                          ) : subtask.status === "need-help" ? (
                                            <CircleAlert className="h-3.5 w-3.5 text-yellow-500" />
                                          ) : subtask.status === "failed" ? (
                                            <CircleX className="h-3.5 w-3.5 text-red-500" />
                                          ) : (
                                            <Circle className="text-muted-foreground h-3.5 w-3.5" />
                                          )}
                                        </motion.div>
                                      </AnimatePresence>
                                    </motion.div>

                                    <span
                                      className={`cursor-pointer text-sm ${subtask.status === "completed" ? "text-muted-foreground line-through" : ""}`}
                                    >
                                      {subtask.title}
                                    </span>
                                  </motion.div>

                                  <AnimatePresence mode="wait">
                                    {isSubtaskExpanded && (
                                      <motion.div 
                                        className="text-muted-foreground border-foreground/20 mt-1 ml-1.5 border-l border-dashed pl-5 text-xs overflow-hidden"
                                        variants={subtaskDetailsVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        layout
                                      >
                                        <p className="py-1">{subtask.description}</p>
                                        {subtask.tools && subtask.tools.length > 0 && (
                                          <div className="mt-0.5 mb-1 flex flex-wrap items-center gap-1.5">
                                            <span className="text-muted-foreground font-medium">
                                              Tools:
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                              {subtask.tools.map((tool, idx) => (
                                                <motion.span
                                                  key={idx}
                                                  className="bg-secondary/40 text-secondary-foreground rounded px-1.5 py-0.5 text-[10px] font-medium shadow-sm"
                                                  initial={{ opacity: 0, y: -5 }}
                                                  animate={{ 
                                                    opacity: 1, 
                                                    y: 0,
                                                    transition: {
                                                      duration: 0.2,
                                                      delay: idx * 0.05
                                                    }
                                                  }}
                                                  whileHover={{ 
                                                    y: -1, 
                                                    backgroundColor: "rgba(0,0,0,0.1)",
                                                    transition: { duration: 0.2 } 
                                                  }}
                                                >
                                                  {tool}
                                                </motion.span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
}